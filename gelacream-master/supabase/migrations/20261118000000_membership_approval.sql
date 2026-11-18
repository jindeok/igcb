-- Apply once before deploying the updated app. Re-running preserves approval decisions.
begin;
lock table auth.users in share row exclusive mode;
lock table public.profiles in share row exclusive mode;

alter table public.profiles add column if not exists email text;
do $$
begin
  if not exists (select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'approval_status') then
    -- Only accounts that already exist at migration time are grandfathered in.
    alter table public.profiles add column approval_status text not null default 'approved'
      check (approval_status in ('pending', 'approved', 'rejected'));
    -- Do not recreate missing profiles: they may have been deliberately removed to disable access.
  end if;
end $$;
alter table public.profiles alter column approval_status set default 'pending';
alter table public.profiles add column if not exists approval_requested_at timestamptz;
alter table public.profiles add column if not exists reviewed_at timestamptz;
alter table public.profiles add column if not exists reviewed_by uuid references auth.users(id) on delete set null;
alter table public.profiles add column if not exists reviewer_name text;

-- Clients cannot approve themselves or change their role, even if an old policy allows updates.
revoke insert, update, delete on public.profiles from anon, authenticated;

create or replace function public.is_approved_member()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles p join auth.users u on u.id = p.id
    where p.id = auth.uid() and p.approval_status = 'approved' and u.email_confirmed_at is not null);
$$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid()
    and p.role = 'admin' and public.is_approved_member());
$$;
revoke all on function public.is_approved_member() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_approved_member(), public.is_admin() to authenticated;

-- Restrictive policy also covers any additional permissive read policies in production.
drop policy if exists recipes_membership_required on public.recipes;
create policy recipes_membership_required on public.recipes as restrictive for all
  to authenticated using (public.is_approved_member()) with check (public.is_approved_member());

create table if not exists public.approval_email_outbox (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('request', 'approved')),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  cancelled_at timestamptz,
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  lease_token uuid,
  last_error text,
  unique (applicant_id, recipient_id, kind)
);
alter table public.approval_email_outbox enable row level security;
revoke all on public.approval_email_outbox from anon, authenticated;
create index if not exists approval_email_unsent_idx on public.approval_email_outbox(available_at)
  where sent_at is null and cancelled_at is null;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email, role, approval_status)
  values (new.id, nullif(trim(new.raw_user_meta_data->>'full_name'), ''), new.email, 'staff', 'pending')
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.request_membership_approval()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email_confirmed_at is null then return new; end if;
  update public.profiles set approval_requested_at = coalesce(approval_requested_at, now()),
    full_name = coalesce(full_name, nullif(trim(new.raw_user_meta_data->>'full_name'), '')), email = new.email
    where id = new.id and approval_status = 'pending';
  if not found then return new; end if;
  insert into public.approval_email_outbox (applicant_id, recipient_id, kind)
    select new.id, p.id, 'request' from public.profiles p join auth.users u on u.id = p.id
    where p.role = 'admin' and p.approval_status = 'approved' and u.email_confirmed_at is not null
      and lower(u.email) in ('dayechoi0625@gmail.com', 'nsede90@gmail.com')
    on conflict do nothing;
  return new;
end $$;
-- Alphabetical order ensures the profile creation trigger runs first on INSERT.
drop trigger if exists zz_request_membership_approval on auth.users;
create trigger zz_request_membership_approval after insert or update of email_confirmed_at on auth.users
  for each row execute function public.request_membership_approval();

create or replace function public.list_membership_requests()
returns table (id uuid, full_name text, email text, requested_at timestamptz,
  approval_status text, reviewed_at timestamptz, reviewer_name text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception '관리자만 조회할 수 있습니다.' using errcode = '42501'; end if;
  return query select p.id, coalesce(p.full_name, u.raw_user_meta_data->>'full_name', ''), u.email,
    p.approval_requested_at, p.approval_status, p.reviewed_at, p.reviewer_name
    from public.profiles p join auth.users u on u.id = p.id
    where p.approval_requested_at is not null and u.email_confirmed_at is not null
    order by (p.approval_status = 'pending') desc, p.approval_requested_at desc;
end $$;

create or replace function public.review_membership_request(applicant uuid, decision text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  if not public.is_admin() then raise exception '관리자만 처리할 수 있습니다.' using errcode = '42501'; end if;
  if decision not in ('approved', 'rejected') or decision is null then raise exception '잘못된 처리입니다.'; end if;
  -- The conditional UPDATE locks the row: only the first administrator can decide.
  update public.profiles p set approval_status = decision, reviewed_at = now(), reviewed_by = auth.uid(),
    reviewer_name = (select coalesce(a.full_name, u.email) from public.profiles a
      join auth.users u on u.id = a.id where a.id = auth.uid())
    where p.id = applicant and p.approval_status = 'pending' and p.approval_requested_at is not null
      and exists(select 1 from auth.users u where u.id = p.id and u.email_confirmed_at is not null);
  get diagnostics changed = row_count;
  if changed = 0 then return false; end if;
  update public.approval_email_outbox set cancelled_at = now()
    where applicant_id = applicant and kind = 'request' and sent_at is null;
  if decision = 'approved' then
    insert into public.approval_email_outbox (applicant_id, recipient_id, kind)
      values (applicant, applicant, 'approved') on conflict do nothing;
  end if;
  return true;
end $$;
revoke all on function public.list_membership_requests() from public;
revoke all on function public.review_membership_request(uuid, text) from public;
grant execute on function public.list_membership_requests(), public.review_membership_request(uuid, text) to authenticated;

-- Worker RPCs are service-role only. Leases prevent concurrent workers sending the same item.
create or replace function public.claim_approval_emails(batch_size integer default 4)
returns table (id uuid, lease_token uuid, kind text, recipient_email text, applicant_email text, applicant_name text)
language plpgsql security definer set search_path = '' as $$
begin
  return query with candidates as (
    select o.id from public.approval_email_outbox o
    join public.profiles applicant on applicant.id = o.applicant_id
    join public.profiles recipient on recipient.id = o.recipient_id
    join auth.users r on r.id = recipient.id
    where o.sent_at is null and o.cancelled_at is null and o.available_at <= now() and o.attempts < 8
      and r.email_confirmed_at is not null
      and ((o.kind = 'request' and applicant.approval_status = 'pending' and recipient.role = 'admin'
        and recipient.approval_status = 'approved'
        and lower(r.email) in ('dayechoi0625@gmail.com', 'nsede90@gmail.com'))
        or (o.kind = 'approved' and applicant.approval_status = 'approved'))
    order by o.created_at limit greatest(1, least(batch_size, 4)) for update of o skip locked
  ), claimed as (
    update public.approval_email_outbox o set attempts = o.attempts + 1,
      available_at = now() + interval '2 minutes', lease_token = gen_random_uuid()
      from candidates c where o.id = c.id returning o.*
  ) select c.id, c.lease_token, c.kind, r.email, a.email,
      coalesce(p.full_name, a.raw_user_meta_data->>'full_name', '')
    from claimed c join auth.users r on r.id = c.recipient_id
    join auth.users a on a.id = c.applicant_id join public.profiles p on p.id = a.id;
end $$;
create or replace function public.finish_approval_email(mail_id uuid, token uuid, failure text default null)
returns void language sql security definer set search_path = '' as $$
  update public.approval_email_outbox o set sent_at = case when failure is null then now() else null end,
    last_error = left(failure, 200), lease_token = null,
    available_at = now() + make_interval(secs => least(3600, (60 * power(2, o.attempts))::integer))
    where o.id = mail_id and o.lease_token = token;
$$;
revoke all on function public.claim_approval_emails(integer) from public, anon, authenticated;
revoke all on function public.finish_approval_email(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.claim_approval_emails(integer), public.finish_approval_email(uuid, uuid, text) to service_role;
revoke all on function public.handle_new_user(), public.request_membership_approval() from public;
commit;
