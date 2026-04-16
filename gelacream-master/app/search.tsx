import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { Recipe } from '../constants/MockData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRecipes } from '../lib/recipes';

export default function SearchResultScreen() {
    const { query } = useLocalSearchParams<{ query: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const { recipes, isLoading } = useRecipes();

    const searchText = query ? (Array.isArray(query) ? query[0] : query).toLowerCase() : '';

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchText) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchText))
    );

    const renderItem = ({ item }: { item: Recipe }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => router.push(`/recipe/${item.id}`)}
        >
            <View style={[styles.cardImagePlaceholder, { backgroundColor: item.imageColor }]}>
                <Text style={styles.cardEmoji}>🍨</Text>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.tagRow}>
                    {item.tags.map((tag, index) => (
                        <View key={index} style={[styles.tag, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Text style={[styles.tagText, { color: theme.icon }]}>{tag}</Text>
                        </View>
                    ))}
                </View>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.cardSubtitle, { color: theme.icon }]}>{item.ingredients.length} ingredients</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: `Search: "${query}"`,
                    headerStyle: { backgroundColor: theme.background },
                    headerTintColor: theme.text,
                    headerShadowVisible: false,
                }}
            />

            <View style={[styles.headerBand, { borderBottomColor: theme.border }]}>
                <Text style={[styles.eyebrow, { color: theme.icon }]}>SEARCH RESULTS</Text>
                <Text style={[styles.intro, { color: theme.text }]}>“{query}”에 대한 결과입니다.</Text>
                <Text style={[styles.caption, { color: theme.icon }]}>
                    제목과 재료명을 기준으로 일치하는 레시피만 간결하게 정리했습니다.
                </Text>
            </View>

            {isLoading ? (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : (
                <FlatList
                    data={filteredRecipes}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={64} color={theme.icon} style={{ marginBottom: 16, opacity: 0.5 }} />
                            <Text style={{ color: theme.icon, fontSize: 16, textAlign: 'center' }}>
                                "{query}"와 일치하는 레시피를 찾지 못했습니다.
                            </Text>
                            <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                                <Text style={{ color: theme.tint, fontWeight: '600' }}>이전 화면으로 돌아가기</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBand: {
        paddingHorizontal: 20,
        paddingTop: 6,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    eyebrow: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.4,
        marginBottom: 6,
    },
    intro: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.6,
    },
    caption: {
        marginTop: 8,
        fontSize: 14,
        lineHeight: 20,
    },
    listContent: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 18,
        borderWidth: 1,
        overflow: 'hidden',
    },
    cardImagePlaceholder: {
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardEmoji: {
        fontSize: 32,
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    tag: {
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        marginRight: 6,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
});
