# Gelacream 백엔드(Supabase) 설정

레시피 데이터의 **소스 오브 트루스는 Supabase DB**입니다. 앱은 DB에 레시피가 있으면 그것을,
비어 있으면 `constants/MockData.ts`(오프라인 폴백)를 보여줍니다.

> ⚠️ 중요: DB `recipes` 테이블이 **비어 있을 때만** MockData가 표시됩니다. 관리자가 레시피를
> 하나라도 저장하면 그때부터 DB만 보이므로, **반드시 아래 시드를 먼저 넣어** 125개를 채운 뒤
> 편집을 시작하세요. (그렇지 않으면 저장한 1개만 남고 나머지가 사라진 것처럼 보입니다.)

## 파일

- `migrations/20250413000000_profiles_and_rls.sql` — 사용자 프로필/역할(admin·staff)
- `migrations/20260702000000_recipes_and_storage.sql` — recipes 테이블 + RLS + 이미지 Storage 버킷/정책
- `seed_recipes.sql` — 125개 레시피 초기 데이터 (자동 생성물, `scripts/convert_notion_export.py` 출력)

## 최초 설정 순서

### 1) 환경변수

`gelacream-master/.env` 생성 (`.env.example` 복사):

```
EXPO_PUBLIC_SUPABASE_URL=https://<프로젝트>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

### 2) 스키마 마이그레이션 적용

**방법 A — 대시보드(간단):** Supabase 대시보드 → SQL Editor → 아래 두 파일 내용을 차례로 붙여넣고 실행
1. `migrations/20250413000000_profiles_and_rls.sql`
2. `migrations/20260702000000_recipes_and_storage.sql`

**방법 B — CLI:**
```bash
cd gelacream-master
npx supabase link --project-ref <프로젝트 REF>
npx supabase db push
```

### 3) 이미지 업로드 (Storage)

`public/recipe-images/`의 91장을 `recipe-images` 버킷으로 올립니다.
service role 키는 대시보드 → Project Settings → API → `service_role` 에서 확인:

```bash
cd gelacream-master
SUPABASE_URL="https://<프로젝트>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service_role key>" \
node ../scripts/upload_images_to_storage.mjs
```

### 4) 레시피 시드 주입

대시보드 SQL Editor 에 `seed_recipes.sql` 붙여넣고 실행. (멱등 upsert — 다시 실행하면 최신 초안으로 덮어씀)

### 5) 관리자 계정 지정

가입(회원가입)한 뒤, 대시보드 SQL Editor 에서:
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = '본인이메일@example.com');
```

## 이후 운영

- **관리자 추가/수정/삭제**: 앱 로그인(admin) → 각 화면의 Edit/삭제/＋ 버튼. DB에 바로 반영됩니다.
  이미지도 편집 화면에서 업로드/삭제하면 Storage에 반영됩니다.
- **RLS**: 로그인 사용자는 읽기만, 쓰기(추가·수정·삭제)는 admin 역할만 가능.
- **Notion 원본을 대량 갱신**했을 때만 `scripts/convert_notion_export.py`를 재실행해 `MockData.ts`·
  `seed_recipes.sql`을 다시 만들고, 시드를 재주입하세요. (관리자가 앱에서 직접 고친 내용은 시드
  재주입 시 덮어써지므로 주의 — 평상시 운영은 앱 편집으로만 하면 됩니다.)
