export interface Ingredient {
    name: string;
    amount?: string;
    note?: string;
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
    tags: string[]; // e.g., 'Summer', 'Signature', 'Mixer'
    ingredients: Ingredient[];
    steps: string[];
    purchaseLinks?: PurchaseLink[];
    imageColor: string; // Placeholder for image
}

export const RECIPES: Recipe[] = [
    // --- Milk Base ---
    {
        id: 'm1',
        title: '솔티크래커',
        category: 'milk',
        tags: ['Signature', 'Best Selling'],
        ingredients: [
            { name: '우유', amount: '1000g' },
            { name: '생크림', amount: '200g' },
            { name: '설탕', amount: '150g' },
            { name: '탈지분유', amount: '40g' },
            { name: '소금', amount: '12g', note: '프랑스 게랑드 소금' },
            { name: '크래커', amount: '적당량', note: '토핑용' },
        ],
        steps: [
            '모든 가루 재료(설탕, 탈지분유)를 채반에 걸러 준비합니다.',
            '우유와 생크림을 믹싱볼에 넣습니다.',
            '가루 재료를 조금씩 넣으며 거품기로 저어줍니다.',
            '소금을 넣고 완전히 녹을 때까지 저어줍니다.',
            '믹서기에 넣고 2분간 강하게 돌려줍니다.',
            '냉동고에 4시간 숙성시킵니다.',
        ],
        imageColor: '#FFF8E1',
    },
    {
        id: 'm2',
        title: '초당옥수수',
        category: 'milk',
        tags: ['Summer', 'Seasonal'],
        ingredients: [
            { name: '초당옥수수 페이스트', amount: '300g' },
            { name: '우유', amount: '800g' },
            { name: '생크림', amount: '150g' },
            { name: '옥수수 알갱이', amount: '50g', note: '토핑' },
        ],
        steps: [
            '초당옥수수 페이스트를 우유 소량과 섞어 풀어줍니다.',
            '나머지 우유와 생크림을 넣고 섞습니다.',
            '체에 한 번 걸러 껍질을 제거합니다.',
            '머신에 넣고 돌립니다.',
        ],
        imageColor: '#FFF176',
    },

    // --- Sorbet Base ---
    {
        id: 's1',
        title: '레몬 소르베',
        category: 'sorbet',
        tags: ['Classic', 'Refreshing'],
        ingredients: [
            { name: '레몬즙', amount: '400g', note: '착즙 100%' },
            { name: '정수', amount: '800g' },
            { name: '설탕', amount: '300g' },
            { name: '레몬 제스트', amount: '1ea' },
        ],
        steps: [
            '정수에 설탕을 넣고 완전히 녹입니다 (시럽화).',
            '레몬즙을 넣고 섞습니다.',
            '레몬 제스트를 넣어 향을 더합니다.',
            '소르베 안정제를 넣고 핸드믹서로 섞어줍니다.',
        ],
        imageColor: '#FFF9C4',
    },
    {
        id: 's2',
        title: '애플망고',
        category: 'sorbet',
        tags: ['Tropical', 'Sweet'],
        ingredients: [
            { name: '애플망고 퓨레', amount: '500g' },
            { name: '정수', amount: '400g' },
            { name: '설탕 시럽', amount: '100g' },
            { name: '레몬즙', amount: '10g' },
        ],
        steps: [
            '애플망고 퓨레와 물을 1:1 비율에 가깝게 섞습니다.',
            '당도를 체크하며 시럽을 추가합니다.',
            '상큼함을 위해 레몬즙을 소량 추가합니다.',
        ],
        purchaseLinks: [
            { item: '애플망고 퓨레', url: 'https://coupang.com' }
        ],
        imageColor: '#FFCC80',
    },

    // --- Vegan ---
    {
        id: 'v1',
        title: '코코넛 말차',
        category: 'vegan',
        tags: ['Vegan', 'Nutty'],
        ingredients: [
            { name: '코코넛 밀크', amount: '800g' },
            { name: '말차 파우더', amount: '30g', note: '제주 유기농' },
            { name: '비정제 설탕', amount: '150g' },
        ],
        steps: [
            '코코넛 밀크를 따뜻하게 데웁니다 (끓이지 않음).',
            '말차 파우더와 설탕을 섞어 코코넛 밀크에 넣습니다.',
            '잘 녹을 때까지 저어준 후 식힙니다.',
        ],
        imageColor: '#C8E6C9',
    },

    // --- Alcohol ---
    {
        id: 'a1',
        title: '깔루아 밀크',
        category: 'alcohol',
        tags: ['Adult Only', 'Cocktail'],
        ingredients: [
            { name: '우유', amount: '800g' },
            { name: '깔루아 리큐르', amount: '150g' },
            { name: '에스프레소', amount: '1 shot' },
        ],
        steps: [
            '우유 베이스를 먼저 만듭니다.',
            '머신에서 나오기 직전에 깔루아를 투입하여 마블링을 만듭니다.',
        ],
        imageColor: '#D7CCC8',
    },
];
