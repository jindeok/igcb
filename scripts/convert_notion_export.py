#!/usr/bin/env python3
"""Notion export(gelacream_recipe_app_ready) → constants/MockData.ts 변환 스크립트.

사용법:
    python3 scripts/convert_notion_export.py [EXPORT_DIR]

EXPORT_DIR 기본값: ~/Downloads/gelacream_recipe_app_ready

수행 내용:
  - app_data.json의 4개 분류(우유베이스/소르베/비건/알코올)를 앱 카테고리로 매핑
  - 페이지 본문을 경도값 / 배합표(ingredientGroups) / 만드는 순서(steps) / 참고사항(notes)으로 분해
  - Notion이 만들어낸 반복 블록 노이즈를 퍼지 중복제거
  - '태그' 속성 → tags, '파일과 미디어' 속성 사진 → public/recipe-images/ 복사 후 images
  - 결과를 gelacream-master/constants/MockData.ts 로 출력
"""
import difflib
import json
import re
import shutil
import sys
import unicodedata
from pathlib import Path
from urllib.parse import unquote

REPO = Path(__file__).resolve().parent.parent
APP_DIR = REPO / "gelacream-master"
EXPORT_DIR = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else Path("~/Downloads/gelacream_recipe_app_ready").expanduser()
IMG_OUT = APP_DIR / "public" / "recipe-images"
TS_OUT = APP_DIR / "constants" / "MockData.ts"
SEED_OUT = APP_DIR / "supabase" / "seed_recipes.sql"
SEED_JSON_OUT = APP_DIR / "supabase" / "seed_recipes.json"

CATEGORY_MAP = {
    "우유베이스": "milk",
    "소르베": "sorbet",
    "비건": "vegan",
    "알코올": "alcohol",
}

PALETTES = {
    "milk": ["#FFF8E1", "#FDF3E7", "#FFF3E0", "#FBEFE3", "#FFF9EC"],
    "sorbet": ["#FFEBEE", "#FCE4EC", "#FFF3E0", "#E3F2FD", "#F1F8E9", "#FFF8E1"],
    "vegan": ["#E8F5E9", "#F1F8E9", "#E0F2F1"],
    "alcohol": ["#F3E5F5", "#EDE7F6", "#EFEBE9"],
}

HARDNESS_RE = re.compile(r"머신\s*경도\s*값?\s*[:：]?\s*(\d+)")
STEP_NUM_RE = re.compile(r"^\s*(\d+)\s*[.)]\s*")
JUNK_IMAGE_MARKERS = ("wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAO", "solid_beige")


def norm_text(t: str) -> str:
    t = STEP_NUM_RE.sub("", t)
    t = re.sub(r"[\s\W_]+", "", t, flags=re.UNICODE)
    return t.lower()


def clean_text(t: str) -> str:
    t = t.replace(" ", " ")
    t = re.sub(r"\n{2,}", "\n", t)
    lines = [ln.strip() for ln in t.split("\n")]
    return "\n".join(ln for ln in lines if ln).strip()


class PageDedup:
    """페이지 내에서 사실상 동일한 텍스트 블록(반복 붙여넣기 노이즈)을 걸러낸다."""

    def __init__(self):
        self.seen = []

    def is_dup(self, text: str) -> bool:
        n = norm_text(text)
        if not n:
            return True
        for prev in self.seen:
            if n == prev:
                return True
            if len(n) > 8 and difflib.SequenceMatcher(None, n, prev).ratio() >= 0.82:
                return True
        self.seen.append(n)
        return False


def load_page_properties(pages_dir: Path):
    """page_id → {'tags': [...], } (Notion '태그' multi_select)."""
    props = {}
    for fp in pages_dir.glob("*.json"):
        try:
            data = json.loads(fp.read_text(encoding="utf-8"))
        except Exception:
            continue
        pid = data.get("id") or data.get("page", {}).get("id")
        page_props = (data.get("page") or {}).get("properties") or {}
        tags = []
        for v in page_props.values():
            if v.get("type") == "multi_select":
                tags = [t["name"] for t in v["multi_select"]]
        if pid:
            props[pid] = {"tags": tags}
    return props


def extract_purchase_links(pages_dir: Path):
    """page_id → [{item, url}] : 본문 rich_text의 외부 링크."""
    links = {}
    for fp in pages_dir.glob("*.json"):
        try:
            data = json.loads(fp.read_text(encoding="utf-8"))
        except Exception:
            continue
        pid = data.get("id") or data.get("page", {}).get("id")
        found = []

        def walk(blocks):
            for b in blocks:
                t = b.get("type")
                v = b.get(t) or {}
                if isinstance(v, dict):
                    for rt in v.get("rich_text", []) or []:
                        href = rt.get("href")
                        if href and href.startswith("http") and "notion" not in href:
                            label = (rt.get("plain_text") or "").strip()
                            if not label or label.startswith("http"):
                                label = "구매 참고 링크 열기"
                            found.append({"item": label, "url": href})
                if b.get("children"):
                    walk(b["children"])

        walk(data.get("blocks", []))
        if pid and found:
            dedup = []
            seen = set()
            for l in found:
                if l["url"] not in seen:
                    seen.add(l["url"])
                    dedup.append(l)
            links[pid] = dedup
    return links


def clean_cell(c: str) -> str:
    c = (c or "").strip()
    if c.lower() in ("untitled", "untitled "):
        return ""
    return c


def looks_like_label(cell: str) -> bool:
    """배합량 컬럼 라벨 후보: 숫자 위주 수량이 아닌 문구."""
    if not cell:
        return False
    if re.fullmatch(r"[\d,.\s~\-+/()gkg팩개L]+", cell):
        return False
    return True


def parse_table(rows, pending_title):
    """표 → (IngredientGroup dict 리스트, 사용되지 않은 pending_title)."""
    rows = [[clean_cell(c) for c in r] for r in rows]
    rows = [r for r in rows if any(r)]
    if not rows:
        return [], pending_title

    # 4열 표가 [이름, 수량, 이름, 수량] 두 레시피 병렬 구조인 경우 분리 (예: 실론티 | 얼그레이)
    ncols_all = max(len(r) for r in rows)
    if ncols_all == 4:
        padded = [list(r) + [""] * (4 - len(r)) for r in rows]
        first = padded[0]
        if first[0] and first[2] and not first[1] and not first[3]:
            left = [[r[0], r[1]] for r in padded[1:]]
            right = [[r[2], r[3]] for r in padded[1:]]
            groups = []
            g1, _ = parse_table(left, first[0])
            g2, _ = parse_table(right, first[2])
            groups.extend(g1)
            groups.extend(g2)
            if groups:
                return groups, pending_title

    title = None
    unused_pending = None
    if pending_title:
        title = pending_title

    # 첫 행이 <제목> 형태이거나 수량 없는 단독 텍스트면 그룹 제목으로 처리
    first = rows[0]
    if first[0] and not any(first[1:]):
        m = re.fullmatch(r"[<〈]\s*(.+?)\s*[>〉]", first[0])
        own_title = m.group(1) if m else first[0]
        if title and own_title != title:
            unused_pending = pending_title
        title = own_title
        rows = rows[1:]
    elif first[0].startswith("<") and first[0].endswith(">"):
        if title:
            unused_pending = pending_title
        title = first[0].strip("<>").strip()
        rows = rows[1:]

    if not rows:
        return [], unused_pending

    ncols = max(len(r) for r in rows)
    columns = None
    if ncols > 2:
        first = rows[0] + [""] * (ncols - len(rows[0]))
        amount_cells = [c for c in first[1:] if c]
        # 첫 행이 수량 라벨 헤더인 경우 (예: ['', '1바트이상', '평평한 1바트'])
        if amount_cells and all(looks_like_label(c) for c in amount_cells) and (
            not first[0] or looks_like_label(first[0])
        ):
            if not first[0]:
                columns = [c or f"배합 {i+1}" for i, c in enumerate(first[1:])]
                rows = rows[1:]
            elif not any(ch.isdigit() for ch in "".join(first[1:])):
                # ['라벤더 시럽','1,400','1,600'] 같은 행은 데이터 행이므로 제외
                columns = [c or f"배합 {i+1}" for i, c in enumerate(first[1:])]
                rows = rows[1:]

    ingredients = []
    for r in rows:
        r = list(r) + [""] * (ncols - len(r))
        name = r[0]
        amounts = [c for c in r[1:] if c]
        if not name and not amounts:
            continue
        if not name:
            name = "-"
        ing = {"name": name}
        if ncols > 2:
            vals = [clean_cell(c) for c in r[1:]]
            while vals and not vals[-1]:
                vals.pop()
            if len([v for v in vals if v]) > 1:
                ing["amounts"] = vals
            elif amounts:
                ing["amount"] = amounts[0]
        elif amounts:
            ing["amount"] = amounts[0]
        ingredients.append(ing)

    if not ingredients:
        return [], unused_pending
    group = {"ingredients": ingredients}
    if title:
        group["title"] = re.sub(r"^[>›‼※]\s*", "", title).strip()
    if columns:
        group["columns"] = columns
    return [group], unused_pending


def title_candidate(text):
    """표/스텝 그룹 제목이 될 수 있는 짧은 헤딩인지."""
    t = re.sub(r"^[>›‼※⚠!]\s*", "", text).strip()
    if not t or "\n" in t or len(t) > 25:
        return None
    if STEP_NUM_RE.match(t):
        return None
    if t.endswith(("다", "다.", "요", "요.", "기", "!")):
        return None
    return t


def dedup_multiline(dedup, text):
    """여러 줄 블록은 줄 단위로 중복을 걸러 남은 줄만 반환."""
    lines = text.split("\n")
    if len(lines) == 1:
        return None if dedup.is_dup(text) else text
    kept = [ln for ln in lines if not dedup.is_dup(ln)]
    return "\n".join(kept) if kept else None


def process_flavor(flavor):
    sections = flavor["content"]["sections"]
    dedup = PageDedup()
    hardness = None
    groups = []
    step_groups = [{"title": None, "steps": []}]
    notes = []
    pending_title = None
    seen_tables = set()

    def peek_kind(idx):
        """다음에 나오는 의미 블록의 종류: 'table' | 'step' | 'other' (노트성 블록 2개까지 건너뜀)."""
        skipped = 0
        for s in sections[idx + 1:]:
            if s["type"] == "table":
                return "table"
            text = clean_text(s.get("plain_text") or "")
            if not text:
                continue
            if s["type"] == "numbered_list_item" or STEP_NUM_RE.match(text):
                return "step"
            skipped += 1
            if skipped >= 2:
                return "other"
        return "other"

    def add_step(text):
        step_groups[-1]["steps"].append(STEP_NUM_RE.sub("", text))

    for idx, s in enumerate(sections):
        stype = s["type"]
        if stype == "table":
            key = json.dumps(s["table"]["rows"], ensure_ascii=False)
            if key in seen_tables:
                continue
            seen_tables.add(key)
            gs, unused = parse_table(s["table"]["rows"], pending_title)
            pending_title = None
            groups.extend(gs)
            if unused:
                # 표가 자체 제목을 가진 경우, 남은 헤딩은 다음 스텝 묶음의 제목으로 쓴다
                if peek_kind(idx) == "step":
                    step_groups.append({"title": unused, "steps": []})
                else:
                    notes.append(unused)
            continue

        text = clean_text(s.get("plain_text") or "")
        if not text:
            continue

        m = HARDNESS_RE.search(text)
        if m:
            if hardness is None:
                hardness = int(m.group(1))
            rest = clean_text(HARDNESS_RE.sub("", text).strip(" :："))
            if rest:
                rest = dedup_multiline(dedup, rest)
                if rest:
                    notes.append(rest)
            continue

        if stype == "numbered_list_item":
            if dedup.is_dup(text):
                continue
            add_step(text)
            continue

        if stype.startswith("heading"):
            cand = title_candidate(text)
            if cand:
                kind = peek_kind(idx)
                if kind == "table":
                    if not dedup.is_dup(text):
                        pending_title = cand
                    continue
                if kind == "step":
                    if not dedup.is_dup(text):
                        step_groups.append({"title": cand, "steps": []})
                    continue
            kept = dedup_multiline(dedup, text)
            if not kept:
                continue
            if STEP_NUM_RE.match(kept):
                add_step(kept)
            else:
                notes.append(kept)
            continue

        # paragraph / bulleted_list_item / 기타 텍스트
        kept = dedup_multiline(dedup, text)
        if not kept:
            continue
        if STEP_NUM_RE.match(kept):
            add_step(kept)
        else:
            notes.append(kept)

    if pending_title:
        notes.append(pending_title)

    # 제목만 있고 스텝이 전부 중복 제거된 그룹은 제목을 노트로 보존
    for g in step_groups:
        if g["title"] and not g["steps"]:
            notes.append(g["title"])
    step_groups = [g for g in step_groups if g["steps"]]
    return hardness, groups, step_groups, notes


def caption_from_filename(local_path: str):
    name = Path(local_path).name
    name = re.sub(r"^[0-9a-f-]{36}_", "", name)
    name = unquote(name)
    name = re.sub(r"\.[A-Za-z0-9]+$", "", name)
    name = name.replace("_", " ").replace("%", " ").strip()
    name = name.replace("�", "").strip()
    name = re.sub(r"\s+", " ", name)
    # 파일명이 중간에 잘려 괄호가 닫히지 않은 경우 잘린 꼬리를 제거
    if name.count("(") > name.count(")"):
        name = name[: name.rfind("(")].strip()
    if not name or re.match(r"^(스크린샷|screenshot|image|IMG)\b", name, re.IGNORECASE):
        return None
    return name


def collect_images(app_data):
    """owner_id(페이지) → [{local_path, caption}] : 속성 파일 + 본문 이미지."""
    by_owner = {}
    for item in app_data.get("images", []):
        label = item.get("label", "")
        lp = item.get("local_path") or ""
        if label == "page_cover":
            continue
        if any(m in lp for m in JUNK_IMAGE_MARKERS):
            continue
        by_owner.setdefault(item["owner_id"], []).append(
            {"local_path": lp, "caption": caption_from_filename(lp)}
        )
    return by_owner


def ts_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def emit_recipe(r, indent="    "):
    lines = [f"{indent}{{"]
    p = indent + "    "
    lines.append(f"{p}id: {ts_str(r['id'])},")
    lines.append(f"{p}title: {ts_str(r['title'])},")
    lines.append(f"{p}category: {ts_str(r['category'])},")
    if r.get("hardness") is not None:
        lines.append(f"{p}hardness: {r['hardness']},")
    lines.append(f"{p}tags: [{', '.join(ts_str(t) for t in r['tags'])}],")

    lines.append(f"{p}ingredientGroups: [")
    for g in r["ingredientGroups"]:
        lines.append(f"{p}    {{")
        if g.get("title"):
            lines.append(f"{p}        title: {ts_str(g['title'])},")
        if g.get("columns"):
            lines.append(f"{p}        columns: [{', '.join(ts_str(c) for c in g['columns'])}],")
        lines.append(f"{p}        ingredients: [")
        for ing in g["ingredients"]:
            parts = [f"name: {ts_str(ing['name'])}"]
            if ing.get("amount"):
                parts.append(f"amount: {ts_str(ing['amount'])}")
            if ing.get("amounts"):
                parts.append(f"amounts: [{', '.join(ts_str(a) for a in ing['amounts'])}]")
            if ing.get("note"):
                parts.append(f"note: {ts_str(ing['note'])}")
            lines.append(f"{p}            {{ {', '.join(parts)} }},")
        lines.append(f"{p}        ],")
        lines.append(f"{p}    }},")
    lines.append(f"{p}],")

    if r["stepGroups"]:
        lines.append(f"{p}stepGroups: [")
        for g in r["stepGroups"]:
            lines.append(f"{p}    {{")
            if g.get("title"):
                lines.append(f"{p}        title: {ts_str(g['title'])},")
            lines.append(f"{p}        steps: [")
            for st in g["steps"]:
                lines.append(f"{p}            {ts_str(st)},")
            lines.append(f"{p}        ],")
            lines.append(f"{p}    }},")
        lines.append(f"{p}],")

    if r.get("notes"):
        lines.append(f"{p}notes: [")
        for n in r["notes"]:
            lines.append(f"{p}    {ts_str(n)},")
        lines.append(f"{p}],")

    for field in ("instructionImages", "images"):
        if r.get(field):
            lines.append(f"{p}{field}: [")
            for img in r[field]:
                cap = f", caption: {ts_str(img['caption'])}" if img.get("caption") else ""
                lines.append(f"{p}    {{ src: {ts_str(img['src'])}{cap} }},")
            lines.append(f"{p}],")

    if r.get("purchaseLinks"):
        lines.append(f"{p}purchaseLinks: [")
        for l in r["purchaseLinks"]:
            lines.append(f"{p}    {{ item: {ts_str(l['item'])}, url: {ts_str(l['url'])} }},")
        lines.append(f"{p}],")

    lines.append(f"{p}imageColor: {ts_str(r['imageColor'])},")
    lines.append(f"{indent}}},")
    return "\n".join(lines)


HEADER = """\
// ─────────────────────────────────────────────────────────────
// ⚠️ 이 파일은 scripts/convert_notion_export.py 가
//    Notion export(gelacream_recipe_app_ready)에서 자동 생성했습니다.
//    내용 수정은 Notion 원본 → export → 스크립트 재실행으로 반영하세요.
// ─────────────────────────────────────────────────────────────

export interface Ingredient {
    name: string;
    amount?: string;
    /** 배합량 변형(예: 1바트 / 2바트) 컬럼이 있는 표의 수량들 */
    amounts?: string[];
    note?: string;
}

export interface IngredientGroup {
    /** 배합 그룹 이름 (예: 커피시럽, 밤 티라미수) */
    title?: string;
    /** amounts 컬럼 라벨 (예: ['1바트이상', '평평한 1바트']) */
    columns?: string[];
    ingredients: Ingredient[];
}

export interface RecipeImage {
    src: string;
    caption?: string;
}

export interface StepGroup {
    /** 스텝 묶음 이름 (예: 밀크티 시럽 레시피) */
    title?: string;
    steps: string[];
}

export interface PurchaseLink {
    item: string;
    url: string;
}

export interface Recipe {
    id: string;
    title: string;
    category: 'milk' | 'sorbet' | 'vegan' | 'alcohol';
    description?: string;
    /** 머신 경도값 */
    hardness?: number;
    tags: string[];
    ingredients: Ingredient[];
    ingredientGroups?: IngredientGroup[];
    steps: string[];
    stepGroups?: StepGroup[];
    /** 만드는 순서에 딸린 작업 도식/사진 */
    instructionImages?: RecipeImage[];
    /** 참고/주의 사항 */
    notes?: string[];
    purchaseLinks?: PurchaseLink[];
    /** 재료 구매 참고 사진 */
    images?: RecipeImage[];
    imageColor: string; // Placeholder for image
}

type RecipeSeed = Omit<Recipe, 'ingredients' | 'steps'>;

const SEEDS: RecipeSeed[] = [
"""

FOOTER = """\
];

export const RECIPES: Recipe[] = SEEDS.map((seed) => ({
    ...seed,
    ingredients: (seed.ingredientGroups ?? []).flatMap((group) => group.ingredients),
    steps: (seed.stepGroups ?? []).flatMap((group) => group.steps),
}));
"""


def image_extension(path):
    """파일 매직 바이트로 이미지 확장자를 판별. Notion export의 잘린 확장자(.j 등)를 보정."""
    try:
        with open(path, "rb") as fh:
            head = fh.read(12)
    except OSError:
        head = b""
    if head[:3] == b"\xff\xd8\xff":
        return ".jpg"
    if head[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if head[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return ".webp"
    ext = Path(path).suffix.lower()
    return ext if ext in (".jpg", ".jpeg", ".png", ".gif", ".webp") else ".png"


def to_storage_path(src):
    """MockData의 정적 경로(/recipe-images/NAME)를 Storage 객체 경로(NAME)로 변환."""
    return src.rsplit("/recipe-images/", 1)[-1]


def sql_quote(value):
    return "'" + value.replace("'", "''") + "'"


def sql_jsonb(obj):
    return sql_quote(json.dumps(obj, ensure_ascii=False)) + "::jsonb"


def storage_images(entries):
    out = []
    for e in entries:
        item = {"src": to_storage_path(e["src"])}
        if e.get("caption"):
            item["caption"] = e["caption"]
        out.append(item)
    return out


SEED_HEADER = """\
-- ─────────────────────────────────────────────────────────────
-- ⚠️ 자동 생성 파일: scripts/convert_notion_export.py 출력물.
--    Notion 원본 수정 → export → 스크립트 재실행으로 갱신하세요.
--
-- 실행 전제: 20260702000000_recipes_and_storage.sql 마이그레이션 적용 완료 +
--            scripts/upload_images_to_storage.mjs 로 이미지 업로드 완료.
-- 멱등 upsert 이므로 재실행 시 최신 내용으로 덮어씁니다(관리자 수정분은 유지되지 않으니
-- 초기 시드/재시드 용도로만 사용하세요).
-- ─────────────────────────────────────────────────────────────

insert into public.recipes
    (id, title, category, description, hardness, tags,
     ingredient_groups, step_groups, notes, images, instruction_images,
     purchase_links, image_color, sort_order)
values
"""

SEED_FOOTER = """\
on conflict (id) do update set
    title = excluded.title,
    category = excluded.category,
    description = excluded.description,
    hardness = excluded.hardness,
    tags = excluded.tags,
    ingredient_groups = excluded.ingredient_groups,
    step_groups = excluded.step_groups,
    notes = excluded.notes,
    images = excluded.images,
    instruction_images = excluded.instruction_images,
    purchase_links = excluded.purchase_links,
    image_color = excluded.image_color,
    sort_order = excluded.sort_order,
    updated_at = now();
"""


def emit_seed_sql(recipes):
    rows = []
    for order, r in enumerate(recipes):
        cols = [
            sql_quote(r["id"]),
            sql_quote(r["title"]),
            sql_quote(r["category"]),
            "null",  # description
            str(r["hardness"]) if r.get("hardness") is not None else "null",
            sql_jsonb(r.get("tags", [])),
            sql_jsonb(r.get("ingredientGroups", [])),
            sql_jsonb(r.get("stepGroups", [])),
            sql_jsonb(r.get("notes", [])),
            sql_jsonb(storage_images(r.get("images", []))),
            sql_jsonb(storage_images(r.get("instructionImages", []))),
            sql_jsonb(r.get("purchaseLinks", [])),
            sql_quote(r["imageColor"]),
            str(order),
        ]
        rows.append("    (" + ", ".join(cols) + ")")
    return SEED_HEADER + ",\n".join(rows) + "\n" + SEED_FOOTER


def main():
    app_data = json.loads((EXPORT_DIR / "app_data.json").read_text(encoding="utf-8"))
    props = load_page_properties(EXPORT_DIR / "pages")
    purchase = extract_purchase_links(EXPORT_DIR / "pages")
    images_by_owner = collect_images(app_data)

    IMG_OUT.mkdir(parents=True, exist_ok=True)

    recipes = []
    stats = {"no_steps": [], "no_hardness": [], "multi_group": [], "with_images": 0, "img_files": 0}
    prefix = {"milk": "m", "sorbet": "s", "vegan": "v", "alcohol": "a"}
    counters = {k: 0 for k in prefix}

    for cat_kr, cat_en in CATEGORY_MAP.items():
        flavors = app_data["categories"][cat_kr]["flavors"]
        for f in flavors:
            counters[cat_en] += 1
            rid = f"{prefix[cat_en]}{counters[cat_en]}"
            title = f["name"].replace("📍", "").strip()
            title = re.sub(r"\s+", " ", unicodedata.normalize("NFC", title))

            hardness, groups, step_groups, notes = process_flavor(f)

            # 이미지 복사: 페이지 속성 사진(구매 참고) + 본문 이미지(작업 도식)
            imgs = []
            for i, item in enumerate(images_by_owner.get(f["page_id"], []), start=1):
                if not item["local_path"]:
                    continue
                src = EXPORT_DIR / item["local_path"]
                if not src.is_file():
                    continue
                ext = image_extension(src)
                dest_name = f"{rid}-{i}{ext}"
                shutil.copyfile(src, IMG_OUT / dest_name)
                stats["img_files"] += 1
                entry = {"src": f"/recipe-images/{dest_name}"}
                if item["caption"]:
                    entry["caption"] = item["caption"]
                imgs.append(entry)
            if imgs:
                stats["with_images"] += 1

            instruction_imgs = []
            for i, item in enumerate(f["content"].get("images", []), start=1):
                lp = item.get("local_path") or ""
                if not lp or any(m in lp for m in JUNK_IMAGE_MARKERS):
                    continue
                src = EXPORT_DIR / lp
                if not src.is_file():
                    continue
                ext = image_extension(src)
                dest_name = f"{rid}-d{i}{ext}"
                shutil.copyfile(src, IMG_OUT / dest_name)
                stats["img_files"] += 1
                entry = {"src": f"/recipe-images/{dest_name}"}
                caption = (item.get("caption") or "").strip()
                if caption:
                    entry["caption"] = caption
                instruction_imgs.append(entry)

            palette = PALETTES[cat_en]
            recipe = {
                "id": rid,
                "title": title,
                "category": cat_en,
                "hardness": hardness,
                "tags": props.get(f["page_id"], {}).get("tags", []),
                "ingredientGroups": groups,
                "stepGroups": step_groups,
                "notes": notes,
                "images": imgs,
                "instructionImages": instruction_imgs,
                "purchaseLinks": purchase.get(f["page_id"], []),
                "imageColor": palette[(counters[cat_en] - 1) % len(palette)],
            }
            recipes.append(recipe)

            if not step_groups:
                stats["no_steps"].append(f"{cat_en}/{title}")
            if hardness is None:
                stats["no_hardness"].append(f"{cat_en}/{title}")
            if len(groups) > 1:
                stats["multi_group"].append(f"{cat_en}/{title} ({len(groups)})")

    body = "\n".join(emit_recipe(r) for r in recipes)
    TS_OUT.write_text(HEADER + body + "\n" + FOOTER, encoding="utf-8")

    SEED_OUT.parent.mkdir(parents=True, exist_ok=True)
    SEED_OUT.write_text(emit_seed_sql(recipes), encoding="utf-8")

    # REST(secret 키) 시드용 JSON: DB 컬럼(snake_case)에 맞춘 행 배열
    seed_rows = []
    for order, r in enumerate(recipes):
        seed_rows.append({
            "id": r["id"],
            "title": r["title"],
            "category": r["category"],
            "description": None,
            "hardness": r.get("hardness"),
            "tags": r.get("tags", []),
            "ingredient_groups": r.get("ingredientGroups", []),
            "step_groups": r.get("stepGroups", []),
            "notes": r.get("notes", []),
            "images": storage_images(r.get("images", [])),
            "instruction_images": storage_images(r.get("instructionImages", [])),
            "purchase_links": r.get("purchaseLinks", []),
            "image_color": r["imageColor"],
            "sort_order": order,
        })
    SEED_JSON_OUT.write_text(json.dumps(seed_rows, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"✅ {len(recipes)} recipes → {TS_OUT}")
    print(f"   시드 SQL → {SEED_OUT}")
    print(f"   이미지 {stats['img_files']}개 복사 (레시피 {stats['with_images']}개) → {IMG_OUT}")
    print(f"   경도값 없음: {len(stats['no_hardness'])}개 {stats['no_hardness'][:5]}")
    print(f"   스텝 없음: {len(stats['no_steps'])}개 {stats['no_steps'][:8]}")
    print(f"   다중 배합 그룹: {len(stats['multi_group'])}개")
    for m in stats["multi_group"]:
        print("     -", m)


if __name__ == "__main__":
    main()
