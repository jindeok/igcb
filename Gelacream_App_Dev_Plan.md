# Gelacream Recipe App 개발 계획서

## 1. 프로젝트 개요
*   **프로젝트명**: Gelacream Master (가칭)
*   **목표**: 기존 Notion 기반의 레시피 데이터를 **Flutter**를 활용하여 시각적으로 아름답고 직관적인 모바일 앱으로 전환합니다. 단순한 정보 조회를 넘어, 매장 내 생산성을 높이고 브랜드 아이덴티티를 반영한 프리미엄 UX를 제공합니다.
*   **타겟 플랫폼**: Android, iOS (Cross-platform)
*   **주요 컨셉**: `Premium`, `Minimal`, `Intuitive`

---

## 2. 디자인 전략 (UI/UX)
**"Notion의 실용성에 감성을 더하다"**

*   **Design Language**:
    *   **Glassmorphism**: 배경에 은은한 블러 효과를 주어 재료의 신선함과 투명한 얼음(Sorbet)의 텍스처를 시각화.
    *   **Card UI**: 각 레시피를 카드 형태로 구성하여 가독성을 높이고, 탭할 때의 인터랙션을 강조.
    *   **Micro-interactions**: '좋아요', '자세히 보기', '체크리스트 완료' 시 부드러운 애니메이션 적용.
*   **Color Palette**:
    *   Primary: `Creamy White` & `Pastel Tones` (재료 고유의 색상 강조)
    *   Accent: `Vivid Orange` (중요 액션), `Deep Mint` (신뢰감)
    *   Dark Mode: 완벽 지원 (주방 조도에 따른 시인성 확보)
*   **Typography**: 가독성이 높은 San-serif 폰트 (Pretendard 또는 Google Fonts 'Inter') 사용.

---

## 3. 기술 스택 (Tech Stack)
*   **Frontend**: Flutter (Latest Stable)
*   **State Management**: Riverpod (유연하고 안전한 상태 관리)
*   **Backend / DB**: Firebase
    *   **Authentication**: 이메일/비밀번호 로그인 (관리자 계정 식별)
    *   **Firestore**: NoSQL 데이터베이스 (레시피 및 유저 데이터 저장)
    *   **Storage**: 레시피 이미지 저장
*   **ETC**:
    *   `go_router`: 직관적인 네비게이션 처리
    *   `animate_do` & `flutter_animate`: 화려한 UI 애니메이션

---

## 4. 데이터베이스 구조 (Firestore Schema)

### `users` collection
```json
{
  "uid": "string",
  "email": "string",
  "role": "admin" | "staff", // 관리자 여부 식별
  "name": "string",
  "createdAt": "timestamp"
}
```

### `recipes` collection
```json
{
  "id": "string",
  "title": "string", // e.g., "솔티크래커"
  "category": "milk" | "sorbet" | "vegan" | "alcohol",
  "tags": ["season_summer", "signature", "mixer_required"],
  "ingredients": [
    { "name": "우유", "quantity": "1000g" },
    { "name": "소금", "quantity": "10g" }
  ],
  "steps": [
    "모든 가루 재료를 체반에 거른다.",
    "우유와 혼합하여 믹서기에 돌린다."
  ],
  "purchaseLinks": [
    { "itemName": "프랑스산 소금", "url": "https://..." }
  ],
  "imageUrl": "string", // 대표 이미지 URL
  "updatedAt": "timestamp"
}
```

---

## 5. 단계별 개발 로드맵

### Phase 1: 프로젝트 셋업 및 UI 디자인 (Foundation)
*   Flutter 프로젝트 초기화 및 폴더 구조 설계 (feature-based).
*   디자인 시스템 구축 (Colors, Typography, Components).
*   **메인 대시보드 UI**: 카테고리별 탭 뷰, 헤더 애니메이션 구현.

### Phase 2: Firebase 연동 및 인증 (Authentication)
*   Firebase 프로젝트 설정.
*   **로그인/회원가입 UI** 구현.
*   RBAC(Role-Based Access Control) 로직 구현: 관리자 vs 일반 직원 권한 분리.

### Phase 3: 레시피 조회 및 상세 기능 (Core Features)
*   Firestore 레시피 데이터 모델링 및 더미 데이터 주입.
*   **레시피 리스트 뷰**: 필터링(계절, 베이스 등), 검색 기능.
*   **상세 페이지**:
    *   SliverAppBar를 활용한 확장형 헤더.
    *   재료 체크리스트 기능.
    *   외부 구매 링크 연결 (In-app WebView 또는 외부 브라우저).

### Phase 4: 관리자 기능 (Admin Features)
*   **레시피 등록/수정/삭제 (CRUD)** 기능 구현.
*   관리자 전용 FAB(Floating Action Button) 추가.
*   직관적인 입력 폼 UI (동적 필드 추가/삭제).

### Phase 5: 최종 최적화 (Polish)
*   스플래시 스크린(Splash Screen) 추가.
*   전반적인 애니메이션 다듬기 (Hero transition 등).
*   앱 아이콘 및 배포 준비.

---

## 6. 예상 화면 구성 (Key Screens)
1.  **Splash & Login**: 로고 애니메이션 → 이메일 로그인 폼.
2.  **Home**: 상단 '오늘의 추천/시즌 메뉴' 배너 + 하단 카테고리별 그리드 리스트.
3.  **Detail**: 상단 대형 이미지 + 하단 바텀 시트 스타일의 레시피 정보 (스크롤 시 확장).
4.  **Admin Editor**: 깔끔한 Input Field와 미리보기 기능을 제공하는 작성 화면.

이 계획서를 바탕으로 개발을 시작하시겠습니까? 승인하시면 **Phase 1 (프로젝트 셋업 및 기본 UI)**부터 즉시 착수하겠습니다.
