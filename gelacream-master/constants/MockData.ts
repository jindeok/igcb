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
    {
        id: "m1",
        title: "코코넛우베라떼",
        category: "milk",
        hardness: 27,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "시럽", amount: "1,500" },
                    { name: "우베 가루", amount: "100" },
                    { name: "코코넛 가루", amount: "50" },
                    { name: "우유", amount: "2,500" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "먼저 우베가루와 시럽을 먼저 믹서나 거품기로 잘 풀어준다.",
                    "우베가루가 다 풀어진 시럽에 코코넛 파우더를 넣고 잘 풀어준다.",
                    "우유를 마지막에 넣고 저어준다. (생크림은 안들어갑니다)",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m1-2.jpg" },
            { src: "/recipe-images/m1-3.png" },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "m2",
        title: "코코넛",
        category: "milk",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "코코넛", amount: "200" },
                    { name: "콩검", amount: "5" },
                    { name: "시럽", amount: "1,300" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "2,500" },
                ],
            },
        ],
        notes: [
            "‼️코코넛 가루와  시럽을 믹서에 갈고나서 (약하게 갈기)",
            "10~20분정도 불리기",
        ],
        images: [
            { src: "/recipe-images/m2-1.jpg", caption: "코코넛가루" },
        ],
        imageColor: "#FDF3E7",
    },
    {
        id: "m3",
        title: "체리청밀크",
        category: "milk",
        hardness: 27,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "화이트베이스", amount: "4,000" },
                    { name: "우유", amount: "500" },
                ],
            },
        ],
        notes: [
            "‼판매 시 체리청을 위에 듬뿍 섞어서 제공",
            "‼체리청을 올려서 바로 섞는 것 보다 올리고 체리청을 좀 얼려서 섞어야 빨간색으로 이쁘게 섞임",
        ],
        images: [
            { src: "/recipe-images/m3-1.jpg", caption: "선인 - 체리프리저브" },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "m4",
        title: "초당옥수수",
        category: "milk",
        hardness: 26,
        tags: ["믹서", "여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "초당옥수수", amount: "1,000" },
                    { name: "시럽", amount: "1,250" },
                    { name: "소금", amount: "15" },
                    { name: "생크림", amount: "200" },
                    { name: "우유", amount: "2,200" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 초닥옥수수 + 시럽 + 소금을 넣고 곱게 완전히 갈아준다 ( 덜갈리면 옥수수껍질을 비닐이라고 오해할수 있습니다)",
                    "생크림, 우유를 차례로 넣고 섞어준다",
                ],
            },
            {
                title: "초당옥수수 손질법",
                steps: [
                    "겉껍질을 다 깐후 정수기 물에 한번씩 헹궈준다",
                    "5~6개씩 냄비나 전자렌지에 삶아준다 (10~20분)",
                    "식힌 후 도마위에서 칼로 알갱이만 잘라서 모은다",
                    "1kg 씩 소분해서 얼린다",
                ],
            },
        ],
        imageColor: "#FBEFE3",
    },
    {
        id: "m5",
        title: "애플시나몬",
        category: "milk",
        hardness: 26,
        tags: ["겨울"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "사과", amount: "1,000" },
                    { name: "시럽", amount: "1,300" },
                    { name: "시나몬가루", amount: "10~15" },
                    { name: "레몬즙", amount: "30" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "2,000" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 사과 + 시럽 + 레몬즙을 넣고 곱게 갈아준다",
                    "믹싱볼에 1번 + 시나몬가루를 넣고 잘 저어준다",
                    "생크림, 우유를 차례로 넣고 섞어준다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m5-1.jpg", caption: "계피가루 100" },
            { src: "/recipe-images/m5-2.png" },
        ],
        imageColor: "#FFF9EC",
    },
    {
        id: "m6",
        title: "다크초코 / 두바이초콜릿",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                title: "다크초코",
                ingredients: [
                    { name: "시럽", amounts: ["1,400", "1,150"] },
                    { name: "Extra 다크", amounts: ["250", "200"] },
                    { name: "생크림", amounts: ["450", "350"] },
                    { name: "우유", amounts: ["3팩 (2,700)", "2,250"] },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "시럽에 카카오파우더를 잘 풀어준다 (가루 안 뭉치게 잘 풀어주는게 제일 중요!)",
                    "생크림과 우유를 차례로 넣고 섞는다",
                ],
            },
        ],
        notes: [
            "‼ 다크초코 위에 카다이프를 올려 판매해도 되나, 두바이초코릿을 다크초코와 따로 판매하고 싶을 때 베이스를 따로 만들어서 카다이프면을 올려 판매",
            "‼두바이 초콜릿 → 두바이초코릿 레시피 보고 베이스 따로 만들기!",
        ],
        images: [
            { src: "/recipe-images/m6-1.png", caption: "선인(아이키친몰) 익" },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "m7",
        title: "유기농 보성 녹차, 올티스말차",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                title: "보성 녹차 / 올티스 녹차",
                ingredients: [
                    { name: "시럽", amount: "1,400" },
                    { name: "녹차 가루", amount: "100" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "3팩 (2,700)" },
                ],
            },
            {
                title: "올티스 말차",
                ingredients: [
                    { name: "시럽", amounts: ["1,500", "1,200"] },
                    { name: "말차 가루", amounts: ["80", "68"] },
                    { name: "생크림", amounts: ["300", "240"] },
                    { name: "우유", amounts: ["3팩 (2,700)", "2,200"] },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "시럽에 가루를 넣고 잘 풀어준다",
                    "1번에 생크림, 우유를 차례로 넣고 섞어준다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m7-1.png", caption: "유기농 가루 녹차 말" },
        ],
        imageColor: "#FDF3E7",
    },
    {
        id: "m8",
        title: "연유커피",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "시럽", amount: "1,000" },
                    { name: "에스프레소 샷", amount: "350" },
                    { name: "물", amount: "200" },
                    { name: "베트남 연유", amount: "2통 (750g)" },
                    { name: "코코넛 밀크", amount: "2통 (2,000)" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "배합통에 재료를 순서대로 넣고 섞어 준다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m8-1.png" },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "m9",
        title: "로즈마리허니",
        category: "milk",
        hardness: 27,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "시럽", amount: "1,100" },
                    { name: "로즈마리", amount: "35" },
                    { name: "꿀", amount: "400" },
                    { name: "콩검", amount: "10" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "2,300" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 시럽 + 로즈마리잎 + 꿀 + 콩검 넣고 곱게 갈아준다.",
                    "생크림, 우유를 차례로 넣고 섞어준다.",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m9-1.png", caption: "생로즈마리" },
        ],
        imageColor: "#FBEFE3",
    },
    {
        id: "m10",
        title: "민트초코칩",
        category: "milk",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "화이트베이스", amount: "4,000" },
                    { name: "민트잎", amount: "160" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 민트입 160에 화이트베이스 1000g을 넣고 갈아준다.",
                    "배합통에 1번을 붓고 나머지 화이트베이스3000g를 섞는다",
                    "젤라또 배출시 초코시럽을 넉넉히 뿌리며 받아준다",
                ],
            },
            {
                title: "민트 잎 손질법",
                steps: [
                    "굵고 긴 중간 줄기만 버린다\n(잎에 달린 가는 줄기는 버리지 말고 사용!)",
                    "정수기 물에 2번 헹구고",
                    "종류별로 반반씩 담아서 소분\n(ex 스피어 80g+페퍼 80g / 스피어만 160g)",
                    "냉동실에 얼리기",
                ],
            },
        ],
        notes: [
            "✅️ 생 민트잎을 바로 사용 : 화이트 베이스 완전히 식힌 후 믹서기에 곱게 갈아준다. (화이트베이스에 열이 남이있으면 민트잎이 익어버려서 쓴맛+갈변 됩니다)",
            "✅️냉동 된 민트잎 사용 : 민트잎이 녹기전에 언 상태로 믹서에 곱게 갈아준다. (녹으면 흐물흐물해지면서 믹서 후에 쓴맛+갈변 됩니다)",
        ],
        imageColor: "#FFF9EC",
    },
    {
        id: "m11",
        title: "햇감자",
        category: "milk",
        hardness: 25,
        tags: ["믹서", "여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "삶은감자", amount: "700" },
                    { name: "시럽", amount: "900" },
                    { name: "소금", amount: "15" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "1,300" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 감자와 시럽, 소금을 넣고 곱게 갈아준다",
                    "생크림 우유를 차례로 넣고 섞어준다",
                ],
            },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "m12",
        title: "마가렛트",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "피넛버터", amount: "20" },
                    { name: "시럽", amount: "1,200" },
                    { name: "마가렛트과자", amount: "200" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "2,500" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "시럽에 피넛버터를 넣고 잘 풀어준다",
                    "과자를 넣고 거품기로 부숴준다",
                    "생크림, 우유를 차례로 넣고 섞어준다",
                ],
            },
        ],
        imageColor: "#FDF3E7",
    },
    {
        id: "m13",
        title: "우리땅 붉은팥",
        category: "milk",
        hardness: 26,
        tags: ["믹서", "겨울"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "빙수팥", amount: "1,000" },
                    { name: "시럽", amount: "1,400" },
                    { name: "소금", amount: "10" },
                    { name: "콩검", amount: "10" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "2,500" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 팥, 시럽, 소금, 콩검을 넣고 곱게 갈아준다",
                    "생크림, 우유를 차례로 넣고 섞어준다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m13-1.png", caption: "팥 (국내산 100)" },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "m14",
        title: "호지차",
        category: "milk",
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "화이트베이스", amount: "1,500" },
                    { name: "시럽", amount: "500" },
                    { name: "호지차 가루", amount: "100" },
                    { name: "소금", amount: "10" },
                    { name: "우유", amount: "2통 (1,800)" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "시럽에 가호지차루, 소금을 넣고 잘 풀어준다",
                    "1번에 화이트베이스, 우유를 차례로 넣고 섞어준다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m14-1.png", caption: "쿠팡 호지차" },
        ],
        imageColor: "#FBEFE3",
    },
    {
        id: "m15",
        title: "두바이 초콜릿",
        category: "milk",
        tags: [],
        ingredientGroups: [
            {
                title: "따로 베이스 아이스크림 만들 경우",
                ingredients: [
                    { name: "시럽", amounts: ["1,400", "1150"] },
                    { name: "익스트라 다크 코코아 파우더", amounts: ["200", "165"] },
                    { name: "생크림", amounts: ["300", "250"] },
                    { name: "우유", amounts: ["3팩 (2,700)", "2250"] },
                ],
            },
            {
                title: "피스타치오 카다이프",
                ingredients: [
                    { name: "버터", amount: "100" },
                    { name: "카다이프", amount: "300" },
                    { name: "피스타치오 페이스트 (고형분위주)", amount: "200~250" },
                ],
            },
        ],
        stepGroups: [
            {
                title: "두바이초콜릿 카다이프 만드는법",
                steps: [
                    "버터 100g 먼저 약불에 액체로 녹인다",
                    "다 녹은 버터에 카다이프면을 넣고 중불로 타지않게 볶는다.\n(소분해서 얼려둔 카다이프면을 볶기 전 미리 부셔주면 볶을때 더 간편함)",
                    "카다이프면이 노랗게 되면 불을 끄고, 잔열에 수분이 다 날아가서 바삭해질 때까지 볶는다.",
                    "피스타치오 페이스트 (고형분 위주!) 200g을 넣고 골고루 버무려준다.",
                    "버무리고 식힌 후 냉장보관하며, 주문이 들어올 때마다 다크초코 젤라크림에 토핑으로 뿌려서 판매. (솔티 크래커처럼)",
                ],
            },
        ],
        notes: [
            "‼ 젤라크림 위에 피스타치오 카다이프를 뿌려 판매할때 젤라크림과 잘 섞어서 판매",
        ],
        imageColor: "#FFF9EC",
    },
    {
        id: "m16",
        title: "피넛버터초코",
        category: "milk",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "피넛버터", amount: "300" },
                    { name: "시럽", amount: "1,300" },
                    { name: "Extra 다크", amount: "180" },
                    { name: "생크림", amount: "200" },
                    { name: "우유", amount: "3팩 (2,700)" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 피넛버터와 시럽을 넣고 갈아준다  (잘 섞이기만하면 됨)",
                    "배합통에 1번과 카카오파우더(extra 다크)를 넣고 풀어준다",
                    "생크림과 우유를 넣고 섞는다",
                ],
            },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "m17",
        title: "밀크티",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                title: "실론티",
                ingredients: [
                    { name: "실론티 시럽", amount: "1,400" },
                    { name: "실론티 가루", amount: "70" },
                    { name: "우유생크림", amount: "300" },
                    { name: "우유", amount: "3팩 (2,700)" },
                ],
            },
            {
                title: "얼그레이",
                ingredients: [
                    { name: "얼그레이 시럽", amount: "1,300" },
                    { name: "얼그레이 파우더", amount: "40" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "3팩 (2,700)" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "밀크티 시럽에 홍차 파우더를 잘 풀어준다",
                    "생크림, 우유를 차례로 넣고 섞는다",
                ],
            },
            {
                title: "밀크티 시럽 레시피",
                steps: [
                    "시럽 파우치1개 (2kg)를 냄비에 넣고 끓으면 불을 끈다",
                    "끓인 시럽에 찻잎 30g을 넣고 1시간 우린다",
                    "찻잎을 체로 건져낸다",
                    "식힌 후 통에 담아 냉장 보관한다.",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m17-1.png", caption: "선인(아이키친몰) 실" },
            { src: "/recipe-images/m17-2.png", caption: "선인(아이키친몰) 실" },
            { src: "/recipe-images/m17-3.png" },
            { src: "/recipe-images/m17-5.png" },
        ],
        imageColor: "#FDF3E7",
    },
    {
        id: "m18",
        title: "소금커피",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "에스프레소", amount: "600" },
                    { name: "소금", amount: "20" },
                    { name: "콩검", amount: "10" },
                    { name: "시럽", amount: "1,200" },
                    { name: "우유", amount: "2,200" },
                ],
            },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "m19",
        title: "유기농 쌀밥 (리조)",
        category: "milk",
        hardness: 26,
        tags: ["시그니처"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "우유", amount: "4팩 (3,600)" },
                    { name: "노른자", amount: "120" },
                    { name: "럼주", amount: "80" },
                    { name: "└ or 맥코닉 럼", amount: "2" },
                    { name: "설탕", amount: "500" },
                    { name: "포도당", amount: "200" },
                    { name: "버터", amount: "100 (1스틱)" },
                    { name: "쌀밥", amount: "300" },
                ],
            },
        ],
        stepGroups: [
            {
                title: "< 유기농 쌀밥 제조 방법 >",
                steps: [
                    "냄비에 우유 1통을 먼저 붓고 계란 노른자, 럼을 넣고 저어준다",
                    "설탕, 포도당을 넣고 저어준다.",
                    "따뜻한 밥(냉동보관시 완벽하게 해동 후 사용)을 2에 넣고 밥알을 푼다 *밥이 덜 해동 됐을때는 약한불에서 충분이 오래 끓여서 다 녹히기 (얼어있는 밥은 제조기 안에서 밥알이 다 부숴집니다)",
                    "60~80℃, 10분 맞추고 버터를 넣어준다. (중간중간 저어주기)",
                    "버터가 다 녹으면 + 럼의 알코올이 다 날아간 후, 나머지 우유 3개를 넣는다",
                ],
            },
            {
                title: "< 쌀밥하는 방법 >",
                steps: [
                    "유기농쌀 500g을 정수기 물로 2번 씻어준다.",
                    "밥솥에 씻은 쌀과 정수기 물을 손등까지 (질게 되도록 물 양 넉넉히) 맞춘 후 ‘취사’ 버튼 누른다.",
                    "다 된 후 ‘보온’으로 돌아가면 주걱으로 뒤섞어서 한김 뺀 후 4개의 통에 똑같은 양으로 나눠 담아준다",
                    "소분한 밥을 식힌 후 냉동실에 얼려준다",
                ],
            },
        ],
        notes: [
            "‼️처음에 우유를 1통만 넣는 이유 = 빨리 끓이기 위함",
        ],
        images: [
            { src: "/recipe-images/m19-1.png", caption: "한살림 유기농 백미" },
            { src: "/recipe-images/m19-2.png", caption: "코스트코 스위트크림" },
            { src: "/recipe-images/m19-3.png" },
            { src: "/recipe-images/m19-4.png" },
        ],
        imageColor: "#FBEFE3",
    },
    {
        id: "m20",
        title: "인절미",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "시럽", amount: "1,400" },
                    { name: "콩가루", amount: "120" },
                    { name: "소금", amount: "10" },
                    { name: "생크림", amount: "200" },
                    { name: "우유", amount: "2,500" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "시럽에 콩가루, 소를 넣고 잘 풀어준다",
                    "1번에 생크림, 우유를 차례로 넣고 섞어준다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m20-1.png", caption: "한살림 콩가루" },
        ],
        imageColor: "#FFF9EC",
    },
    {
        id: "m21",
        title: "아보카도",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "아보카도", amount: "750" },
                    { name: "시럽", amount: "1,300" },
                    { name: "우유", amount: "2,000" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 아보카도와 시럽을 넣고 곱게 갈아준다",
                    "우유를 넣고 섞어준다",
                ],
            },
        ],
        notes: [
            "❗잘 익은 생 아보카도 ( 꼭 잘 익혀서!)",
            "혹은 냉동 아보카도 사용",
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "m22",
        title: "메이플 월넛",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "화이트베이스", amount: "4,000" },
                    { name: "메이플 시럽", amount: "500" },
                    { name: "시나몬가루", amount: "2~3" },
                    { name: "콩검", amount: "10" },
                    { name: "호두", amount: "200g (구워서 부수기)" },
                ],
            },
        ],
        notes: [
            "< 호두 토핑 준비 방법 >",
            "호두 200g을 170℃에 15분 굽기 → 잘게 부수기",
            "판매시 위에 뿌려서 섞어주기 (젤라크림 속에 오래 박혀있으면 호두가 물먹어서 맛이 변합니다)",
        ],
        images: [
            { src: "/recipe-images/m22-1.jpg", caption: "코스트코 메이플시럽" },
            { src: "/recipe-images/m22-2.png", caption: "호두" },
        ],
        imageColor: "#FDF3E7",
    },
    {
        id: "m23",
        title: "어린 쑥",
        category: "milk",
        hardness: 25,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "시럽", amount: "1,200" },
                    { name: "쑥 가루", amount: "120" },
                    { name: "소금", amount: "5" },
                    { name: "생크림", amount: "200" },
                    { name: "우유", amount: "2,200" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "생크림, 우유를 넣고 섞어준다",
                    "시럽에 쑥가루, 소금을 넣고 저어서 충분히 잘 풀어준다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m23-1.png", caption: "방앗간청년 쑥가루" },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "m24",
        title: "치즈크래커(뽀또)",
        category: "milk",
        hardness: 27,
        tags: ["믹서", "시그니처"],
        ingredientGroups: [
            {
                columns: ["1바트이상", "평평한 1바트"],
                ingredients: [
                    { name: "크림치즈", amounts: ["300", "250"] },
                    { name: "시럽", amounts: ["1,300", "1,100"] },
                    { name: "황치즈가루", amounts: ["170", "150"] },
                    { name: "우유", amounts: ["3팩 (2,700)", "2,300"] },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블랜더에 조각 낸 크림치즈에 시럽을 넣고 완전히 갈아준다",
                    "배합통에 1번을 붓고 황치즈가루를 넣고 잘 섞어준다",
                    "우유를 넣고 저어준다.",
                ],
            },
        ],
        notes: [
            "❗크림치즈 비닐 완벽히 제거!",
        ],
        images: [
            { src: "/recipe-images/m24-1.png", caption: "서강황치즈분말" },
            { src: "/recipe-images/m24-2.png", caption: "코스트코 라스카스크" },
            { src: "/recipe-images/m24-3.png", caption: "리츠 (토핑 과자용)" },
            { src: "/recipe-images/m24-4.png", caption: "제크 (뽀또 토핑 과자)" },
        ],
        imageColor: "#FBEFE3",
    },
    {
        id: "m25",
        title: "라임고수",
        category: "milk",
        hardness: 27,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "고수", amount: "100" },
                    { name: "시럽", amount: "2,200" },
                    { name: "라임즙", amount: "700" },
                    { name: "우유", amount: "1,700" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "고수와 시럽을 믹서에 넣고 곱게 갈아준다",
                    "1번을 믹싱볼에 담고, 라임즙과 우유를 차례로 넣은 후 저어준다",
                ],
            },
        ],
        notes: [
            "고수는 굵은 줄기를 제외하고 정수 물에 씻어서 사용!",
        ],
        images: [
            { src: "/recipe-images/m25-1.png" },
        ],
        imageColor: "#FFF9EC",
    },
    {
        id: "m26",
        title: "생바질밀크",
        category: "milk",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "시럽", amount: "1,100" },
                    { name: "바질", amount: "80" },
                    { name: "우유", amount: "2,500" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 시럽과 바질 잎을 넣고 곱게 갈아준다",
                    "우유를 넣고 저어준다.",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m26-1.png", caption: "생바질 500g" },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "m27",
        title: "우리땅 검정깨",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "시럽", amount: "1,200" },
                    { name: "검정깨 가루", amount: "150" },
                    { name: "소금", amount: "5" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "2,500" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "시럽에 검정깨가루, 소금을 넣고 저어서 충분히 잘 풀어준다",
                    "생크림, 우유를 넣고 섞어준다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m27-1.png", caption: "방앗간청년 검은깨가" },
        ],
        imageColor: "#FDF3E7",
    },
    {
        id: "m28",
        title: "한살림 약과",
        category: "milk",
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "약과시럽", amount: "1,200" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "2,200" },
                ],
            },
            {
                title: "약과시럽 끓이는법",
                ingredients: [
                    { name: "시럽", amount: "3,000" },
                    { name: "조청", amount: "500" },
                    { name: "생강가루", amount: "20" },
                    { name: "시나몬가루", amount: "약간(3꼬집)" },
                ],
            },
        ],
        notes: [
            "‼약과를 잘라 젤라크림 위에 토핑으로 뿌려서 판매",
            "‼약과시럽 끓일 때 시나몬 약간은 3꼬집 정도로 정말 조금만 넣어도 향이 품부함",
            "‼기호에 따라 시나몬 가루 2~4꼬집 정도로 양 조절!",
        ],
        images: [
            { src: "/recipe-images/m28-1.png", caption: "한살림 약과" },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "m29",
        title: "구운 피스타치오",
        category: "milk",
        hardness: 26,
        tags: ["믹서", "시그니처"],
        ingredientGroups: [
            {
                columns: ["기본", "평평한 1바트", "2바트 양"],
                ingredients: [
                    { name: "피스타치오(무염)", amounts: ["250", "200", "400"] },
                    { name: "소금", amounts: ["15", "10", "20"] },
                    { name: "시럽", amounts: ["1,400", "1,150", "2,300"] },
                    { name: "생크림", amounts: ["400", "320", "600"] },
                    { name: "우유", amounts: ["3팩 (2,700)", "2,200", "5팩 (4,500)"] },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 피스타치오 50g (80%) + 시럽 400g 먼저 약하게 갈아준다 > 배합통에 부어준다",
                    "나머지 피스타치오 200g + 시럽 1,000g 도 블렌더에 넣고 세게 갈아준다 (완전히) > 배합통에 부어준다",
                    "소금, 생크림, 우유를 차례로 넣고 저어준다",
                ],
            },
            {
                title: "피스타치오 굽는 방법",
                steps: [
                    "피스타치오를 정수 물에 한번 헹군 후 채에 걸러 물기를 빼준다",
                    "피스타치오를 250g씩 에어프라이기에 160℃, 5분 동안 구워준다 (물기가 다 날아가도록!)",
                    "구운 뒤 식힌 후 통에 담아서 냉동보관한다",
                ],
            },
        ],
        notes: [
            "가염 피스타치오는 소금 양 반으로 줄여주세요",
            "🔸 알갱이 씹히는것도 좋지만, 베이스에 골고루 맛이 들어야해서 곱게 갈아주는 양이 꼭 필요합니다!",
            "(한번에 갈고 싶으신 분은 전체 양을 약하게 오래 or 중간단계로 갈아주세요)",
        ],
        imageColor: "#FBEFE3",
    },
    {
        id: "m30",
        title: "헤이즐넛",
        category: "milk",
        hardness: 26,
        tags: ["믹서", "가을", "겨울"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "화이트베이스", amount: "4,000" },
                    { name: "헤이즐넛페이스트", amount: "150\n(가라앉은 고체 120 \n 위에 떠있는 기름 30)" },
                    { name: "소금", amount: "10" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 헤이즐넛, 소금에 화이트베이스 1000g을 넣고 완전히 갈아준다.",
                    "배합통에 1번을 붓고 나머지 화이트베이스 3000g을 넣고섞는다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m30-1.png", caption: "FG 헤이즐넛페이스트" },
        ],
        imageColor: "#FFF9EC",
    },
    {
        id: "m31",
        title: "단호박",
        category: "milk",
        hardness: 26,
        tags: ["믹서", "여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "익힌 단호박", amount: "1,000" },
                    { name: "시럽", amount: "1,400" },
                    { name: "소금", amount: "5" },
                    { name: "생크림", amount: "400" },
                    { name: "우유", amount: "2,000" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 찐 단호박 + 시럽 + 소금을 넣고 곱게 갈아준다",
                    "생크림, 우유를 차례로 넣고 섞어준다",
                ],
            },
        ],
        notes: [
            "❗단호박은 6~8조각 낸 후 씨를 제거하고",
            "겉 껍질 두꺼운부분 제거후 쪄서 사용한다",
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "m32",
        title: "누텔라초코",
        category: "milk",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "누텔라", amount: "350" },
                    { name: "시럽", amount: "1,100" },
                    { name: "카카오파우더", amount: "150" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "3팩 (2,700)" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 누텔라와 시럽을 넣고 갈아준다. (잘 섞이기만하면 됨)",
                    "배합통에 1번과 카카오파우더(extra 다크)를 넣고 풀어준다",
                    "생크림과 우유를 넣고 섞는다",
                ],
            },
        ],
        imageColor: "#FDF3E7",
    },
    {
        id: "m33",
        title: "커피쿠키 (로투스비스켓)",
        category: "milk",
        hardness: 27,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "로투스 과자", amount: "80" },
                    { name: "소금", amount: "5" },
                    { name: "시럽", amount: "1,300" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "2,500" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "배합통에 시럽 + 로투스 과자를 넣고 거품기로 부숴준다.",
                    "소금, 생크림과 우유를 차례로 넣고 섞는다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m33-1.png", caption: "로투스비스켓 벌크형" },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "m34",
        title: "크림치즈",
        category: "milk",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                columns: ["1바트이상", "1바트"],
                ingredients: [
                    { name: "크림치즈", amounts: ["600", "500"] },
                    { name: "시럽", amounts: ["1,300", "1,100"] },
                    { name: "우유", amounts: ["3팩 (2,700)", "2,300"] },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블랜더에 조각 낸 크림치즈에 시럽을 넣고 완전히 갈아준다",
                    "배합통에 1번을 붓고 우유를 넣는다.",
                ],
            },
        ],
        notes: [
            "❗크림치즈 비닐 완벽히 제거!",
        ],
        images: [
            { src: "/recipe-images/m34-1.png", caption: "코스트코 라스카스크" },
        ],
        imageColor: "#FBEFE3",
    },
    {
        id: "m35",
        title: "에스프레소크림치즈",
        category: "milk",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                columns: ["1바트이상", "1바트"],
                ingredients: [
                    { name: "크림치즈", amounts: ["500", "400"] },
                    { name: "시럽", amounts: ["1,400", "1,100"] },
                    { name: "샷", amounts: ["600", "480"] },
                    { name: "우유", amounts: ["3팩 (2,700)", "2,200"] },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블랜더에 크림치즈 조각내서 넣은 후 시럽을 넣고 완전히 갈아준다",
                    "배합통에 1번을 넣고, 에스프레소샷과 우유를 넣어 섞어준다",
                ],
            },
        ],
        imageColor: "#FFF9EC",
    },
    {
        id: "m36",
        title: "트리플치즈 (고르곤졸라,체다,스위스치즈)",
        category: "milk",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "체다치즈", amount: "75" },
                    { name: "스위스치즈", amount: "100" },
                    { name: "고르곤졸라", amount: "120" },
                    { name: "시럽", amount: "1,300" },
                    { name: "우유", amount: "3팩 (2,700)" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 치즈 3종과 시럽 모두 넣고 곱게 갈아준다",
                    "우유를 넣고 잘 저어준다.",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m36-1.png", caption: "코스트코 슈레드채다" },
            { src: "/recipe-images/m36-2.jpg", caption: "코스트코 스위스아메" },
            { src: "/recipe-images/m36-3.jpg", caption: "코스트코 고르곤졸라" },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "m37",
        title: "라즈베리 마스카포네",
        category: "milk",
        hardness: 27,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "마스카포네", amount: "500" },
                    { name: "시럽", amount: "1,100" },
                    { name: "우유", amount: "2,400" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "마스카포네 치즈에 시럽을 넣고 잘 풀어준다",
                    "1번에 우유를 넣고 충분히 섞는다",
                ],
            },
        ],
        notes: [
            "❗람포네(라즈베리페이스트)는 판매시 젤라크림 위에",
            "2~3스쿱 올려둔 뒤 섞어가면 판매한다.",
            "(농도가 진하기때문에 너무 많이 섞지 않아도 됨)",
        ],
        images: [
            { src: "/recipe-images/m37-1.png", caption: "FG 람포네" },
            { src: "/recipe-images/m37-2.jpg", caption: "선인 - 마스카포네치 8" },
        ],
        imageColor: "#FDF3E7",
    },
    {
        id: "m38",
        title: "무화과크림치즈",
        category: "milk",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "건 무화과 / 졸인 무화과", amount: "300" },
                    { name: "크림치즈", amount: "400" },
                    { name: "시럽", amount: "1,200" },
                    { name: "우유", amount: "3팩 (2,700)" },
                ],
            },
            {
                ingredients: [
                    { name: "무화과 졸이는 방법", amount: "(3번 만들 양)" },
                    { name: "반 건조 무화과", amount: "1,000" },
                    { name: "레드 와인", amount: "1,000" },
                    { name: "머스코바도 (흑당)", amount: "300" },
                    { name: "시나몬가루", amount: "2" },
                    { name: "레몬즙", amount: "15" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 무화과 + 크림치즈 +  시럽을 넣고 곱게 갈아준다",
                    "우유를 넣고 섞어준다",
                    "블렌더에 졸인무화과 + 시럽 600g 넣고 약하게 갈아준다",
                    "블렌더에 크림치즈 + 시럽 600g 넣고 곱게(세게) 갈아준다",
                    "반건조 무화과를 뜨거운 정수기 물에 10분 정도 불려준다",
                    "불린 무화과를 정수기 물로 3번 헹군 후 채에 걸러 물기를 빼준다",
                    "무화과 꼭지 부분이 있으면 가위로 잘라준다",
                    "불린 무화과를 반으로 잘라준다",
                    "큰 냄비에 무화과, 와인, 머스코바도를 넣고 중불에 저어가며 졸여준다",
                    "와인이 끓어 오르고 10분정도 더 저어가며 졸여준다",
                    "10분이 지난 후 레몬즙, 시나몬가루를 넣고 약불에 5분정도 저어가며 졸여준다 (와인이 거의 안보일 때 까지)",
                    "식혀서 밀폐용기에 보관한다",
                ],
            },
        ],
        notes: [
            "‼전날 미리 건무화과를 시럽에 담궈서 불려둔후 건져서 사용!",
            "<졸인무화과 사용시>",
            "참고 : https://naver.me/x10YVxLN",
            "📍큰냄비 사용 (많이 튀어요!)",
            ">달지않게 흑설탕 제외, 머스코바도(흑당)으로만!",
            "‼ 졸인 무화과로 만들 때는 믹서에 약하게 갈아준다!",
        ],
        images: [
            { src: "/recipe-images/m38-1.png", caption: "코스트코 라스카스크" },
            { src: "/recipe-images/m38-2.png" },
        ],
        purchaseLinks: [
            { item: "구매 참고 링크 열기", url: "https://naver.me/x10YVxLN" },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "m39",
        title: "고소한볶음땅콩",
        category: "milk",
        hardness: 26,
        tags: ["믹서", "가을"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "땅콩", amount: "220" },
                    { name: "소금", amount: "15" },
                    { name: "시럽", amount: "600" },
                    { name: "우유", amount: "2,200" },
                    { name: "화이트베이스", amount: "1,800" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 땅콩, 소금을 넣고 곱게 갈아준다 (피스타치오와 동일)",
                    "1번을 믹싱볼에 넣고 우유와 화이트베이스를 넣고 섞어준다.",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m39-1.jpg", caption: "코스트코 로스티드피" },
        ],
        imageColor: "#FBEFE3",
    },
    {
        id: "m40",
        title: "고추장초콜릿",
        category: "milk",
        hardness: 27,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "고추장", amount: "150" },
                    { name: "시럽", amount: "1,400" },
                    { name: "카카오파우더", amount: "180" },
                    { name: "우유", amount: "2,500" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "먼저 고추장과 시럽을 먼저 믹서나 거품기로 잘 풀어준다.",
                    "고추장이 다 풀어진 시럽에 파우더를 넣고 잘 풀어준다.",
                    "우유를 마지막에 넣고 저어준다. (생크림은 안들어갑니다)",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m40-2.png" },
        ],
        imageColor: "#FFF9EC",
    },
    {
        id: "m41",
        title: "잣(파인너츠)",
        category: "milk",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "화이트베이스", amount: "3,000" },
                    { name: "잣", amount: "250" },
                    { name: "소금", amount: "10" },
                ],
            },
            {
                title: "< 방법 2 >",
                ingredients: [
                    { name: "잣", amount: "250" },
                    { name: "시럽", amount: "1,100" },
                    { name: "소금", amount: "10" },
                    { name: "생크림", amount: "200" },
                    { name: "우유", amount: "2,300" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 잣, 소금 + 화이트베이스 1000g를 넣고 곱게 갈아준다",
                    "믹싱볼에 1번을 넣고 나머지 화이트베이스 2000g을 넣고 섞어준다",
                    "블렌더에 잣, 시럽, 소금을 넣고 곱게 갈아준다",
                    "생크림 우유를 차례로 넣고 갈아준",
                ],
            },
        ],
        notes: [
            "< 방법 1 > ‼추천!",
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "m42",
        title: "솔티드카라멜",
        category: "milk",
        hardness: 28,
        tags: [],
        ingredientGroups: [
            {
                columns: ["넘치는 1바트", "평평한 1바트"],
                ingredients: [
                    { name: "카라멜", amounts: ["600", "500"] },
                    { name: "소금", amounts: ["10", "8"] },
                    { name: "시럽", amounts: ["750", "600"] },
                    { name: "콩검", amounts: ["20", "10"] },
                    { name: "생크림", amounts: ["200", "160"] },
                    { name: "우유", amounts: ["3팩 (2,700)", "2팩 (1,800)"] },
                ],
            },
            {
                title: "카라멜 레시피",
                ingredients: [
                    { name: "설탕", amount: "900" },
                    { name: "포도당", amount: "100" },
                    { name: "생크림", amount: "800" },
                    { name: "소금", amount: "40" },
                    { name: "버터", amount: "200 (2조각)" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "배합통에 카라멜 + 소금 + 시럽 + 콩검을 넣고 잘 섞어준다",
                    "생크림, 우유를 차례로 넣고 저어준다",
                    "냄비에 설탕과 포도당을 넣고 가장 센불로 녹인다",
                    "내용물이 팔팔 끓기 직전까지 끓인다(색상(진한밤색)과 맛의 풍미를 위해서)",
                    "불을 약하게 줄인 후 생크림 조금씩 부으면서 섞는다",
                    "불을 끈 후에 버터를 넣고 잔열로 녹인다",
                ],
            },
        ],
        imageColor: "#FDF3E7",
    },
    {
        id: "m43",
        title: "솔티크래커",
        category: "milk",
        hardness: 28,
        tags: ["시그니처"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "시럽", amount: "1,300" },
                    { name: "소금", amount: "25" },
                    { name: "생크림", amount: "200" },
                    { name: "우유", amount: "3팩 (2,700)" },
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m43-1.png", caption: "코스트코 솔틴크래커" },
            { src: "/recipe-images/m43-2.png", caption: "참크래서" },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "m44",
        title: "메이플 시나몬",
        category: "milk",
        hardness: 28,
        tags: ["겨울"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "메이플시럽", amount: "800" },
                    { name: "시럽", amount: "500" },
                    { name: "시나몬가루", amount: "2~3" },
                    { name: "콩검", amount: "30" },
                    { name: "생크림", amount: "500" },
                    { name: "우유", amount: "2,500" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "시럽, 메이플시럽, 시나몬가루, 콩검을 넣고 잘 풀어준다",
                    "생크림, 우유를 차례로 넣고 섞어준다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m44-1.jpg", caption: "코스트코 메이플시럽" },
            { src: "/recipe-images/m44-2.jpg", caption: "계피가루 100" },
            { src: "/recipe-images/m44-3.png" },
        ],
        imageColor: "#FBEFE3",
    },
    {
        id: "m45",
        title: "가마솥에 누룽지",
        category: "milk",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "찹쌀누룽지", amounts: ["200", "150"] },
                    { name: "시럽", amounts: ["1,300", "975"] },
                    { name: "소금", amounts: ["10", "7"] },
                    { name: "미숫가루", amounts: ["5", "4"] },
                    { name: "생크림", amounts: ["300", "225"] },
                    { name: "우유", amounts: ["3팩 (2,700)", "2025"] },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블랜더에 누룽지, 미숫가루, 소금을 넣고 시럽을 부어 갈아준다 (약하게 갈아도 됨, 갈아준 후 10분 정도 불려준다)",
                    "배합통에 1번과  생크림 우유를 차례로 넣고 섞어준다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m45-1.png", caption: "한살림 찹쌀누룽지" },
        ],
        imageColor: "#FFF9EC",
    },
    {
        id: "m46",
        title: "유기농 밤",
        category: "milk",
        hardness: 26,
        tags: ["믹서", "가을", "겨울"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "맛밤", amount: "800" },
                    { name: "머스코바도(흑당)", amount: "200" },
                    { name: "시럽", amount: "1,300" },
                    { name: "소금", amount: "10" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "2500" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "냄비에 맛밤714g 한 상자를 까서 밤알을 4등분 내서 잘라준다",
                    "1번 냄비에 머스코바도 200g과 물 200g을 넣고 160℃에서 20분정도 졸인다",
                    "블렌더에 졸인 밤 400g과 시럽, 소금을 넣고 완전히 곱게 갈아준다",
                    "남은 밤은 블렌더에 약하게 살짝만 갈아준다",
                    "배합통에 3번, 4번을 다 넣고 생크림, 우유를 넣고 섞는다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m46-1.png" },
            { src: "/recipe-images/m46-2.png" },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "m47",
        title: "화이트베이스(스트라치아뗄라, 순수벌꿀, 피칸프랄린)",
        category: "milk",
        tags: [],
        ingredientGroups: [
            {
                title: "화이트베이스",
                ingredients: [
                    { name: "우유", amount: "3팩 (2,700)" },
                    { name: "물엿", amount: "135" },
                    { name: "설탕", amount: "470" },
                    { name: "포도당", amount: "55" },
                    { name: "탈지분유", amount: "135" },
                    { name: "생크림", amount: "430" },
                    { name: "-", amount: "3,925" },
                ],
            },
        ],
        stepGroups: [
            {
                title: "화이트베이스 끓이는 법",
                steps: [
                    "우유 1개와 물엿을 60~80℃ 정도로 10분 타이머를 맞추고 데워준다",
                    "2분정도 후 데워진 우유에 설탕, 포도당, 탈지분유를 넣고 잘 풀어준다.\n(‼다른재료보다 데워진 우유에 탈지분유를 먼저 넣고 잘 섞어서 풀어주면 탈지분유가 뭉치지 않습니다.)",
                    "가루가 다 풀어진 후  생크림을 넣고 저어준다.",
                    "배합통에 나머지 우유 2개 넣고 다 끓은 3번을 붓고 섞어준다.",
                ],
            },
        ],
        notes: [
            "머신 경도값:",
            "스트라치아뗄라 27",
            "순수벌꿀 28",
            "피칸프랄린 27",
            "이스파한 ( 이스파한(리치,장미,라즈베리))",
            "체리청밀크  (체리청밀크)",
            "민트초코칩 ( 민트초코칩)",
            "메이플 월넛 (메이플 월넛)",
            "유기농 잣 (잣(파인너츠))",
            "헤이즐넛 (헤이즐넛)",
            "고소한볶음땅콩 (고소한볶음땅콩)",
            "와사비 (와사비)",
            "생바나나우유/생바나나초코칩 (생바나나우유 / 생바나나초코칩)",
            "‼화이트베이스를 이용한 젤라크림 제조시 블렌더에는 재료 + 시럽 (화이트베이스) 만 넣어 사용!",
            "스트라치아뗄라 : 젤라크림을 뽑을 때 초코시럽 듬뿍 뿌리면서 섞는다",
            "순수 벌꿀 : 판매 할 때 위에 꿀을 뿌리고 섞어서 제공한다",
            "피칸프랄린: 젤라크림 위에 피칸프랄린을 잘게 뿌셔 토핑으로 뿌리고 섞어서 판매",
        ],
        images: [
            { src: "/recipe-images/m47-1.png", caption: "FG 스트라치아뗄라 코" },
            { src: "/recipe-images/m47-2.png", caption: "코스트코 야생화꿀" },
        ],
        imageColor: "#FDF3E7",
    },
    {
        id: "m48",
        title: "캠벨포도",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "포도즙", amount: "1,000 (한병)" },
                    { name: "시럽", amount: "1,200" },
                    { name: "레몬즙", amount: "200" },
                    { name: "콩검", amount: "10" },
                    { name: "생크림", amount: "500" },
                    { name: "우유", amount: "1,500" },
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m48-1.png", caption: "한살림 포도주스 포도" },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "m49",
        title: "와사비",
        category: "milk",
        hardness: 25,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "화이트베이스", amount: "2,000" },
                    { name: "우유", amount: "1,000" },
                    { name: "시럽", amount: "200" },
                    { name: "와사비가루", amount: "60" },
                    { name: "콩검", amount: "20" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "시럽에 와사비가루, 콩검을 넣고 잘 풀어준다",
                    "화이트베이스와 우유를 넣고 잘 섞어준다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m49-1.png" },
        ],
        imageColor: "#FBEFE3",
    },
    {
        id: "m50",
        title: "찐 바닐라",
        category: "milk",
        hardness: 28,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "우유", amounts: ["4팩 (3,600)", "3팩 (2,700)"] },
                    { name: "노른자", amounts: ["300", "225"] },
                    { name: "설탕", amounts: ["550", "410"] },
                    { name: "포도당", amounts: ["300", "225"] },
                    { name: "탈지분유", amounts: ["300", "225"] },
                    { name: "생크림", amounts: ["300", "225"] },
                    { name: "바닐라빈", amounts: ["4개 (10cm내외)", "3개 (10cm내외)"] },
                    { name: "└ or 바닐라빈가루", amounts: ["16g", "12g"] },
                    { name: "버터", amounts: ["200 (2스틱)", "150 (1스틱 반)"] },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "냄비에 우유 2개와 노른자를 먼저 잘 풀어준다. 80℃ . 15분 타이머",
                    "바닐라빈을 길게 반으로 갈라서 냄비에 넣어준다",
                    "냄비가 데워지면 설탕, 포도당, 탈지분유, 버터를 넣고 계속 저어준다\n(‼다른재료보다 데워진 우유에 탈지분유를 먼저 넣고 잘 섞어서 풀어주면 탈지분유가 뭉치지 않습니다.)",
                    "3번이 다 녹으면 남은 생크림을 넣고 잘 섞는다",
                    "나머지 우유 2개를 넣고 저어준다",
                ],
            },
        ],
        notes: [
            "‼잘 눌러붙고 잘 타므로 불 켜져있는동안 계속해서 저어준다",
        ],
        images: [
            { src: "/recipe-images/m50-1.png", caption: "바닐라빈" },
        ],
        imageColor: "#FFF9EC",
    },
    {
        id: "m51",
        title: "달고나밀크",
        category: "milk",
        hardness: 27,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "달고나", amount: "100" },
                    { name: "시럽", amount: "1,200" },
                    { name: "우유", amount: "3팩 (2,700)" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "시럽에 달고나를 넣고 거품기로 부셔준다",
                    "우유를 넣고 저어준다.",
                ],
            },
            {
                title: "달고나 레시피 : 설탕 700, 식소다 15",
                steps: [
                    "설탕을 웍에 녹인다 (바닥에 설탕이 타지 않도록 잘 저어준다) – 쎈 불",
                    "설탕의 알갱이가 보이지 않고 완전히 묽어질 때까지 녹인다 – 제일 약한 불",
                    "불을 끄고 살짝 식힌 후 식소다를 조금씩 넣으면서 저어준다",
                    "베이킹 시트에 완성된 달고나를 부은 후 골고루 펴준다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m51-1.png", caption: "식소다" },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "m52",
        title: "군고구마",
        category: "milk",
        hardness: 26,
        tags: ["믹서", "가을", "겨울"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "구운 고구마", amount: "900" },
                    { name: "시럽", amount: "1,400" },
                    { name: "소금", amount: "10" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "2,200" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 고구마 + 시럽 + 소금을 넣고 곱게 갈아준다 (섬유질 최대한 안걸리게 완전히 갈아주세요)",
                    "생크림, 우유를 차례로 넣고 섞어준다",
                    "고구마를 흐르는 물에 씻어 준다",
                    "두껍고 큰 고구마는 반 잘라준다",
                    "에어프라이기에 15~20분 정도 구워준다",
                ],
            },
        ],
        notes: [
            "<고구마 굽는 법>",
            "호박고구마로 만들면 노란색으로 컬러가 더 예쁨",
            "호박고구마가 많이 달면 믹싱할때 당도 확인하며 시럽넣기",
        ],
        imageColor: "#FDF3E7",
    },
    {
        id: "m53",
        title: "초코케이크(오예스)",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "오예스과자", amount: "10개" },
                    { name: "시럽", amount: "1,200" },
                    { name: "카카오파우더", amount: "20" },
                    { name: "소금", amount: "5" },
                    { name: "생크림", amount: "200" },
                    { name: "우유", amount: "2,500" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "시럽에 오예스를 넣고 거품기로 부숴준다.",
                    "소금, 파우더를 넣고 잘 섞어준다",
                    "생크림, 우유를 섞는다",
                ],
            },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "m54",
        title: "이스파한(리치,장미,라즈베리)",
        category: "milk",
        hardness: 27,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "화이트베이스", amount: "4,000" },
                    { name: "시럽", amount: "300" },
                    { name: "리치퓨레", amount: "150" },
                    { name: "레몬즙", amount: "50" },
                    { name: "장미액", amount: "100" },
                    { name: "└ or 장미분말", amount: "20" },
                    { name: "라즈베리퓨레", amount: "35" },
                ],
            },
        ],
        notes: [
            "모든 재료를 순서대로 배합통에 넣고 잘 저어준",
        ],
        images: [
            { src: "/recipe-images/m54-1.png", caption: "FG 람포네" },
            { src: "/recipe-images/m54-2.jpg", caption: "레몬즙 100 (다른 성분 X)" },
            { src: "/recipe-images/m54-3.png", caption: "선인(아이키친몰) 리" },
            { src: "/recipe-images/m54-4.png", caption: "쿠팡 장미액" },
        ],
        imageColor: "#FBEFE3",
    },
    {
        id: "m55",
        title: "라벤더레몬크림",
        category: "milk",
        hardness: 27,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "라벤더 시럽", amounts: ["1,400", "1,600"] },
                    { name: "레몬즙", amounts: ["500", "570"] },
                    { name: "우유", amounts: ["2,000", "2,280"] },
                ],
            },
            {
                ingredients: [
                    { name: "시럽 양", amounts: ["2 kg (1봉)", "6 kg (3봉)"] },
                    { name: "라벤더 잎", amounts: ["35g", "100g"] },
                ],
            },
        ],
        stepGroups: [
            {
                title: "라벤더 시럽 레시피",
                steps: [
                    "시럽 파우치 1개 (2kg)를 냄비에 넣고 끓으면 불을 끈다",
                    "끓인 시럽에 꽃잎 35g을 넣고 우린다",
                    "꽃잎을 체로 건져낸다",
                    "식힌 후 통에 담아 냉장 보관한다.",
                ],
            },
        ],
        notes: [
            "(밀크티시럽과 동일한방법)",
        ],
        imageColor: "#FFF9EC",
    },
    {
        id: "m56",
        title: "유기농 흑미밥 (리조 네로)",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "우유", amount: "3,200" },
                    { name: "설탕", amount: "500" },
                    { name: "포도당", amount: "100" },
                    { name: "흑미밥", amount: "300" },
                    { name: "미숫가루", amount: "20" },
                ],
            },
        ],
        stepGroups: [
            {
                title: "< 흑미밥 제조 방법 >",
                steps: [
                    "냄비에 우유 1통과 미숫가루를 푼다",
                    "-설탕, 포도당을 넣고 저어준다.",
                    "흑미밥(냉동보관시 완벽하게 해동 후 사용, 알갱이가 살아있게!)을 2.에 넣고 밥알을 풀고 60~80℃에서 설탕이 녹을 때 까지 끓인다(약 10분, 중간중간 저어주기)",
                    "다 녹으면 나머지 우유를 넣고 저어준다",
                ],
            },
            {
                title: "<흑미밥하는 방법>",
                steps: [
                    "유기농찰흑미 500g을 정수기 물로 2번 씻어준다.",
                    "밥솥에 씻은 쌀과 정수기 물을 손등까지 (질게 되도록 쌀밥보다 물 양 넉넉히) 맞춘 후 ‘취사’ 버튼 누른다.",
                    "다 된 후 ‘보온’으로 돌아가면 주걱으로 뒤섞어서 한김 뺀 후 4개의 통에 똑같은 양으로 나눠 담아준다",
                    "소분한 밥을 식힌 후 냉동실에 얼려준다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m56-1.png", caption: "한살림 유기농 흑미" },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "m57",
        title: "티라미수 / 밤티라미수",
        category: "milk",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                title: "커피시럽",
                ingredients: [
                    { name: "에스프레소", amount: "300" },
                    { name: "시럽", amount: "400" },
                    { name: "사보이아르디", amount: "24개" },
                ],
            },
            {
                title: "티라미수",
                ingredients: [
                    { name: "크림치즈", amount: "400" },
                    { name: "시럽", amount: "850" },
                    { name: "우유", amount: "2팩 (1,800)" },
                ],
            },
            {
                title: "밤 티라미수",
                ingredients: [
                    { name: "크림치즈", amount: "300" },
                    { name: "졸인 밤", amount: "200-300" },
                    { name: "시럽", amount: "800" },
                    { name: "우유", amount: "2팩 (1,800)" },
                ],
            },
        ],
        stepGroups: [
            {
                title: "티라미수 뽑는법",
                steps: [
                    "커피시럽에 사보이아르디 과자를 적신 후 펼쳐서 냉동실에 넣어둔다",
                    "크림치즈 아이스크림을 만들고 제조기에 돌린다",
                    "바트에\n크림치즈 - 과자8개 - 크림치즈 - 과자8개 - 크림치즈 - 과자8개 - 크림치즈\n이 순서로 쌓고 맨 위에 Extra 다크(카카오 파우더)를 뿌려준다",
                ],
            },
        ],
        instructionImages: [
            { src: "/recipe-images/m57-d1.png" },
        ],
        images: [
            { src: "/recipe-images/m57-1.png" },
            { src: "/recipe-images/m57-2.png", caption: "코스트코 라스카스크" },
            { src: "/recipe-images/m57-3.png", caption: "선인(아이키친몰) 마" },
        ],
        imageColor: "#FDF3E7",
    },
    {
        id: "m58",
        title: "한살림 미숫가루",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "시럽", amount: "1,400" },
                    { name: "미숫가루", amount: "200" },
                    { name: "소금", amount: "5" },
                    { name: "우유", amount: "3팩 (2,700)" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "시럽에 미숫가루, 소금을 넣고 저어서 충분히 잘 풀어준다",
                    "우유를 넣고 섞어준다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m58-1.png", caption: "한살림 미숫가후" },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "m59",
        title: "유기농 그릭요거트",
        category: "milk",
        hardness: 28,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "그릭요거트", amount: "2,500" },
                    { name: "시럽", amount: "1,500" },
                    { name: "우유", amount: "500" },
                    { name: "콩검", amount: "20" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "시럽에 콩검을 풀어준다",
                    "배합통에 요거트를 넣은 후 잘 풀어준다",
                    "우유도 넣은 후 저어준다",
                ],
            },
        ],
        notes: [
            "‼️ 뉴트랄린 10 = 콩검 20 = 화이버 30~40",
        ],
        imageColor: "#FBEFE3",
    },
    {
        id: "m60",
        title: "살얼음 식혜",
        category: "milk",
        hardness: 25,
        tags: ["여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "식혜", amount: "2,000" },
                    { name: "시럽", amount: "1,100" },
                    { name: "콩검", amount: "10" },
                    { name: "우유", amount: "1,000" },
                ],
            },
        ],
        notes: [
            "모든 재료를 차례로 넣은 뒤 섞어준다",
        ],
        images: [
            { src: "/recipe-images/m60-1.png", caption: "한살림 얼음식혜" },
        ],
        imageColor: "#FFF9EC",
    },
    {
        id: "m61",
        title: "녹차크림치즈",
        category: "milk",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "크림치즈", amount: "500" },
                    { name: "시럽", amount: "1,300" },
                    { name: "녹차가루", amount: "30" },
                    { name: "우유", amount: "2,500" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블랜더에 조각 낸 크림치즈에 시럽을 넣고 완전히 갈아준다",
                    "배합통에 1번을 붓고 녹차가루를 넣고 잘 섞어준다",
                    "우유를 넣고 저어준다.",
                ],
            },
        ],
        notes: [
            "❗크림치즈 비닐 완벽히 제거!",
        ],
        images: [
            { src: "/recipe-images/m61-1.png", caption: "유기농 가루 녹차 말" },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "m62",
        title: "쿠크다스 (화이트토르테)",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                columns: ["1바트이상", "1바트"],
                ingredients: [
                    { name: "쿠크다스", amounts: ["500", "370"] },
                    { name: "시럽", amounts: ["1,500", "1,100"] },
                    { name: "소금", amounts: ["8", "5"] },
                    { name: "생크림", amounts: ["400", "300"] },
                    { name: "우유", amounts: ["3팩 (2,700)", "2,100"] },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "시럽에 쿠크다스를 넣고 거품기로 부숴준다.",
                    "생크림, 우유를 섞는다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m62-1.png", caption: "쿠크다스" },
        ],
        imageColor: "#FDF3E7",
    },
    {
        id: "m63",
        title: "레몬크림크럼블",
        category: "milk",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "레몬즙", amount: "550" },
                    { name: "시럽", amount: "1,400" },
                    { name: "생크림", amount: "350" },
                    { name: "우유", amount: "2,000" },
                    { name: "크럼블" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "배합통에 다 넣고 섞는다",
                    "아이스크림 뽑을 때 크럼블 많이 뿌리면서 섞어서 받는다",
                ],
            },
        ],
        images: [
            { src: "/recipe-images/m63-1.png", caption: "FG 크럼블" },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "m64",
        title: "유기농 우유 (오레오밀크, 팥빙수)",
        category: "milk",
        hardness: 26,
        tags: ["여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "시럽", amount: "1,100" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "3팩 (2,700)" },
                ],
            },
        ],
        notes: [
            "오레오밀크: 유기농 우유 위에 오레오를 뿌셔 판매",
            "팥빙수: 유기농 우유 위에 빙수팥, 미숫가루, 다이스 인절미를 올려 판매",
        ],
        imageColor: "#FBEFE3",
    },
    {
        id: "s1",
        title: "체리요거트",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서", "냉동"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "체리 (냉동)", amount: "1,000" },
                    { name: "시럽", amount: "1,080" },
                    { name: "레몬즙", amount: "25" },
                    { name: "플레인요거트", amount: "1,800" },
                ],
            },
        ],
        images: [
            { src: "/recipe-images/s1-1.png" },
            { src: "/recipe-images/s1-2.png" },
        ],
        imageColor: "#FFEBEE",
    },
    {
        id: "s2",
        title: "토마토바질소르베",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "완숙 토마토", amount: "2,000" },
                    { name: "시럽", amount: "1,250" },
                    { name: "소금", amount: "5" },
                    { name: "바질", amount: "2  (생바질은 20g)" },
                    { name: "정수", amount: "300" },
                ],
            },
        ],
        notes: [
            "‼️ 블렌더에 토마토를 갈 때 소금과 건바질을 함께 넣어 곱게 간다.(건바질 줄기에 잇몸이 찔렸다는 컴플레인 있었음)",
            "‼️ 생바질을 넣을때는 바질을 많이 갈지않고 입자가 보이도록해 소르베의 색이 탁해지지않도록 한다",
        ],
        imageColor: "#FCE4EC",
    },
    {
        id: "s3",
        title: "블루베리소르베(냉동)",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서", "냉동"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "냉동블루베리", amounts: ["2,000", "1,500"] },
                    { name: "시럽", amounts: ["1,250", "950"] },
                    { name: "레몬즙", amounts: ["20", "15"] },
                    { name: "정수", amounts: ["1,000", "800"] },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 블루베리 1000 +  시럽 반 만 넣고 곱게 갈아준다  X 2 반복",
                    "레몬즙, 물을 넣고 섞어준다",
                    "배합통에 1번 두번 모두 넣고 물, 레몬즙을 넣고 섞는다",
                ],
            },
        ],
        notes: [
            "냉동 블루베리는 미리 꺼내서 해동시킨다",
            "ex) 전날 저녁에 냉장고에 넣어두기",
            "당일날 뜨거운 물에 봉지째 담궈놓기",
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "s4",
        title: "라즈베리",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서", "냉동"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "라즈베리(냉동)", amount: "1,000" },
                    { name: "시럽", amount: "1,000" },
                    { name: "레몬즙", amount: "150" },
                    { name: "우유", amount: "1,500" },
                ],
            },
        ],
        imageColor: "#E3F2FD",
    },
    {
        id: "s5",
        title: "토마토소르베",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "토마토", amount: "2,000" },
                    { name: "시럽", amount: "1,250" },
                    { name: "소금", amount: "5 대저짭잘이는10" },
                    { name: "정수", amount: "300" },
                ],
            },
        ],
        notes: [
            "대저, 짭짤이, 방울,스테비아 등 모든 토마토",
            "블렌더에 토마토 1000 + 시럽 650 + 소금 5 넣고 곱게 갈아준다 X2",
        ],
        imageColor: "#F1F8E9",
    },
    {
        id: "s6",
        title: "멜론소르베 / 메론",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서", "여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "멜론", amount: "2,000" },
                    { name: "시럽", amount: "1,600" },
                    { name: "정수", amount: "500" },
                ],
            },
            {
                title: "머스크멜론",
                ingredients: [
                    { name: "머스크멜론", amount: "1,500" },
                    { name: "시럽", amount: "950" },
                    { name: "레몬즙", amount: "20" },
                    { name: "우유", amount: "600" },
                ],
            },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "s7",
        title: "귤 소르베, 청귤 (오렌지, 한라봉, 천혜향 등)",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서", "겨울", "봄", "여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "과일", amount: "2,000" },
                    { name: "시럽", amount: "1,200 ~ 1,300" },
                    { name: "레몬즙", amount: "100 ~ 150" },
                    { name: "정수", amount: "100 ~ 200" },
                ],
            },
            {
                ingredients: [
                    { name: "청귤 - 껍질 O", amount: "400" },
                    { name: "- 껍질 X", amount: "800" },
                    { name: "시럽", amount: "1,500" },
                    { name: "레몬", amount: "100" },
                    { name: "우유", amount: "1,000" },
                ],
            },
        ],
        notes: [
            "‼️귤 종류는 블랜더에 과일을 갈 때 3번정도 갈면 속껍질이 덜 씹힘",
        ],
        imageColor: "#FFEBEE",
    },
    {
        id: "s8",
        title: "배소르베",
        category: "sorbet",
        hardness: 24,
        tags: ["믹서", "가을"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "배", amount: "2,000" },
                    { name: "시럽", amount: "1,170" },
                    { name: "정수", amount: "700" },
                    { name: "콩검", amount: "10" },
                ],
            },
        ],
        imageColor: "#FCE4EC",
    },
    {
        id: "s9",
        title: "트리플베리",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서", "냉동"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "트리플베리(냉동)", amounts: ["1,200", "1,000"] },
                    { name: "시럽", amounts: ["1,350", "1,125"] },
                    { name: "레몬즙", amounts: ["150", "125"] },
                    { name: "우유", amounts: ["1,500", "1,250"] },
                ],
            },
        ],
        images: [
            { src: "/recipe-images/s9-1.png" },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "s10",
        title: "딸기우유",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서", "냉동", "겨울"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "딸기", amount: "1,000" },
                    { name: "시럽", amount: "1,300" },
                    { name: "레몬", amount: "120" },
                    { name: "우유", amount: "1,800 (2통)" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 딸기 + 시럽 반만 넣고 곱게 갈아준다. (생딸기는 살짝만 갈아준다)",
                    "배합통에 레몬즙, 우유를 차례로 넣고 섞어준다",
                ],
            },
        ],
        imageColor: "#E3F2FD",
    },
    {
        id: "s11",
        title: "키위바나나소르베",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "키위", amount: "1,000" },
                    { name: "바나나", amount: "700" },
                    { name: "시럽", amount: "1,200" },
                    { name: "레몬즙", amount: "50" },
                    { name: "정수", amount: "500" },
                ],
            },
        ],
        notes: [
            "간 보고 시럽양 조절!!!",
            "키위는 충분히 후숙 시킨 후",
            "믹서에 살짝만 갈아주세요 ( 검정씨 갈리지 않도록!)",
        ],
        imageColor: "#F1F8E9",
    },
    {
        id: "s12",
        title: "다크 체리",
        category: "sorbet",
        hardness: 27,
        tags: ["믹서", "냉동"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "체리 (냉동)", amount: "2,000" },
                    { name: "시럽", amount: "1,400" },
                    { name: "레몬", amount: "100" },
                    { name: "우유", amount: "2,000" },
                ],
            },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "s13",
        title: "아보카도바나나소르베",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "생아보카도", amount: "500" },
                    { name: "생바나나", amount: "1,000" },
                    { name: "시럽", amount: "1,260" },
                    { name: "물", amount: "800" },
                ],
            },
        ],
        imageColor: "#FFEBEE",
    },
    {
        id: "s14",
        title: "무화과소르베",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서", "여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "무화과", amount: "2,000" },
                    { name: "시럽", amount: "1,250" },
                    { name: "레몬즙", amount: "70" },
                    { name: "정수", amount: "400" },
                ],
            },
        ],
        imageColor: "#FCE4EC",
    },
    {
        id: "s15",
        title: "깔라만시소르베",
        category: "sorbet",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "깔라만시 즙", amount: "1,000" },
                    { name: "시럽", amount: "1,800" },
                    { name: "물", amount: "1,000" },
                    { name: "콩검", amount: "15" },
                ],
            },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "s16",
        title: "딸기소르베(냉동)",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서", "냉동"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "냉동딸기", amount: "2,000" },
                    { name: "시럽", amount: "1,200 / 1,300(판교)" },
                    { name: "레몬즙", amount: "70" },
                    { name: "정수", amount: "300" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 딸기 1000 + 시럽 600 을 넣고 곱게 갈아준다 x 2 (얼어있는 딸기는 세게 / 충분히 녹은 딸기는 약하게 갈아준다)",
                    "배합통에 1번 두번 모두 넣고 물, 레몬즙을 넣고 섞는다",
                ],
            },
        ],
        notes: [
            "냉동 딸기는 미리 꺼내서 해동시킨다",
            "ex) 전날 저녁에 냉장고에 넣어두기",
            "당일 날 따뜻한 물에 봉지째 담궈놓기",
        ],
        imageColor: "#E3F2FD",
    },
    {
        id: "s17",
        title: "복숭아소르베 (천도,백도,황도)",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서", "여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "딱딱한 복숭아", amount: "2,000" },
                    { name: "시럽", amount: "1,300" },
                    { name: "레몬즙", amount: "30" },
                    { name: "정수", amount: "300" },
                ],
            },
            {
                ingredients: [
                    { name: "물렁한 백도 갈변주의!!!", amount: "2,000" },
                    { name: "시럽", amount: "900" },
                    { name: "레몬즙", amount: "50" },
                    { name: "정수", amount: "500" },
                ],
            },
            {
                ingredients: [
                    { name: "천도,황도,신비", amount: "2,000" },
                    { name: "시럽", amount: "1,200" },
                    { name: "레몬즙", amount: "30" },
                    { name: "정수", amount: "400" },
                ],
            },
        ],
        notes: [
            "※ 털이 난 복숭아 껍질만 제거하고, 다른 복숭아는 껍질까지 사용한다\n※ 씨가 같이 갈리지 않도록 손질 시 완벽히 제거!",
            "※ 물 양은 항상 복숭아 당도에 따라 간 보고 조절",
        ],
        imageColor: "#F1F8E9",
    },
    {
        id: "s18",
        title: "홍시소르베",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서", "가을", "겨울"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "홍시", amount: "2,000" },
                    { name: "시럽", amount: "1,100" },
                    { name: "레몬즙", amount: "30" },
                    { name: "정수", amount: "700" },
                ],
            },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "s19",
        title: "적포도 / 청포도 소르베",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "포도", amount: "2,000" },
                    { name: "시럽", amount: "1,100" },
                    { name: "레몬즙", amount: "50" },
                    { name: "콩검", amount: "10" },
                    { name: "정수", amount: "600" },
                ],
            },
        ],
        notes: [
            "블렌더에 곱게 갈아준다",
        ],
        imageColor: "#FFEBEE",
    },
    {
        id: "s20",
        title: "레몬소르베",
        category: "sorbet",
        hardness: 27,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "레몬즙", amount: "1,000" },
                    { name: "시럽", amount: "1,800" },
                    { name: "콩검", amount: "20" },
                    { name: "정수", amount: "1,000" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "배합통에 레몬즙, 시럽, 물을 넣고 섞어준다",
                    "콩검을 넣고 충분히 풀어준다",
                ],
            },
        ],
        imageColor: "#FCE4EC",
    },
    {
        id: "s21",
        title: "캐모마일리치소르베",
        category: "sorbet",
        hardness: 27,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "캐모마일 시럽", amount: "900" },
                    { name: "리치", amount: "500" },
                    { name: "레몬즙", amount: "100" },
                    { name: "콩검", amount: "30" },
                    { name: "정수", amount: "2,300" },
                ],
            },
        ],
        notes: [
            "캐모마일 시럽",
            "시럽 1봉(3kg)에 캐모마일 꽃 50g 을 넣고 우린다",
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "s22",
        title: "(유기농) 참외",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서", "여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "참외", amount: "2,000" },
                    { name: "시럽", amount: "1,200" },
                    { name: "우유", amount: "1,200" },
                ],
            },
        ],
        notes: [
            "1",
            "* 다른 과일처럼 세척수(혹은 식초)에 세척하고 껍질과 씨까지 모두 사용한다",
        ],
        imageColor: "#E3F2FD",
    },
    {
        id: "s23",
        title: "블루베리요거트",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서", "냉동"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "플레인요거트", amount: "2,500" },
                    { name: "시럽", amount: "1,080" },
                    { name: "블루베리소르베", amount: "800" },
                ],
            },
        ],
        images: [
            { src: "/recipe-images/s23-1.png" },
        ],
        imageColor: "#F1F8E9",
    },
    {
        id: "s24",
        title: "생바나나우유 / 생바나나초코칩",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "바나나", amount: "1,000" },
                    { name: "화이트베이스", amount: "3,000" },
                ],
            },
        ],
        notes: [
            "‼️ 생바나나초코칩은 생바나나우유를 뽑을때 스트라치아뗄라 초코시럽을 뿌리면서 뽑는다.",
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "s25",
        title: "산딸기",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서", "냉동", "봄", "여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "산딸기(생/냉동)", amount: "1,000" },
                    { name: "시럽", amount: "1,500" },
                    { name: "레몬즙", amount: "150" },
                    { name: "우유", amount: "1,500" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "산딸기 많이 갈지 마세요. 많이 갈면 쓴맛이 올라옵니다.",
                ],
            },
        ],
        imageColor: "#FFEBEE",
    },
    {
        id: "s26",
        title: "단감소르베",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서", "가을"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "단감", amount: "1,800" },
                    { name: "시럽", amount: "1,250" },
                    { name: "레몬즙", amount: "50" },
                    { name: "정수", amount: "700" },
                ],
            },
        ],
        imageColor: "#FCE4EC",
    },
    {
        id: "s27",
        title: "자두소르베",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서", "여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "물렁한 자두", amount: "2,000" },
                    { name: "시럽", amount: "1,400" },
                    { name: "정수- 간보고", amount: "400~600" },
                ],
            },
            {
                ingredients: [
                    { name: "딱딱한 자두", amount: "2,000" },
                    { name: "시럽", amount: "1,700" },
                    { name: "정수- 간보고", amount: "최대 300" },
                ],
            },
            {
                ingredients: [
                    { name: "청자두", amount: "2,000" },
                    { name: "시럽", amount: "1,200" },
                    { name: "레몬즙", amount: "150" },
                    { name: "정수", amount: "350~500" },
                ],
            },
        ],
        notes: [
            "청자두",
            "※ 씨가 같이 갈리지 않도록 손질시 완벽히 제거!",
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "s28",
        title: "파인애플레몬바질소르베(파레바)",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서", "냉동"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "파인애플(냉동)", amount: "1,500" },
                    { name: "바질", amount: "80" },
                    { name: "시럽", amount: "1,200" },
                    { name: "레몬즙", amount: "300" },
                    { name: "정수", amount: "500" },
                ],
            },
        ],
        imageColor: "#E3F2FD",
    },
    {
        id: "s29",
        title: "참다래소르베 (키위소르베)",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서", "여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "참다래", amount: "1,500" },
                    { name: "시럽", amount: "900" },
                    { name: "정수", amount: "700" },
                ],
            },
        ],
        notes: [
            "※ 껍질을 제거하고 세로 반으로 갈라서 하얀색 심지도 제거해준다\n※ 검정 씨가 갈리면 쓴맛이 나므로 블렌더에 살짝만 갈기!!!",
        ],
        imageColor: "#F1F8E9",
    },
    {
        id: "s30",
        title: "자몽소르베",
        category: "sorbet",
        hardness: 27,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "과육", amount: "500" },
                    { name: "자몽주스", amount: "2,000" },
                    { name: "시럽", amount: "1,700" },
                    { name: "콩검", amount: "20" },
                ],
            },
        ],
        stepGroups: [
            {
                title: "제조법",
                steps: [
                    "블렌더에 자몽 과육, 시럽 1000 넣고 살짝 갈아준다",
                    "배합통에 2번과 나머지 시럽, 자몽주스, 콩검을 넣고 섞는다",
                ],
            },
        ],
        notes: [
            "자몽 손질법",
            "속 껍질 & 씨 까지 다 제거하고 속 과육만 사용한다",
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "s31",
        title: "생파인애플소르베",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "생파인애플", amounts: ["1,500", "2,000"] },
                    { name: "시럽", amounts: ["850", "1,150"] },
                    { name: "정수", amounts: ["200", "250"] },
                    { name: "레몬즙", amounts: ["80", "100"] },
                ],
            },
        ],
        imageColor: "#FFEBEE",
    },
    {
        id: "s32",
        title: "레몬요거트",
        category: "sorbet",
        hardness: 26,
        tags: [],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "레몬즙", amount: "300" },
                    { name: "시럽", amount: "1,000" },
                    { name: "콩검", amount: "10" },
                    { name: "플레인요거트", amount: "2,400" },
                ],
            },
        ],
        images: [
            { src: "/recipe-images/s32-1.png" },
        ],
        imageColor: "#FCE4EC",
    },
    {
        id: "s33",
        title: "망고바나나소르베",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "망고", amount: "1,000" },
                    { name: "바나나", amount: "800" },
                    { name: "시럽", amount: "1,200" },
                    { name: "물", amount: "600" },
                    { name: "레몬즙", amount: "30" },
                ],
            },
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "s34",
        title: "망고패션후르츠 소르베",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서", "냉동"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "망고", amount: "1,000" },
                    { name: "패션후르츠", amount: "800" },
                    { name: "시럽", amount: "1,700" },
                    { name: "정수", amount: "1,000" },
                    { name: "레몬즙", amount: "50" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 애플망고 1000 + 시럽 700을 넣고 완전히 갈아준다",
                    "배합통에 1번  넣고 패션후르츠 + 남은 시럽 1000을 넣고 섞어준다",
                    "물, 레몬즙을 넣고 섞는다",
                ],
            },
        ],
        imageColor: "#E3F2FD",
    },
    {
        id: "s35",
        title: "아몬드바나나",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "아몬드", amount: "250" },
                    { name: "바나나", amount: "800" },
                    { name: "시럽", amount: "1,260" },
                    { name: "우유", amount: "3팩 (2,700)" },
                ],
            },
        ],
        imageColor: "#F1F8E9",
    },
    {
        id: "s36",
        title: "딸기바나나소르베",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "딸기", amount: "1,000" },
                    { name: "바나나", amount: "800" },
                    { name: "시럽", amount: "1,080" },
                    { name: "레몬즙", amount: "50" },
                    { name: "정수", amount: "700" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 딸기 + 시럽 반 넣고 곱게 갈아준다 (생딸기는 약하게 갈아준다)",
                    "블렌더에 바나나 + 나머지 시럽 반을 넣고 곱게 갈아준다",
                    "배합통에 1, 2번 모두 합치고 레몬즙, 물을 넣고 섞어준다",
                ],
            },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "s37",
        title: "생딸기소르베",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서", "겨울", "봄"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "생딸기", amount: "2,000" },
                    { name: "시럽", amount: "1,000" },
                    { name: "정수", amount: "100 내외" },
                ],
            },
        ],
        stepGroups: [
            {
                title: "생딸기 손질법",
                steps: [
                    "생딸기를 정수 물에 2번 헹군다",
                    "꼭지를 따준다(흰부분 잘리지 않게 꼭지만!)",
                    "정수 물에 한번 더 헹구고 채에 물기를 빼준다",
                ],
            },
        ],
        imageColor: "#FFEBEE",
    },
    {
        id: "s38",
        title: "수박소르베",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서", "여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "수박", amounts: ["3,000", "2,000"] },
                    { name: "시럽", amounts: ["1,200", "800"] },
                    { name: "소금", amounts: ["5~8", "2~4"] },
                    { name: "콩검", amounts: ["10", "5~6"] },
                ],
            },
        ],
        notes: [
            "※ 검정씨는 모두 제거해준다\n※ 믹서에 갈 때 약하게 갈기!",
        ],
        imageColor: "#FCE4EC",
    },
    {
        id: "s39",
        title: "샤인머스캣소르베",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "샤인머스캣", amount: "2,000" },
                    { name: "시럽", amount: "900" },
                    { name: "레몬즙", amount: "100" },
                    { name: "정수", amount: "500" },
                ],
            },
        ],
        notes: [
            "*갈변이 되므로 바로바로 만들기!",
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "s40",
        title: "초록사과",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서", "여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "초록사과", amount: "2,000" },
                    { name: "시럽", amount: "1,620" },
                    { name: "레몬즙", amount: "150 ~ 200" },
                    { name: "우유", amount: "1,000" },
                ],
            },
        ],
        imageColor: "#E3F2FD",
    },
    {
        id: "s41",
        title: "살구소르베",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서", "봄"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "말랑해진 살구", amount: "2,000" },
                    { name: "시럽", amount: "2,000" },
                    { name: "레몬즙", amount: "30" },
                    { name: "정수", amount: "300" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 살구 1,000g (50%) + 시럽 1,000g (50%) + 레몬즙 15g(50%)을 넣고 갈아준다 —> 배합통에 부어준다.",
                    "번을 두번 반복하고 정수를 넣고 마무리한다.",
                ],
            },
        ],
        notes: [
            "‼️ 갈변주의! 믹싱후 바로 기계에 돌리셔야합니다.",
            "‼️ 살구 후숙에 따라 레몬즙의 양을 변경하셔야합니다. (살구 후숙을 잘 하시면 단맛이 나고, 후숙이 안된경우 신맛이 강합니다.)",
        ],
        imageColor: "#F1F8E9",
    },
    {
        id: "s42",
        title: "생딸기크림",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서", "겨울", "봄"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "생딸기", amount: "1,000" },
                    { name: "화이트베이스", amount: "3,000" },
                    { name: "레몬즙", amount: "50" },
                    { name: "시럽", amount: "180" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 생딸기와 화이트베이스 1000 넣고 약학게 갈아준다",
                    "배합통에 1번과 화이트베이스 2000, 레몬즙을 넣고 섞어준다",
                    "간을 보고 시럽을 넣고 섞어준다",
                ],
            },
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "s43",
        title: "라즈베리요거트",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서", "냉동"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "라즈베리", amount: "1,000" },
                    { name: "시럽", amount: "1,080" },
                    { name: "레몬즙", amount: "100" },
                    { name: "플레인요거트", amount: "1,000" },
                    { name: "우유", amount: "350" },
                ],
            },
        ],
        images: [
            { src: "/recipe-images/s43-1.png" },
            { src: "/recipe-images/s43-2.png" },
        ],
        imageColor: "#FFEBEE",
    },
    {
        id: "s44",
        title: "바나나소르베",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "바나나", amount: "1,000" },
                    { name: "시럽", amount: "720" },
                    { name: "물", amount: "800" },
                ],
            },
        ],
        imageColor: "#FCE4EC",
    },
    {
        id: "s45",
        title: "패션후르츠소르베(냉동)",
        category: "sorbet",
        hardness: 27,
        tags: ["냉동"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "패션후르츠", amount: "총 2,000" },
                    { name: "└ 씨 있는 것", amount: "1,000" },
                    { name: "└ 씨 없는 것", amount: "1,000" },
                    { name: "시럽", amount: "1,800" },
                    { name: "정수", amount: "1,000" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "배합통에 모든 재료를 넣고 섞어준다",
                ],
            },
        ],
        notes: [
            "냉동 패션후르츠는 미리 꺼내서 해동시킨다",
            "ex) 전날 저녁에 냉장고에 넣어두기",
            "당일 날 따뜻한 물에 봉지째 담궈놓기",
        ],
        imageColor: "#FFF3E0",
    },
    {
        id: "s46",
        title: "산딸기요거트",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서", "냉동", "봄", "여름"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "산딸기", amount: "400" },
                    { name: "시럽", amount: "1,170" },
                    { name: "레몬즙", amount: "200" },
                    { name: "플레인요거트", amount: "2,500" },
                ],
            },
        ],
        images: [
            { src: "/recipe-images/s46-1.png" },
            { src: "/recipe-images/s46-2.png" },
        ],
        imageColor: "#E3F2FD",
    },
    {
        id: "s47",
        title: "애플망고소르베(냉동)",
        category: "sorbet",
        hardness: 26,
        tags: ["믹서", "냉동"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "냉동 애플망고", amount: "2,000" },
                    { name: "시럽", amount: "1,500" },
                    { name: "레몬즙", amount: "150 (그냥 망고 사용시 200)" },
                    { name: "정수", amount: "600" },
                ],
            },
        ],
        stepGroups: [
            {
                steps: [
                    "블렌더에 애플망고 1000 + 시럽 반을 넣고 완전히 갈아준다 x 2번 반복",
                    "배합통에 1번 두번 모두 넣고 물, 레몬즙을 넣고 섞는다",
                ],
            },
        ],
        imageColor: "#F1F8E9",
    },
    {
        id: "s48",
        title: "사과소르베 (노란사과,초록사과)",
        category: "sorbet",
        hardness: 25,
        tags: ["믹서"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "사과", amount: "1,600" },
                    { name: "시럽", amount: "1,100" },
                    { name: "레몬즙", amount: "70" },
                    { name: "정수", amount: "400" },
                ],
            },
        ],
        notes: [
            "블렌더에 사과 800 + 시럽 550 + 레몬즙 35 넣고 곱게 갈아준다 X 2번 빠르게",
            "* 블렌더에 가는 순간 갈변이 빨리 진행되므로 빠르게 제조 할 것!",
            "*사과 손질 할 때도 큰 조각으로 잘라둔다",
        ],
        imageColor: "#FFF8E1",
    },
    {
        id: "v1",
        title: "아몬드 초코",
        category: "vegan",
        hardness: 26,
        tags: ["비건"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "시럽", amount: "1,300" },
                    { name: "카카오 파우더", amount: "150" },
                    { name: "소금", amount: "5" },
                    { name: "콩검", amount: "10" },
                    { name: "아몬드밀크", amount: "2통 (2,000)" },
                    { name: "아몬드슬라이스", amount: "200" },
                ],
            },
        ],
        notes: [
            "아몬드 슬라이스는 뽑을때 사이사이에 뿌려준다.",
        ],
        images: [
            { src: "/recipe-images/v1-1.png" },
            { src: "/recipe-images/v1-2.png" },
        ],
        imageColor: "#E8F5E9",
    },
    {
        id: "v2",
        title: "피냐콜라다(비건)",
        category: "vegan",
        hardness: 27,
        tags: ["비건", "코코넛밀크"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "시럽", amount: "900" },
                    { name: "파인애플주스", amount: "1,000" },
                    { name: "코코넛밀크", amount: "2,000" },
                    { name: "콩검", amount: "10" },
                ],
            },
        ],
        images: [
            { src: "/recipe-images/v2-1.png" },
            { src: "/recipe-images/v2-2.png" },
        ],
        imageColor: "#F1F8E9",
    },
    {
        id: "v3",
        title: "오트 커피",
        category: "vegan",
        hardness: 26,
        tags: ["비건"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "에스프레소", amounts: ["500", "340"] },
                    { name: "시럽", amounts: ["1,400", "900"] },
                    { name: "콩검", amounts: ["20", "15"] },
                    { name: "오트밀크", amounts: ["3통 (3,000)", "2통(2,000)"] },
                ],
            },
        ],
        images: [
            { src: "/recipe-images/v3-1.png" },
            { src: "/recipe-images/v3-2.png" },
        ],
        imageColor: "#E0F2F1",
    },
    {
        id: "v4",
        title: "코코넛 말차",
        category: "vegan",
        hardness: 26,
        tags: ["비건"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "시럽", amount: "1,700" },
                    { name: "말차 가루", amount: "100" },
                    { name: "코코넛 밀크", amount: "3통 (3,000)" },
                ],
            },
        ],
        images: [
            { src: "/recipe-images/v4-1.png" },
        ],
        imageColor: "#E8F5E9",
    },
    {
        id: "v5",
        title: "트로피칼 브리즈",
        category: "vegan",
        hardness: 27,
        tags: ["비건", "믹서", "냉동"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "망고 (냉동)", amount: "500" },
                    { name: "시럽", amount: "1,100" },
                    { name: "파인애플 주스", amount: "500" },
                    { name: "리치퓨레", amount: "150" },
                    { name: "레몬즙", amount: "100" },
                    { name: "코코넛밀크", amount: "1,000" },
                ],
            },
        ],
        images: [
            { src: "/recipe-images/v5-1.png" },
            { src: "/recipe-images/v5-2.png" },
        ],
        imageColor: "#F1F8E9",
    },
    {
        id: "v6",
        title: "코코넛커피",
        category: "vegan",
        hardness: 26,
        tags: ["비건"],
        ingredientGroups: [
            {
                title: "커피가루 40 + 뜨거운물 100",
                ingredients: [
                    { name: "정수", amount: "400" },
                    { name: "시럽", amount: "1,300" },
                    { name: "코코넛가루", amount: "20" },
                    { name: "코코넛 밀크", amount: "3통 (3,000)" },
                ],
            },
        ],
        notes: [
            "커피가루 + 정수 대신 에스프레소 500 으로 대체 가능",
        ],
        images: [
            { src: "/recipe-images/v6-1.png" },
        ],
        imageColor: "#E0F2F1",
    },
    {
        id: "a1",
        title: "느린마을 막걸리",
        category: "alcohol",
        hardness: 26,
        tags: ["우유", "알코올"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "막걸리", amount: "750 두병 or 350ml 4캔" },
                    { name: "시럽", amount: "1,300" },
                    { name: "콩검", amount: "20" },
                    { name: "우유", amount: "1,300" },
                ],
            },
        ],
        imageColor: "#F3E5F5",
    },
    {
        id: "a2",
        title: "깔루아밀크",
        category: "alcohol",
        hardness: 27,
        tags: ["우유", "알코올"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "에스프레소", amount: "200" },
                    { name: "깔루아", amount: "400" },
                    { name: "시럽", amount: "1,100" },
                    { name: "콩검", amount: "40" },
                    { name: "생크림", amount: "200" },
                    { name: "우유", amount: "2,500" },
                ],
            },
        ],
        imageColor: "#EDE7F6",
    },
    {
        id: "a3",
        title: "샹그리아",
        category: "alcohol",
        hardness: 27,
        tags: ["우유", "알코올"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "샹그리아술", amount: "2,000" },
                    { name: "시럽", amount: "900" },
                    { name: "콩검", amount: "20" },
                    { name: "생크림", amount: "200" },
                    { name: "우유", amount: "1,000" },
                ],
            },
        ],
        imageColor: "#EFEBE9",
    },
    {
        id: "a4",
        title: "기네스 흑맥주",
        category: "alcohol",
        hardness: 26,
        tags: ["우유", "알코올"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "맥주", amount: "1,400 or 500ml 3캔" },
                    { name: "시럽", amount: "1,100" },
                    { name: "콩검", amount: "20" },
                    { name: "우유", amount: "1,000" },
                ],
            },
        ],
        imageColor: "#F3E5F5",
    },
    {
        id: "a5",
        title: "레드와인",
        category: "alcohol",
        hardness: 27,
        tags: ["우유", "알코올"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "와인 1병", amount: "750" },
                    { name: "시럽", amount: "900" },
                    { name: "레몬즙", amount: "50" },
                    { name: "콩검", amount: "20" },
                    { name: "생크림", amount: "300" },
                    { name: "우유", amount: "1,200" },
                ],
            },
        ],
        notes: [
            "‼️ 와인 오픈 후 믹싱 시 코르크마개의 부서진 가루가 믹싱볼에 들어갈 수 있으니 주의!!",
        ],
        imageColor: "#EDE7F6",
    },
    {
        id: "a6",
        title: "샤인화이트와인소르베",
        category: "alcohol",
        hardness: 26,
        tags: ["알코올"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "샤인와인 1병", amount: "750" },
                    { name: "시럽", amount: "900" },
                    { name: "콩검", amount: "20" },
                    { name: "물", amount: "500" },
                ],
            },
        ],
        imageColor: "#EFEBE9",
    },
    {
        id: "a7",
        title: "피냐콜라다(알코올)",
        category: "alcohol",
        hardness: 27,
        tags: ["알코올", "코코넛밀크"],
        ingredientGroups: [
            {
                ingredients: [
                    { name: "시럽", amount: "900" },
                    { name: "파인애플주스", amount: "1,000" },
                    { name: "코코넛밀크", amount: "2,000" },
                    { name: "콩검", amount: "10" },
                ],
            },
            {
                title: "럼 넣으면 알코올, 럼 안넣으면 비건메뉴!",
                ingredients: [
                    { name: "+ 화이트럼", amount: "150" },
                    { name: "+ 콩검", amount: "20" },
                ],
            },
        ],
        imageColor: "#F3E5F5",
    },
];

export const RECIPES: Recipe[] = SEEDS.map((seed) => ({
    ...seed,
    ingredients: (seed.ingredientGroups ?? []).flatMap((group) => group.ingredients),
    steps: (seed.stepGroups ?? []).flatMap((group) => group.steps),
}));
