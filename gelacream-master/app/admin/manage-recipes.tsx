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
    Modal,
    TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { type Recipe } from '../../constants/MockData';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { fetchRecipes, updateRecipesBatch } from '../../lib/recipes';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const CATEGORIES = [
    { id: 'all', label: '전체' },
    { id: 'featured', label: '추천' },
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
    const [deletedRecipes, setDeletedRecipes] = useState<Recipe[]>([]);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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
            : selectedCategory === 'featured'
                ? recipes.filter((r) => r.tags.includes('추천'))
                : recipes.filter((r) => r.category === selectedCategory);

    const searchResults = searchQuery.trim()
        ? recipes
            .filter((r) => r.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) && !r.tags.includes('추천'))
            .slice(0, 5)
        : [];

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

    const toggleFeatured = (recipe: Recipe) => {
        const isFeatured = recipe.tags.includes('추천');
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
        setDirty(true);
    };

    const handleDeleteRecipe = async (recipe: Recipe) => {
        if (!isSupabaseConfigured) {
            notify('오류', 'Supabase 설정이 필요합니다.');
            return;
        }

        const proceed = Platform.OS === 'web'
            ? window.confirm(`"${recipe.title}" 레시피를 삭제 대기열에 추가하시겠습니까? (저장 시 영구 삭제)`)
            : await new Promise<boolean>((resolve) => {
                Alert.alert('삭제 확인', `"${recipe.title}" 레시피를 삭제 대기열에 추가하시겠습니까? (저장 시 영구 삭제)`, [
                    { text: '취소', onPress: () => resolve(false), style: 'cancel' },
                    { text: '삭제', onPress: () => resolve(true), style: 'destructive' },
                ]);
            });

        if (!proceed) return;

        setDeletedRecipes(prev => [...prev, recipe]);
        setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
        setDirty(true);
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            for (const r of deletedRecipes) {
                const storagePaths = [...(r.images ?? []), ...(r.instructionImages ?? [])]
                    .map((img) => img.src)
                    .filter((src) => src && !src.startsWith('http') && !src.startsWith('/'));
                if (storagePaths.length > 0) {
                    await supabase.storage.from('recipe-images').remove(storagePaths);
                }
                const { error } = await supabase.from('recipes').delete().eq('id', r.id);
                if (error) throw error;
            }

            const items = recipes.map((r, i) => ({ id: r.id, sort_order: i, tags: r.tags }));
            await updateRecipesBatch(items);

            setDeletedRecipes([]);
            setDirty(false);
            notify('완료', '모든 변경사항이 저장되었습니다.');
            void loadRecipes();
        } catch (e: any) {
            notify('오류', '저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

    const moveItemWithinCategory = useCallback((fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;
        const itemA = filtered[fromIndex];
        const itemB = filtered[toIndex];
        if (!itemA || !itemB) return;

        setRecipes((prev) => {
            const next = [...prev];
            const realA = next.findIndex((r) => r.id === itemA.id);
            const realB = next.findIndex((r) => r.id === itemB.id);
            if (realA === -1 || realB === -1) return prev;

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
    }, [filtered, recipes, selectedCategory]);

    const handleDrop = (toIndex: number) => {
        if (draggingIdx === null) return;
        moveItemWithinCategory(draggingIdx, toIndex);
        setDraggingIdx(null);
    };

    if (authLoading || (!user || user.role !== 'admin')) {
        return (
            <View style={[styles.guard, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

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
                            onPress={handleSaveAll}
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
                                {saving ? '저장 중…' : '저장'}
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
                    {selectedCategory === 'featured' && (
                        <TouchableOpacity
                            style={[
                                styles.addFeaturedButton,
                                { backgroundColor: theme.cardBackground, borderColor: theme.tint, borderWidth: 1 }
                            ]}
                            onPress={() => setSearchModalVisible(true)}
                        >
                            <Ionicons name="add" size={20} color={theme.tint} />
                            <Text style={{ color: theme.tint, fontWeight: '600', fontSize: 15 }}>
                                검색해서 추천 레시피 추가하기
                            </Text>
                        </TouchableOpacity>
                    )}
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
                                handleDeleteRecipe={handleDeleteRecipe}
                                moveRecipe={moveRecipe}
                                jumpRecipe={moveItemWithinCategory}
                                numFiltered={filtered.length}
                            />
                        );
                    })}
                    {filtered.length === 0 && (
                        <View style={styles.emptyWrap}>
                            <Text style={{ color: theme.icon }}>해당 카테고리에 레시피가 없습니다.</Text>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Search Modal */}
            <Modal
                visible={searchModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setSearchModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>추천 레시피로 추가</Text>
                            <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.icon} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.searchInputRow, { borderColor: theme.border, backgroundColor: theme.background }]}>
                            <Ionicons name="search" size={20} color={theme.icon} />
                            <TextInput
                                style={[styles.modalSearchInput, { color: theme.text }]}
                                placeholder="레시피 이름 검색..."
                                placeholderTextColor={theme.icon}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus={true}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color={theme.icon} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <ScrollView style={styles.modalResList} keyboardShouldPersistTaps="handled">
                            {searchResults.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.modalSearchItem, { borderBottomColor: theme.border }]}
                                    onPress={() => {
                                        toggleFeatured(item);
                                        setSearchModalVisible(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    <View>
                                        <Text style={{ color: theme.text, fontSize: 15, fontWeight: '600' }}>{item.title}</Text>
                                        <Text style={{ color: theme.icon, fontSize: 13 }}>{item.category.toUpperCase()}</Text>
                                    </View>
                                    <Ionicons name="add-circle" size={24} color={theme.tint} />
                                </TouchableOpacity>
                            ))}
                            {searchQuery.trim().length > 0 && searchResults.length === 0 && (
                                <Text style={{ color: theme.icon, padding: 16, textAlign: 'center' }}>검색 결과가 없습니다.</Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    handleDeleteRecipe,
    moveRecipe,
    jumpRecipe,
    numFiltered,
}: any) {
    const router = useRouter();
    const isDragging = draggingIdx === index;
    const rowRef = useRef<any>(null);
    const handleRef = useRef<any>(null);
    const [inputValue, setInputValue] = useState(String(index + 1));

    useEffect(() => {
        setInputValue(String(index + 1));
    }, [index]);

    const submitJump = () => {
        const val = parseInt(inputValue, 10);
        if (isNaN(val) || val < 1 || val > numFiltered || val === index + 1) {
            setInputValue(String(index + 1));
            return;
        }
        jumpRecipe(index, val - 1);
    };

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
            <View style={[styles.rankBadge, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <TextInput
                    style={[styles.rankText, { color: theme.text, padding: 0 }]}
                    value={inputValue}
                    onChangeText={setInputValue}
                    onSubmitEditing={submitJump}
                    onBlur={submitJump}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    selectTextOnFocus={true}
                />
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

            {/* Edit & Delete buttons */}
            <View style={{ flexDirection: 'row', gap: 4 }}>
                <TouchableOpacity
                    onPress={() => router.push(`/admin/edit-recipe?id=${recipe.id}`)}
                    style={styles.actionButton}
                    accessibilityLabel="레시피 편집"
                >
                    <Ionicons name="create-outline" size={20} color={theme.tint} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDeleteRecipe(recipe)}
                    style={styles.actionButton}
                    accessibilityLabel="레시피 삭제"
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
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
        width: 40,
        height: 34,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        width: '100%',
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
    addFeaturedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        maxWidth: 480,
        maxHeight: '80%',
        borderWidth: 1,
        borderRadius: 24,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    searchInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 16,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderRadius: 12,
        height: 48,
        gap: 8,
    },
    modalSearchInput: {
        flex: 1,
        fontSize: 15,
        height: '100%',
    },
    modalResList: {
        flex: 1,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#E2E8F0',
    },
    modalSearchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
});
