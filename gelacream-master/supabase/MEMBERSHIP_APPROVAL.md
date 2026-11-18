# 회원 가입 승인

## 동작

- 마이그레이션 시 존재하는 프로필은 `approved`로 유지한다. 역할 변경이나 재승인은 없다.
- 프로필을 삭제하여 사용 중지한 계정은 복구하지 않는다.
- 신규 계정은 `staff/pending`. 이메일 인증 완료 시 승인 목록과 메일 큐에 등록한다.
- 최다예(`dayechoi0625@gmail.com`), 이경민(`nsede90@gmail.com`)이 현재 승인된 관리자일 때만 승인 요청 메일을 받는다.
- 웹앱의 모든 승인된 관리자는 `/admin/members`에서 승인/거절할 수 있다. 알림 수신 대상과 승인 권한은 분리한다.
- 먼저 확정한 관리자 한 명의 결정만 반영한다. 처리자/처리시간을 기록하며 일반 사용자는 자신을 승인할 수 없다.
- 대기 사용자는 15초마다 상태를 확인하며 수동 확인도 가능하다. 기존 회원은 5분마다 갱신한다.
- 승인된 사용자에게 승인 완료 메일도 큐에 등록한다. 신규 가입 1건당 승인 요청 2통 + 승인 완료 1통이다.
- 메일의 링크는 관리자 페이지로 연결한다. 로그인하지 않았다면 로그인 후 원래 페이지로 이동한다. 링크를 열기만 해서는 승인되지 않는다.
- DB에서 승인을 확인하므로 구버전 클라이언트나 직접 API 호출도 레시피를 조회할 수 없다. 프런트엔드 레시피 폴백은 제거했다.

## 배포 순서

1. `npm ci`, `npm test`, `npm run typecheck`, `npm run build:web`를 실행한다.
2. 운영 SQL Editor에서 `migrations/20261118000000_membership_approval.sql`을 실행한다. 기존 역할과 행 개수를 먼저 기록해 둔다. 이 파일은 트랜잭션 단위로 적용되며 재실행해도 신규 대기/거절 상태는 바뀌지 않는다.
3. 새 웹앱을 배포한다. 새 앱은 `approval_status`를 요구하므로 반드시 DB 변경이 먼저다.
4. Netlify의 기존 사이트에 Git 저장소 `jindeok/igcb`, 운영 브랜치 `main`, base directory `gelacream-master`, build `npm run build:web`, publish `dist`가 연결되어 있는지 확인한다. 단순히 GitHub에 push했다고 자동 연결되는 것은 아니다.
5. 아래 서버 환경변수를 설정한 뒤 재배포한다. 스케줄 함수 `approval-mail`이 운영 배포에 포함되어야 한다. 정적 `dist` 폴더만 수동 업로드하면 메일 함수가 배포되지 않는다.

## 도메인 없는 SMTP 연결 (네이버/Gmail 기존 계정)

Netlify > Project configuration > Environment variables에서 **Functions 범위**로 설정한다.
실제 값은 저장소, 채팅, `EXPO_PUBLIC_*` 환경변수에 넣지 않는다.

| 변수 | 값 |
| --- | --- |
| `SUPABASE_URL` | 기존 Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 service-role/secret key (공개 publishable key 사용 금지) |
| `APP_URL` | `https://igcbrcp.netlify.app` |
| `MAIL_FROM` | `IGCB <실제발신계정@naver.com>` |
| `SMTP_HOST` | 네이버: `smtp.naver.com`, Gmail: `smtp.gmail.com` |
| `SMTP_PORT` | `465` (SSL), 또는 `587` (STARTTLS 필수) |
| `SMTP_USER` | 실제 발신 이메일 주소 |
| `SMTP_PASS` | 발신 계정에서 생성한 전용 앱 비밀번호 |

네이버는 본인이 2단계 인증과 SMTP 사용 설정 후 앱 비밀번호를 생성해야 한다.
Gmail도 2단계 인증 후 앱 비밀번호를 사용하며 계정 정책에 따라 제공되지 않을 수 있다.
개인 메일 서비스의 전송 제한과 Netlify Functions 사용 한도가 적용된다. 별도 유료 상품에 가입할 필요는 없지만 무제한 무료 발송은 아니다.

회사 도메인을 나중에 연결한다면 SMTP 대신 `RESEND_API_KEY`와 인증한 도메인의 `MAIL_FROM`도 지원한다.
SMTP와 Resend가 모두 설정되면 SMTP를 우선한다.

## 메일 운영 및 검증

- Netlify 예약 함수가 5분마다 최대 4통씩 처리한다. 예약 함수는 공개 HTTP 호출로 실행할 수 없다.
- 발송 설정이 없으면 큐를 소비하지 않으며 `not_configured`를 기록한다. 가입/승인 자체는 정상 동작한다.
- 발송 실패는 최대 8번 재시도한다. 만료된 작업 임대는 다음 실행에서 회수한다.
- Resend에는 메일 ID 기반 중복 방지 키를 전달한다. SMTP에는 고정 Message-ID를 사용하지만 SMTP 서버가 수락한 직후 DB 기록이 실패하면 중복 도착할 수 있다.
- Supabase SQL Editor에서 다음 쿼리로 상태를 확인한다. 일반 앱 사용자는 이 큐를 조회할 수 없다.

```sql
select kind, attempts, created_at, sent_at, cancelled_at, last_error
from public.approval_email_outbox order by created_at desc;
```

발송 실패 원인을 수정한 후 최종 실패 건을 재시도하려면 운영자가 해당 행의 `attempts = 0`, `available_at = now()`로 설정한다.
메일 요청은 `auth.users.email_confirmed_at`의 DB 변경에서 만들어지므로 사용자가 앱을 다시 방문할 필요가 없다.

실메일 설정 후 새 테스트 계정 신청 → 이메일 인증 → 두 관리자 수신 확인 → 관리자 로그인 → 승인 → 테스트 계정 레시피 조회 및 승인 메일 수신을 확인한다.
메일 설정을 하지 않은 상태의 테스트는 실제 수신 성공으로 기록하지 않는다.

## 보호 범위

가입 승인은 DB 레시피와 앱 화면에 적용된다. 기존 공개 이미지 버킷과 이미 배포된 정적 이미지 URL은 이 변경으로 비공개 전환하지 않는다. 이미지 자체도 로그인으로 보호하려면 별도 Storage 비공개 전환 및 서명 URL 작업이 필요하다.
