-- Run in Supabase SQL Editor (Dashboard → SQL → New query) or via Supabase CLI.
-- Creates profiles linked to auth.users with roles admin | staff (default staff).

-- Enum for app roles
do $$ begin
    create type public.user_role as enum ('admin', 'staff');
exception
    when duplicate_object then null;
end $$;

create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    full_name text,
    role public.user_role not null default 'staff',
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Each user can read their own profile (role + name for the app)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
    on public.profiles
    for select
    to authenticated
    using (auth.uid() = id);

-- New auth users get a profile row (default role: staff)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, full_name, role)
    values (
        new.id,
        nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
        'staff'
    );
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute procedure public.handle_new_user();

-- Promote a user to admin (run once per admin email after they sign up):
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
