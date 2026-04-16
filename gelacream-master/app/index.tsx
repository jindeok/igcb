import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { type Recipe } from '../constants/MockData';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../lib/recipes';

const CATEGORIES = [
    { id: 'milk', name: 'Milk Base', dbName: '우유 베이스', icon: '🥛', description: '부드럽고 클래식한 베이스' },
    { id: 'sorbet', name: 'Sorbet & Fruit', dbName: '소르베 & 과일', icon: '🍧', description: '산뜻한 과일 계열 레시피' },
    { id: 'vegan', name: 'Vegan', dbName: '비건', icon: '🌱', description: '식물성 재료 중심 구성' },
    { id: 'alcohol', name: 'Alcohol', dbName: '알코올', icon: '🍷', description: '성인용 플레이버 모음' },
] as const;

const CATEGORY_COLOR_KEYS = {
    milk: 'categoryMilk',
    sorbet: 'categorySorbet',
    vegan: 'categoryVegan',
    alcohol: 'categoryAlcohol',
} as const;

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const { logout, isAdmin } = useAuth();
    const { recipes, isLoading, error } = useRecipes();
    const [searchQuery, setSearchQuery] = useState('');

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const searchResults =
        normalizedQuery.length > 0
            ? recipes
                  .filter(
                      (recipe) =>
                          recipe.title.toLowerCase().includes(normalizedQuery) ||
                          recipe.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(normalizedQuery)),
                  )
                  .slice(0, 5)
            : [];

    const handleSubmitSearch = () => {
        if (!normalizedQuery) return;
        router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    };

    const featuredRecipes = recipes.slice(0, 4);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style="dark" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.topBar}>
                    <View style={styles.brandBlock}>
                        <Text style={[styles.kicker, { color: theme.icon }]}>ICE GIRL CREAM BOY</Text>
                        <Text style={[styles.pageTitle, { color: theme.text }]}>Recipe archive</Text>
                    </View>
                    <TouchableOpacity
                        accessibilityLabel="로그아웃"
                        style={[styles.iconButton, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}
                        onPress={() => logout()}
                    >
                        <Ionicons name="log-out-outline" size={18} color={theme.text} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.heroCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <View style={styles.heroHeader}>
                        <View
                            style={[
                                styles.roleBadge,
                                {
                                    backgroundColor: isAdmin ? theme.tint : theme.background,
                                    borderColor: isAdmin ? theme.tint : theme.border,
                                },
                            ]}
                        >
                            <Text style={[styles.roleBadgeText, { color: isAdmin ? '#FFFFFF' : theme.icon }]}>
                                {isAdmin ? 'ADMIN MODE' : 'VIEW MODE'}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.heroTitle, { color: theme.text }]}>간결하게 찾고, 바로 확인하는 젤라또 레시피 보드</Text>
                    <Text style={[styles.heroBody, { color: theme.icon }]}>
                        필요한 레시피를 빠르게 검색하고, 카테고리별로 정리된 화면에서 재료와 작업 순서를 바로 확인할 수 있습니다.
                    </Text>
                    <View style={styles.heroStatsRow}>
                        <View style={[styles.statCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Text style={[styles.statValue, { color: theme.text }]}>{recipes.length}</Text>
                            <Text style={[styles.statLabel, { color: theme.icon }]}>Total recipes</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Text style={[styles.statValue, { color: theme.text }]}>{CATEGORIES.length}</Text>
                            <Text style={[styles.statLabel, { color: theme.icon }]}>Categories</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionEyebrow, { color: theme.icon }]}>SEARCH</Text>
                    <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <Ionicons name="search-outline" size={18} color={theme.icon} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.text }]}
                            placeholder="맛 이름이나 재료를 검색하세요"
                            placeholderTextColor={theme.icon}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSubmitSearch}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 ? (
                            <TouchableOpacity accessibilityLabel="검색어 지우기" onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={theme.icon} />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {normalizedQuery.length > 0 ? (
                        <View style={[styles.searchResultsCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            {searchResults.length > 0 ? (
                                searchResults.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
                                        onPress={() => router.push(`/recipe/${item.id}`)}
                                    >
                                        <View style={[styles.searchResultIcon, { backgroundColor: theme.background }]}>
                                            <Text style={styles.searchResultEmoji}>🍨</Text>
                                        </View>
                                        <View style={styles.searchResultContent}>
                                            <Text style={[styles.resultTitle, { color: theme.text }]}>{item.title}</Text>
                                            <Text style={[styles.resultSubtitle, { color: theme.icon }]}>
                                                {item.category.toUpperCase()} · {item.ingredients.length} ingredients
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={16} color={theme.icon} />
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.emptyInlineState}>
                                    <Text style={[styles.emptyInlineText, { color: theme.icon }]}>일치하는 레시피가 없습니다.</Text>
                                </View>
                            )}
                        </View>
                    ) : null}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.sectionEyebrow, { color: theme.icon }]}>OVERVIEW</Text>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>추천 레시피</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/category/milk')}>
                            <Text style={[styles.sectionLink, { color: theme.tint }]}>전체 보기</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingWrap}>
                            <ActivityIndicator size="large" color={theme.tint} />
                        </View>
                    ) : (
                        <View style={styles.featuredList}>
                            {featuredRecipes.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.featuredCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                                    onPress={() => router.push(`/recipe/${item.id}`)}
                                >
                                    <View style={[styles.featuredAccent, { backgroundColor: item.imageColor }]} />
                                    <View style={styles.featuredTopRow}>
                                        <View style={[styles.featuredTag, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                            <Text style={[styles.featuredTagText, { color: theme.icon }]}>{item.tags[0] ?? 'Featured'}</Text>
                                        </View>
                                        <Text style={[styles.featuredMeta, { color: theme.icon }]}>{item.category.toUpperCase()}</Text>
                                    </View>
                                    <Text style={[styles.featuredTitle, { color: theme.text }]}>{item.title}</Text>
                                    <Text style={[styles.featuredDescription, { color: theme.icon }]} numberOfLines={2}>
                                        {item.description ?? '재료 구성과 작업 순서를 빠르게 확인할 수 있는 대표 레시피입니다.'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {error ? <Text style={[styles.helperText, { color: theme.icon }]}>{error}</Text> : null}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionEyebrow, { color: theme.icon }]}>CATEGORIES</Text>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>카테고리별로 탐색</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryCard,
                                    {
                                        backgroundColor: theme[CATEGORY_COLOR_KEYS[category.id]],
                                        borderColor: theme.border,
                                    },
                                ]}
                                onPress={() => router.push(`/category/${category.id}`)}
                            >
                                <Text style={styles.categoryIcon}>{category.icon}</Text>
                                <Text style={[styles.categoryName, { color: theme.text }]}>{category.name}</Text>
                                <Text style={[styles.categorySub, { color: theme.icon }]}>{category.dbName}</Text>
                                <Text style={[styles.categoryDescription, { color: theme.icon }]}>{category.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 24 : 0,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 24,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    brandBlock: {
        gap: 4,
    },
    kicker: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1.2,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.8,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroCard: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 24,
        gap: 16,
    },
    heroHeader: {
        flexDirection: 'row',
    },
    roleBadge: {
        minHeight: 32,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderWidth: 1,
        borderRadius: 999,
        justifyContent: 'center',
    },
    roleBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    heroTitle: {
        fontSize: 32,
        lineHeight: 40,
        fontWeight: '700',
        letterSpacing: -0.9,
        maxWidth: 540,
    },
    heroBody: {
        fontSize: 16,
        lineHeight: 24,
        maxWidth: 520,
    },
    heroStatsRow: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    statCard: {
        flexGrow: 1,
        minWidth: 140,
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
        gap: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 13,
    },
    section: {
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 12,
    },
    sectionEyebrow: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.6,
    },
    sectionLink: {
        fontSize: 14,
        fontWeight: '600',
    },
    searchContainer: {
        minHeight: 56,
        borderWidth: 1,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
    },
    searchInput: {
        flex: 1,
        minHeight: 56,
        fontSize: 16,
    },
    searchResultsCard: {
        borderWidth: 1,
        borderRadius: 18,
        overflow: 'hidden',
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    searchResultIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchResultEmoji: {
        fontSize: 20,
    },
    searchResultContent: {
        flex: 1,
        gap: 2,
    },
    resultTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    resultSubtitle: {
        fontSize: 13,
    },
    emptyInlineState: {
        paddingHorizontal: 16,
        paddingVertical: 18,
    },
    emptyInlineText: {
        fontSize: 14,
    },
    loadingWrap: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    featuredList: {
        gap: 12,
    },
    featuredCard: {
        borderWidth: 1,
        borderRadius: 20,
        padding: 18,
        gap: 12,
        overflow: 'hidden',
    },
    featuredAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
    },
    featuredTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    featuredTag: {
        minHeight: 28,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        justifyContent: 'center',
    },
    featuredTagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    featuredMeta: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    featuredDescription: {
        fontSize: 14,
        lineHeight: 21,
    },
    helperText: {
        fontSize: 13,
        lineHeight: 20,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryCard: {
        width: '48%',
        minHeight: 176,
        borderRadius: 20,
        borderWidth: 1,
        padding: 18,
        gap: 8,
    },
    categoryIcon: {
        fontSize: 28,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '700',
    },
    categorySub: {
        fontSize: 13,
    },
    categoryDescription: {
        fontSize: 13,
        lineHeight: 19,
        marginTop: 'auto',
    },
});
