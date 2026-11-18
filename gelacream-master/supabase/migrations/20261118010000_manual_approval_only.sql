-- Final workflow: administrators review requests in the web app; no notification mail service.
begin;
-- auth.users.email is varchar(255) in production; explicit casts match the RPC return type.
create or replace function public.list_membership_requests()
returns table (id uuid, full_name text, email text, requested_at timestamptz,
  approval_status text, reviewed_at timestamptz, reviewer_name text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception '관리자만 조회할 수 있습니다.' using errcode = '42501'; end if;
  return query select p.id, coalesce(p.full_name, u.raw_user_meta_data->>'full_name', '')::text, u.email::text,
    p.approval_requested_at, p.approval_status, p.reviewed_at, p.reviewer_name
    from public.profiles p join auth.users u on u.id = p.id
    where p.approval_requested_at is not null and u.email_confirmed_at is not null
    order by (p.approval_status = 'pending') desc, p.approval_requested_at desc;
end $$;
create or replace function public.request_membership_approval()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email_confirmed_at is null then return new; end if;
  update public.profiles set approval_requested_at = coalesce(approval_requested_at, now()),
    full_name = coalesce(full_name, nullif(trim(new.raw_user_meta_data->>'full_name'), '')), email = new.email
    where id = new.id and approval_status = 'pending';
  return new;
end $$;
create or replace function public.review_membership_request(applicant uuid, decision text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  if not public.is_admin() then raise exception '관리자만 처리할 수 있습니다.' using errcode = '42501'; end if;
  if decision not in ('approved', 'rejected') or decision is null then raise exception '잘못된 처리입니다.'; end if;
  update public.profiles p set approval_status = decision, reviewed_at = now(), reviewed_by = auth.uid(),
    reviewer_name = (select coalesce(a.full_name, u.email) from public.profiles a
      join auth.users u on u.id = a.id where a.id = auth.uid())
    where p.id = applicant and p.approval_status = 'pending' and p.approval_requested_at is not null
      and exists(select 1 from auth.users u where u.id = p.id and u.email_confirmed_at is not null);
  get diagnostics changed = row_count;
  return changed > 0;
end $$;
drop function if exists public.claim_approval_emails(integer);
drop function if exists public.finish_approval_email(uuid, uuid, text);
-- Remove only an empty rollout queue. Preserve any real delivery history without producers/workers.
do $$ begin
  if to_regclass('public.approval_email_outbox') is not null then
    if not exists(select 1 from public.approval_email_outbox) then
      drop table public.approval_email_outbox;
    else
      comment on table public.approval_email_outbox is 'Archived email rollout history; email sending disabled.';
    end if;
  end if;
end $$;
commit;
