import { useEffect, useMemo, useState } from 'react';
import { RECIPES, type Ingredient, type PurchaseLink, type Recipe } from '../constants/MockData';
import { isSupabaseConfigured, supabase } from './supabase';

type RecipeRow = {
    id: string;
    title: string;
    category: Recipe['category'];
    description?: string | null;
    tags?: unknown;
    ingredients?: unknown;
    steps?: unknown;
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
            amount: typeof item.amount === 'string' ? item.amount : '',
            note: typeof item.note === 'string' ? item.note : undefined,
        }))
        .filter((item) => item.name);
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
    return {
        id: row.id,
        title: row.title,
        category: row.category,
        description: row.description ?? undefined,
        tags: asStringArray(row.tags),
        ingredients: asIngredients(row.ingredients),
        steps: asStringArray(row.steps),
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
        .select('id, title, category, description, tags, ingredients, steps, purchase_links, image_color')
        .order('updated_at', { ascending: false });

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
        .select('id, title, category, description, tags, ingredients, steps, purchase_links, image_color')
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
