import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const old = '10000000-0000-0000-0000-000000000001';
const admin1 = '10000000-0000-0000-0000-000000000002';
const admin2 = '10000000-0000-0000-0000-000000000003';
const applicant = '10000000-0000-0000-0000-000000000004';
const rejected = '10000000-0000-0000-0000-000000000005';
const unverified = '10000000-0000-0000-0000-000000000006';
const grandfathered = '10000000-0000-0000-0000-000000000007';
const file = path => readFile(new URL(path, import.meta.url), 'utf8');

test('manual membership approval, grandfathering, server authorization and repeat deployment', async () => {
    const db = new PGlite();
    const rows = async (sql, args) => (await db.query(sql, args)).rows;
    const asUser = async id => {
        await db.exec('reset role');
        await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
        await db.exec('set role authenticated');
    };
    try {
        await db.exec(`
            create role anon; create role authenticated; create role service_role bypassrls;
            create schema auth;
            create table auth.users(id uuid primary key, email varchar(255), email_confirmed_at timestamptz, raw_user_meta_data jsonb default '{}');
            create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid$$;
            grant usage on schema public, auth to authenticated, anon, service_role;
            grant execute on function auth.uid() to authenticated;
        `);
        await db.exec(await file('../supabase/migrations/20250413000000_profiles_and_rls.sql'));
        await db.exec(`
            create table public.recipes(id text primary key);
            insert into public.recipes values ('protected-recipe');
            alter table public.recipes enable row level security;
            create policy recipes_select_authenticated on public.recipes for select to authenticated using (true);
            grant select on public.recipes, public.profiles to authenticated;
            -- Simulate an overly broad legacy UPDATE grant; migration must revoke it.
            grant update on public.profiles to authenticated;
            insert into auth.users(id,email,email_confirmed_at) values
              ('${old}', 'old@example.com', now()),
              ('${admin1}', 'dayechoi0625@gmail.com', now()),
              ('${admin2}', 'nsede90@gmail.com', now()),
              ('${grandfathered}', 'missing-profile@example.com', now());
            update public.profiles set role = 'admin' where id in ('${admin1}', '${admin2}');
            delete from public.profiles where id = '${grandfathered}';
        `);
        const migration = await file('../supabase/migrations/20261118000000_membership_approval.sql');
        const manualOnly = await file('../supabase/migrations/20261118010000_manual_approval_only.sql');
        await db.exec(migration);
        await db.exec(manualOnly);
        assert.equal((await rows("select to_regclass('public.approval_email_outbox') as queue"))[0].queue, null, 'no mail infrastructure required');
        assert.equal((await rows("select count(*)::int as n from public.profiles where approval_status = 'approved'"))[0].n, 3);
        assert.equal((await rows('select * from public.profiles where id = $1', [grandfathered])).length, 0, 'disabled profiles are never recreated');
        await asUser(old);
        assert.equal((await rows('select * from public.recipes')).length, 1, 'old member retains access');
        await db.exec('reset role');
        await db.query(`insert into auth.users (id,email,raw_user_meta_data) values ($1, 'new@example.com', '{"full_name":"신규 가입자","role":"admin","approval_status":"approved"}')`, [applicant]);
        assert.deepEqual((await rows('select role, approval_status from public.profiles where id = $1', [applicant]))[0], { role: 'staff', approval_status: 'pending' });
        assert.equal((await rows('select approval_requested_at from public.profiles where id = $1', [applicant]))[0].approval_requested_at, null, 'not listed before verification');
        await db.query('update auth.users set email_confirmed_at = now() where id = $1', [applicant]);
        await db.query('update auth.users set email_confirmed_at = email_confirmed_at where id = $1', [applicant]);
        assert.ok((await rows('select approval_requested_at from public.profiles where id = $1', [applicant]))[0].approval_requested_at, 'verification registers request without mail');
        await asUser(applicant);
        assert.equal((await rows('select * from public.recipes')).length, 0, 'pending member cannot query recipes directly');
        await assert.rejects(rows('select * from public.list_membership_requests()'), /관리자/);
        await assert.rejects(rows("select public.review_membership_request($1, 'approved')", [applicant]), /관리자/);
        await assert.rejects(rows("update public.profiles set approval_status = 'approved' where id = $1", [applicant]), /permission denied/);
        await asUser(admin1);
        assert.equal((await rows('select * from public.list_membership_requests()')).length, 1);
        await assert.rejects(rows("select public.review_membership_request($1, 'invalid')", [applicant]), /잘못된/);
        await asUser(admin1);
        assert.equal((await rows("select public.review_membership_request($1, 'approved') as changed", [applicant]))[0].changed, true);
        await asUser(admin2);
        assert.equal((await rows("select public.review_membership_request($1, 'rejected') as changed", [applicant]))[0].changed, false, 'second administrator cannot override first decision');
        await asUser(applicant);
        assert.equal((await rows('select * from public.recipes')).length, 1, 'approval grants normal staff read access');
        await db.exec('reset role');
        await db.query("insert into auth.users(id,email,email_confirmed_at) values ($1,'rejected@example.com',now())", [rejected]);
        await db.query("insert into auth.users(id,email) values ($1,'unverified@example.com')", [unverified]);
        await asUser(admin2);
        assert.equal((await rows("select public.review_membership_request($1, 'approved') as changed", [unverified]))[0].changed, false, 'unverified applicant cannot be approved');
        assert.equal((await rows("select public.review_membership_request($1, 'rejected') as changed", [rejected]))[0].changed, true);
        await asUser(rejected);
        assert.equal((await rows('select * from public.recipes')).length, 0, 'rejected member cannot read recipes');
        await db.exec('reset role');
        await db.exec(migration);
        await db.exec(manualOnly);
        assert.equal((await rows('select approval_status from public.profiles where id = $1', [unverified]))[0].approval_status, 'pending', 'migration rerun never approves new users');
        assert.equal((await rows('select approval_status from public.profiles where id = $1', [rejected]))[0].approval_status, 'rejected');
        await db.exec('set role anon');
        await assert.rejects(rows('select * from public.list_membership_requests()'), /permission denied/);
    } finally { await db.close(); }
});
