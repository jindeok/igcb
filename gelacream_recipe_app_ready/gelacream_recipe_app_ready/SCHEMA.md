# Gelacream Notion Export Schema

이 폴더는 Notion 원본 데이터를 앱에서 쓰기 쉬운 구조로 정리한 결과입니다.

## 주요 파일

- `app_data.json`: 앱에서 우선 참조할 정리된 데이터입니다.
- `image_manifest.json`: 내려받은 이미지/파일의 원본 URL과 로컬 파일 경로 매핑입니다.
- `manifest.json`: 전체 수집 결과 요약과 검증 정보입니다.
- `all_export.json`: Notion API 원본에 가까운 전체 백업 JSON입니다.
- `pages/*.json`: 페이지별 원본+정리 전 블록 백업입니다.
- `assets/*`: 이미지와 첨부 파일입니다.

## app_data.json 구조

- `schema_version`: 앱용 스키마 버전입니다.
- `source.root_page_id`: 내보내기를 시작한 최상위 Notion 페이지 ID입니다.
- `categories`: `우유베이스`, `소르베`, `비건`, `알코올` 4개 분류를 고정 키로 둡니다.
- `categories.{분류}.flavors`: 해당 분류 바로 아래의 맛 페이지 목록입니다.
- `categories.{분류}.flavor_names`: 해당 분류의 1단 맛 이름만 모은 배열입니다.
- `categories.{분류}.all_flavors_flat`: 2단 이상 하위 페이지까지 포함한 펼친 목록입니다.
- `categories.{분류}.flavors[].children`: 맛 페이지 안의 하위 페이지입니다. 2단 뎁스 이상이면 이 안에 재귀적으로 들어갑니다.
- `categories.{분류}.flavors[].content.sections`: 본문 블록을 순서대로 정리한 배열입니다.
- `categories.{분류}.flavors[].content.text_blocks`: 설명 문장만 블록 단위로 모은 배열입니다.
- `categories.{분류}.flavors[].detail_text`: 설명 문장을 줄바꿈으로 합친 문자열입니다.
- `categories.{분류}.flavors[].content.tables`: 페이지 안의 표만 따로 모은 배열입니다.
- `categories.{분류}.flavors[].content.images`: 페이지 안의 이미지/파일만 따로 모은 배열입니다.
- `categories.{분류}.flavors[].image_paths`: 해당 맛에서 바로 참조 가능한 로컬 이미지 경로 배열입니다.
- `images`: 전체 이미지/파일 매핑입니다. 각 항목의 `local_path`를 `assets` 폴더 기준으로 참조하면 됩니다.

## 맛 페이지 필드

- `page_id`: Notion 페이지 ID입니다.
- `name`: 맛 이름입니다.
- `category`: 소속 분류입니다.
- `path`: 최상위 페이지부터 현재 맛 페이지까지의 이름 경로입니다.
- `depth_from_category`: 분류 페이지 바로 아래면 `1`, 그 하위면 `2`입니다.
- `parent_names`: 2단 이상일 때 중간 부모 맛/그룹 이름입니다.
- `content.summary`: 표, 이미지, 하위 페이지 수를 빠르게 볼 수 있는 요약입니다.
- `tables`: `content.tables`의 바로가기입니다.
- `image_paths`: `content.image_paths`의 바로가기입니다.
- `detail_text`: `content.detail_text`의 바로가기입니다.

## 표 구조

`content.tables[].rows`는 2차원 배열입니다. Notion 표의 각 행이 배열 하나이고, 각 셀은 문자열입니다.

## 이미지 경로

`content.images[].local_path` 또는 `images[].local_path`는 이 export 폴더 기준 상대 경로입니다. 예: `assets/파일명.jpg`

## 재귀 탐색 확인

- `우유베이스`: found=True, top_level=64, recursive=64, max_depth=1
- `소르베`: found=True, top_level=48, recursive=48, max_depth=1
- `비건`: found=True, top_level=6, recursive=6, max_depth=1
- `알코올`: found=True, top_level=7, recursive=7, max_depth=1

`recursive_flavor_count`가 `top_level`보다 크거나 `max_depth`가 2 이상이면 하위 페이지까지 포함된 것입니다.
