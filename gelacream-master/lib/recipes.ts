import { useEffect, useMemo, useState } from 'react';
import {
    RECIPES,
    type Ingredient,
    type IngredientGroup,
    type PurchaseLink,
    type Recipe,
    type RecipeImage,
    type StepGroup,
} from '../constants/MockData';
import { isSupabaseConfigured, supabase } from './supabase';

const RECIPE_COLUMNS =
    'id, title, category, description, hardness, tags, ingredient_groups, step_groups, notes, images, instruction_images, purchase_links, image_color, sort_order';

type RecipeRow = {
    id: string;
    title: string;
    category: Recipe['category'];
    description?: string | null;
    hardness?: number | null;
    tags?: unknown;
    ingredient_groups?: unknown;
    step_groups?: unknown;
    notes?: unknown;
    images?: unknown;
    instruction_images?: unknown;
    purchase_links?: unknown;
    image_color?: string | null;
};

function asStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function asIngredients(value: unknown): Ingredient[] {
    if (!Array.isArray(value)) return [];
    return value
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
            name: typeof item.name === 'string' ? item.name : '',
            amount: typeof item.amount === 'string' ? item.amount : undefined,
            amounts: asStringArray(item.amounts),
            note: typeof item.note === 'string' ? item.note : undefined,
        }))
        .map((item) => ({
            ...item,
            amounts: item.amounts && item.amounts.length > 0 ? item.amounts : undefined,
        }))
        .filter((item) => item.name);
}

function asIngredientGroups(value: unknown): IngredientGroup[] {
    if (!Array.isArray(value)) return [];
    return value
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
            title: typeof item.title === 'string' && item.title ? item.title : undefined,
            columns: asStringArray(item.columns).length > 0 ? asStringArray(item.columns) : undefined,
            ingredients: asIngredients(item.ingredients),
        }))
        .filter((group) => group.ingredients.length > 0);
}

function asStepGroups(value: unknown): StepGroup[] {
    if (!Array.isArray(value)) return [];
    return value
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
            title: typeof item.title === 'string' && item.title ? item.title : undefined,
            steps: asStringArray(item.steps),
        }))
        .filter((group) => group.steps.length > 0);
}

function asImages(value: unknown): RecipeImage[] {
    if (!Array.isArray(value)) return [];
    return value
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
            src: typeof item.src === 'string' ? item.src : '',
            caption: typeof item.caption === 'string' && item.caption ? item.caption : undefined,
        }))
        .filter((item) => item.src);
}

function asPurchaseLinks(value: unknown): PurchaseLink[] {
    if (!Array.isArray(value)) return [];
    return value
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
            item: typeof item.item === 'string' ? item.item : '',
            url: typeof item.url === 'string' ? item.url : '',
        }))
        .filter((item) => item.item && item.url);
}

function normalizeRecipe(row: RecipeRow): Recipe {
    const ingredientGroups = asIngredientGroups(row.ingredient_groups);
    const stepGroups = asStepGroups(row.step_groups);
    return {
        id: row.id,
        title: row.title,
        category: row.category,
        description: row.description ?? undefined,
        hardness: typeof row.hardness === 'number' ? row.hardness : undefined,
        tags: asStringArray(row.tags),
        ingredientGroups,
        ingredients: ingredientGroups.flatMap((group) => group.ingredients),
        stepGroups,
        steps: stepGroups.flatMap((group) => group.steps),
        notes: asStringArray(row.notes),
        images: asImages(row.images),
        instructionImages: asImages(row.instruction_images),
        purchaseLinks: asPurchaseLinks(row.purchase_links),
        imageColor: row.image_color || '#FFE7DE',
    };
}

export async function fetchRecipes(): Promise<Recipe[]> {
    if (!isSupabaseConfigured) {
        return RECIPES;
    }

    const { data, error } = await supabase
        .from('recipes')
        .select(RECIPE_COLUMNS)
        .order('sort_order', { ascending: true });

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        return RECIPES;
    }

    return data.map((row) => normalizeRecipe(row as RecipeRow));
}

export async function fetchRecipeById(id: string): Promise<Recipe | null> {
    if (!isSupabaseConfigured) {
        return RECIPES.find((recipe) => recipe.id === id) ?? null;
    }

    const { data, error } = await supabase
        .from('recipes')
        .select(RECIPE_COLUMNS)
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        return RECIPES.find((recipe) => recipe.id === id) ?? null;
    }

    return normalizeRecipe(data as RecipeRow);
}

export function useRecipes() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setIsLoading(true);
                const next = await fetchRecipes();
                if (!cancelled) {
                    setRecipes(next);
                    setError(null);
                }
            } catch (e: unknown) {
                if (!cancelled) {
                    setRecipes(RECIPES);
                    setError(e instanceof Error ? e.message : '레시피를 불러오지 못했습니다.');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    return { recipes, isLoading, error };
}

export function useRecipe(id: string | string[] | undefined) {
    const recipeId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!recipeId) {
                setRecipe(null);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const next = await fetchRecipeById(recipeId);
                if (!cancelled) {
                    setRecipe(next);
                    setError(null);
                }
            } catch (e: unknown) {
                if (!cancelled) {
                    setRecipe(RECIPES.find((item) => item.id === recipeId) ?? null);
                    setError(e instanceof Error ? e.message : '레시피를 불러오지 못했습니다.');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [recipeId]);

    return { recipe, isLoading, error };
}

/** 여러 레시피의 sort_order와 tags를 일괄 업데이트 */
export async function updateRecipesBatch(
    items: { id: string; sort_order: number; tags: string[] }[],
): Promise<void> {
    if (!isSupabaseConfigured || items.length === 0) return;

    // 배열 순회하며 개별 update를 병렬로 실행 
    const promises = items.map((item) =>
        supabase
            .from('recipes')
            .update({ sort_order: item.sort_order, tags: item.tags })
            .eq('id', item.id)
    );

    const results = await Promise.all(promises);

    // 첫 번째 에러 반환
    const firstError = results.find((res) => res.error)?.error;
    if (firstError) throw firstError;
}

/** 특정 레시피의 추천(featured) 상태를 토글 */
export async function updateRecipeFeatured(
    id: string,
    featured: boolean,
    currentTags: string[],
): Promise<void> {
    if (!isSupabaseConfigured) return;
    const withoutFeatured = currentTags.filter((t) => t !== '추천');
    const newTags = featured ? [...withoutFeatured, '추천'] : withoutFeatured;
    const { error } = await supabase
        .from('recipes')
        .update({ tags: newTags })
        .eq('id', id);
    if (error) throw error;
}
