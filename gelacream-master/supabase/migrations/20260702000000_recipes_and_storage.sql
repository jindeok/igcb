-- ─────────────────────────────────────────────────────────────
-- Gelacream: recipes 테이블 + RLS + 이미지 Storage
-- Supabase SQL Editor(Dashboard → SQL → New query) 또는 CLI(supabase db push)로 실행.
-- 멱등(idempotent)하게 작성되어 여러 번 실행해도 안전합니다.
-- 실행 순서: (1) 이 마이그레이션 → (2) scripts/upload_images_to_storage.mjs 로 이미지 업로드
--            → (3) seed_recipes.sql 로 125개 레시피 시드
-- ─────────────────────────────────────────────────────────────

-- 관리자 여부 헬퍼: profiles.role = 'admin' 인지 확인.
-- SECURITY DEFINER 로 두어 RLS 재귀를 피합니다.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
    );
$$;

-- ── recipes 테이블 ───────────────────────────────────────────
create table if not exists public.recipes (
    id                  text primary key,
    title               text not null,
    category            text not null,
    description         text,
    hardness            integer,
    tags                jsonb not null default '[]'::jsonb,
    ingredient_groups   jsonb not null default '[]'::jsonb,
    step_groups         jsonb not null default '[]'::jsonb,
    notes               jsonb not null default '[]'::jsonb,
    images              jsonb not null default '[]'::jsonb,  -- 재료 구매 참고 사진 [{src, caption?}]
    instruction_images  jsonb not null default '[]'::jsonb,  -- 만드는 순서 작업 도식 [{src, caption?}]
    purchase_links      jsonb not null default '[]'::jsonb,  -- [{item, url}]
    image_color         text,
    sort_order          integer not null default 0,
    created_by          uuid references auth.users (id) on delete set null,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

-- 카테고리 제약(이미 있으면 건너뜀)
do $$ begin
    alter table public.recipes
        add constraint recipes_category_check
        check (category in ('milk', 'sorbet', 'vegan', 'alcohol'));
exception
    when duplicate_object then null;
end $$;

-- 구버전(평면 ingredients/steps 컬럼)이 이미 있는 경우: 신규 스키마는 이를 쓰지 않으므로
-- 시드/저장 시 NOT NULL 제약에 걸리지 않도록 제약을 완화한다(데이터는 보존).
do $$ begin
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'recipes' and column_name = 'ingredients') then
        alter table public.recipes alter column ingredients drop not null;
    end if;
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'recipes' and column_name = 'steps') then
        alter table public.recipes alter column steps drop not null;
    end if;
end $$;

-- 구버전(평면 ingredients/steps 컬럼)에서 올라오는 경우를 위한 컬럼 보강
alter table public.recipes add column if not exists hardness integer;
alter table public.recipes add column if not exists ingredient_groups jsonb not null default '[]'::jsonb;
alter table public.recipes add column if not exists step_groups jsonb not null default '[]'::jsonb;
alter table public.recipes add column if not exists notes jsonb not null default '[]'::jsonb;
alter table public.recipes add column if not exists images jsonb not null default '[]'::jsonb;
alter table public.recipes add column if not exists instruction_images jsonb not null default '[]'::jsonb;
alter table public.recipes add column if not exists sort_order integer not null default 0;
alter table public.recipes add column if not exists updated_at timestamptz not null default now();

create index if not exists recipes_category_sort_idx on public.recipes (category, sort_order);

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at
    before update on public.recipes
    for each row execute procedure public.set_updated_at();

-- ── RLS: 로그인 사용자는 읽기, 관리자만 쓰기 ──────────────────
alter table public.recipes enable row level security;

drop policy if exists "recipes_select_authenticated" on public.recipes;
create policy "recipes_select_authenticated"
    on public.recipes for select
    to authenticated
    using (true);

drop policy if exists "recipes_insert_admin" on public.recipes;
create policy "recipes_insert_admin"
    on public.recipes for insert
    to authenticated
    with check (public.is_admin());

drop policy if exists "recipes_update_admin" on public.recipes;
create policy "recipes_update_admin"
    on public.recipes for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

drop policy if exists "recipes_delete_admin" on public.recipes;
create policy "recipes_delete_admin"
    on public.recipes for delete
    to authenticated
    using (public.is_admin());

-- ── 이미지 Storage 버킷 ──────────────────────────────────────
-- public = true → 공개 URL 로 누구나 읽기 가능(레시피 이미지 표시용).
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do update set public = true;

-- 공개 읽기
drop policy if exists "recipe_images_public_read" on storage.objects;
create policy "recipe_images_public_read"
    on storage.objects for select
    to public
    using (bucket_id = 'recipe-images');

-- 관리자만 업로드/수정/삭제
drop policy if exists "recipe_images_admin_insert" on storage.objects;
create policy "recipe_images_admin_insert"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'recipe-images' and public.is_admin());

drop policy if exists "recipe_images_admin_update" on storage.objects;
create policy "recipe_images_admin_update"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'recipe-images' and public.is_admin())
    with check (bucket_id = 'recipe-images' and public.is_admin());

drop policy if exists "recipe_images_admin_delete" on storage.objects;
create policy "recipe_images_admin_delete"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'recipe-images' and public.is_admin());
