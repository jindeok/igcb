import { useState, useEffect, useCallback, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
    ActivityIndicator,
    Platform,
    Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { type Recipe } from '../../constants/MockData';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { fetchRecipes, updateRecipeSortOrders, updateRecipeFeatured } from '../../lib/recipes';

const CATEGORIES = [
    { id: 'all', label: '전체' },
    { id: 'milk', label: '우유' },
    { id: 'sorbet', label: '소르베' },
    { id: 'vegan', label: '비건' },
    { id: 'alcohol', label: '알코올' },
] as const;

function notify(title: string, message: string) {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
    } else {
        Alert.alert(title, message);
    }
}

export default function ManageRecipesScreen() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.role !== 'admin') {
            notify('접근 제한', '관리자만 접근할 수 있습니다.');
            router.replace('/');
        }
    }, [authLoading, user, router]);

    const loadRecipes = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchRecipes();
            setRecipes(data);
        } catch {
            notify('오류', '레시피를 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadRecipes();
    }, [loadRecipes]);

    const filtered =
        selectedCategory === 'all'
            ? recipes
            : recipes.filter((r) => r.category === selectedCategory);

    const moveRecipe = (index: number, direction: -1 | 1) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= filtered.length) return;

        const itemA = filtered[index];
        const itemB = filtered[targetIndex];
        if (!itemA || !itemB) return;

        setRecipes((prev) => {
            const next = [...prev];
            const realA = next.findIndex((r) => r.id === itemA.id);
            const realB = next.findIndex((r) => r.id === itemB.id);
            if (realA === -1 || realB === -1) return prev;
            [next[realA], next[realB]] = [next[realB], next[realA]];
            return next;
        });
        setDirty(true);
    };

    const toggleFeatured = async (recipe: Recipe) => {
        const isFeatured = recipe.tags.includes('추천');
        try {
            await updateRecipeFeatured(recipe.id, !isFeatured, recipe.tags);
            setRecipes((prev) =>
                prev.map((r) =>
                    r.id === recipe.id
                        ? {
                            ...r,
                            tags: isFeatured
                                ? r.tags.filter((t) => t !== '추천')
                                : [...r.tags, '추천'],
                        }
                        : r,
                ),
            );
        } catch {
            notify('오류', '추천 상태를 변경하지 못했습니다.');
        }
    };

    const handleSaveOrder = async () => {
        setSaving(true);
        try {
            const items = recipes.map((r, i) => ({ id: r.id, sort_order: i }));
            await updateRecipeSortOrders(items);
            setDirty(false);
            notify('완료', '레시피 순서가 저장되었습니다.');
        } catch {
            notify('오류', '순서 저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

    if (authLoading || (!user || user.role !== 'admin')) {
        return (
            <View style={[styles.guard, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    const handleDrop = (toIndex: number) => {
        if (draggingIdx === null || draggingIdx === toIndex) return;
        const fromIndex = draggingIdx;
        const itemA = filtered[fromIndex];
        const itemB = filtered[toIndex];
        if (!itemA || !itemB) return;

        setRecipes((prev) => {
            const next = [...prev];
            const realA = next.findIndex((r) => r.id === itemA.id);
            const realB = next.findIndex((r) => r.id === itemB.id);
            if (realA === -1 || realB === -1) return prev;

            // Move element: remove from realA, insert at realB
            const [removed] = next.splice(realA, 1);

            // To figure out the new index, we need to know if the target shifted.
            // Since we are sorting in place among the category, the easiest way 
            // is to reconstruct the filtered list and merge it back.
            const newFiltered = [...filtered];
            const [fRemoved] = newFiltered.splice(fromIndex, 1);
            newFiltered.splice(toIndex, 0, fRemoved);

            if (selectedCategory === 'all') {
                return newFiltered;
            } else {
                const nextAll = [...prev];
                const catIndices = nextAll.map((r, i) => r.category === selectedCategory ? i : -1).filter((i) => i !== -1);
                newFiltered.forEach((r, idx) => {
                    nextAll[catIndices[idx]] = r;
                });
                return nextAll;
            }
        });
        setDirty(true);
        setDraggingIdx(null);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: '레시피 관리',
                    headerStyle: { backgroundColor: theme.background },
                    headerTintColor: theme.text,
                    headerShadowVisible: false,
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handleSaveOrder}
                            disabled={saving || !dirty}
                            style={[
                                styles.saveButton,
                                {
                                    borderColor: dirty ? theme.tint : theme.border,
                                    backgroundColor: dirty ? theme.tint : theme.cardBackground,
                                },
                            ]}
                        >
                            <Text
                                style={{
                                    color: dirty ? '#FFFFFF' : theme.icon,
                                    fontWeight: '700',
                                    fontSize: 14,
                                }}
                            >
                                {saving ? '저장 중…' : '순서 저장'}
                            </Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* Category tabs */}
            <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => setSelectedCategory(cat.id)}
                            style={[
                                styles.tab,
                                {
                                    backgroundColor: selectedCategory === cat.id ? theme.tint : theme.background,
                                    borderColor: selectedCategory === cat.id ? theme.tint : theme.border,
                                },
                            ]}
                        >
                            <Text
                                style={{
                                    color: selectedCategory === cat.id ? '#FFFFFF' : theme.icon,
                                    fontWeight: '600',
                                    fontSize: 13,
                                }}
                            >
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Info bar */}
            <View style={[styles.infoBar, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
                <Text style={[styles.infoText, { color: theme.icon }]}>
                    아이스크림 카드를 드래그 앤 드롭해서 순서를 바꾸거나 ▲▼ 버튼을 사용하세요.
                </Text>
                <Text style={[styles.countText, { color: theme.text }]}>{filtered.length}개 레시피</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent}>
                    {filtered.map((recipe, index) => {
                        const isFeatured = recipe.tags.includes('추천');
                        return (
                            <RecipeRow
                                key={recipe.id}
                                recipe={recipe}
                                index={index}
                                isFeatured={isFeatured}
                                theme={theme}
                                draggingIdx={draggingIdx}
                                setDraggingIdx={setDraggingIdx}
                                handleDrop={handleDrop}
                                toggleFeatured={toggleFeatured}
                                moveRecipe={moveRecipe}
                                numFiltered={filtered.length}
                            />
                        );
                    })}
                    {filtered.length === 0 ? (
                        <View style={styles.emptyWrap}>
                            <Text style={{ color: theme.icon, fontSize: 15 }}>이 카테고리에는 레시피가 없습니다.</Text>
                        </View>
                    ) : null}
                </ScrollView>
            )}
        </View>
    );
}

function RecipeRow({
    recipe,
    index,
    isFeatured,
    theme,
    draggingIdx,
    setDraggingIdx,
    handleDrop,
    toggleFeatured,
    moveRecipe,
    numFiltered,
}: any) {
    const router = useRouter();
    const isDragging = draggingIdx === index;
    const rowRef = useRef<any>(null);
    const handleRef = useRef<any>(null);

    useEffect(() => {
        if (Platform.OS === 'web') {
            const rowNode = rowRef.current;
            const handleNode = handleRef.current;
            if (rowNode) {
                rowNode.ondragover = (e: any) => e.preventDefault();
                rowNode.ondrop = (e: any) => {
                    e.preventDefault();
                    handleDrop(index);
                };
            }
            if (handleNode) {
                handleNode.setAttribute('draggable', 'true');
                handleNode.ondragstart = (e: any) => {
                    setDraggingIdx(index);
                    if (e.dataTransfer) e.dataTransfer.setData('text/plain', '');
                };
                handleNode.ondragend = () => setDraggingIdx(null);
            }
        }
    }, [index, handleDrop, setDraggingIdx]);

    return (
        <View
            ref={rowRef}
            style={[
                styles.recipeRow,
                {
                    backgroundColor: isDragging ? theme.tint + '1a' : theme.cardBackground,
                    borderColor: isFeatured ? theme.tint : theme.border,
                    borderWidth: isFeatured ? 2 : 1,
                    opacity: isDragging ? 0.6 : 1,
                } as any,
            ]}
        >
            {/* Drag Handle Icon */}
            <View
                ref={handleRef}
                style={{ padding: 4, marginRight: 6, cursor: Platform.OS === 'web' ? 'grab' : 'default' } as any}
            >
                <Ionicons name="menu" size={24} color={theme.icon} />
            </View>

            {/* Rank number */}
            <View style={[styles.rankBadge, { backgroundColor: theme.background }]}>
                <Text style={[styles.rankText, { color: theme.text }]}>{index + 1}</Text>
            </View>

            {/* Recipe info */}
            <View style={styles.recipeInfo}>
                <Text style={[styles.recipeTitle, { color: theme.text }]} numberOfLines={1}>
                    {recipe.title}
                </Text>
                <Text style={[styles.recipeMeta, { color: theme.icon }]}>
                    {recipe.category.toUpperCase()} · 재료 {recipe.ingredients.length}개
                    {isFeatured ? ' · ⭐ 추천' : ''}
                </Text>
            </View>

            {/* Featured toggle */}
            <TouchableOpacity
                onPress={() => toggleFeatured(recipe)}
                style={styles.actionButton}
                accessibilityLabel="추천 토글"
            >
                <Ionicons
                    name={isFeatured ? 'star' : 'star-outline'}
                    size={22}
                    color={isFeatured ? '#F59E0B' : theme.icon}
                />
            </TouchableOpacity>

            {/* Move buttons */}
            <View style={styles.moveButtons}>
                <TouchableOpacity
                    onPress={() => moveRecipe(index, -1)}
                    disabled={index === 0}
                    style={[styles.moveBtn, { backgroundColor: theme.background, borderColor: theme.border, opacity: index === 0 ? 0.3 : 1 }]}
                >
                    <Ionicons name="chevron-up" size={18} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => moveRecipe(index, 1)}
                    disabled={index === numFiltered - 1}
                    style={[styles.moveBtn, { backgroundColor: theme.background, borderColor: theme.border, opacity: index === numFiltered - 1 ? 0.3 : 1 }]}
                >
                    <Ionicons name="chevron-down" size={18} color={theme.text} />
                </TouchableOpacity>
            </View>

            {/* Edit button */}
            <TouchableOpacity
                onPress={() => router.push(`/admin/edit-recipe?id=${recipe.id}`)}
                style={styles.actionButton}
                accessibilityLabel="레시피 편집"
            >
                <Ionicons name="create-outline" size={20} color={theme.tint} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    guard: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1 },
    saveButton: {
        marginRight: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
    },
    tabBar: {
        borderBottomWidth: 1,
        paddingVertical: 10,
    },
    tabScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
    },
    infoBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    infoText: {
        fontSize: 12,
        flex: 1,
    },
    countText: {
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 12,
    },
    loadingWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    listContent: {
        padding: 16,
        gap: 8,
        paddingBottom: 40,
    },
    recipeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 12,
        gap: 10,
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: {
        fontSize: 14,
        fontWeight: '700',
    },
    recipeInfo: {
        flex: 1,
        gap: 2,
    },
    recipeTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    recipeMeta: {
        fontSize: 12,
    },
    actionButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moveButtons: {
        gap: 2,
    },
    moveBtn: {
        width: 30,
        height: 24,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyWrap: {
        padding: 40,
        alignItems: 'center',
    },
});
