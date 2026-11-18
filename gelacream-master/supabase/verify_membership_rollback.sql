-- Production smoke test: all test users, decisions, and emails are rolled back.
-- Uses the two existing administrators without changing their accounts.
begin;
insert into auth.users (id, email, raw_user_meta_data)
values ('fe132e70-0000-4000-8000-000000000001', 'membership-smoke@example.invalid',
  '{"full_name":"가입 승인 검증","role":"admin","approval_status":"approved"}');
do $$ begin
  if not exists(select 1 from public.profiles where id = 'fe132e70-0000-4000-8000-000000000001'
    and role = 'staff' and approval_status = 'pending' and approval_requested_at is null) then
    raise exception '신규 계정 기본 상태 검증 실패';
  end if;
  if exists(select 1 from public.approval_email_outbox where applicant_id = 'fe132e70-0000-4000-8000-000000000001') then
    raise exception '이메일 인증 전 알림 생성됨';
  end if;
end $$;
update auth.users set email_confirmed_at = now() where id = 'fe132e70-0000-4000-8000-000000000001';
do $$ begin
  if (select count(*) from public.approval_email_outbox where applicant_id = 'fe132e70-0000-4000-8000-000000000001' and kind = 'request') <> 2 then
    raise exception '두 관리자 알림 생성 검증 실패';
  end if;
end $$;
select set_config('request.jwt.claim.sub', 'fe132e70-0000-4000-8000-000000000001', true);
set local role authenticated;
do $$ begin
  if exists(select 1 from public.recipes) then raise exception '승인 전 레시피 노출'; end if;
  begin
    perform public.review_membership_request('fe132e70-0000-4000-8000-000000000001', 'approved');
    raise exception '본인 승인 허용됨';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
select set_config('request.jwt.claim.sub', '641b0d5c-a1d7-4378-a0e7-a0299011fd29', true);
set local role authenticated;
do $$ begin
  if not public.review_membership_request('fe132e70-0000-4000-8000-000000000001', 'approved') then
    raise exception '관리자 승인 실패';
  end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub', 'adf730e2-d63a-4e75-8c73-fe76794a5553', true);
set local role authenticated;
do $$ begin
  if public.review_membership_request('fe132e70-0000-4000-8000-000000000001', 'rejected') then
    raise exception '다른 관리자가 처리 결과를 덮어씀';
  end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub', 'fe132e70-0000-4000-8000-000000000001', true);
set local role authenticated;
do $$ begin
  if not exists(select 1 from public.recipes) then raise exception '승인 후 레시피 조회 실패'; end if;
end $$;
reset role;
select 'PASS: 신규 대기, 이메일 인증 후 알림 2건, 승인 전 차단, 본인 승인 불가, 관리자 1명 승인, 중복 처리 방지, 승인 후 조회' as live_verification;
rollback;
