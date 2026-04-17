import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Recipe } from '../../constants/MockData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRecipes } from '../../lib/recipes';

export default function CategoryScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const { isAdmin } = useAuth();
    const { recipes, isLoading } = useRecipes();

    const filteredRecipes = id === 'all' ? recipes : recipes.filter((r) => r.category === id);

    // Get category display name and color
    const getCategoryInfo = (catId: string | string[]) => {
        switch (catId) {
            case 'all': return { name: 'All Recipes', color: '#FFFFFF' };
            case 'milk': return { name: 'Milk Base', color: '#FFF8E1' };
            case 'sorbet': return { name: 'Sorbet & Fruit', color: '#E1F5FE' };
            case 'vegan': return { name: 'Vegan', color: '#E8F5E9' };
            case 'alcohol': return { name: 'Alcohol', color: '#F3E5F5' };
            default: return { name: 'Recipes', color: '#FFFFFF' };
        }
    };

    const catInfo = getCategoryInfo(id);

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
                    title: catInfo.name,
                    headerStyle: { backgroundColor: theme.background },
                    headerTintColor: theme.text,
                    headerShadowVisible: false,
                    headerRight: () => isAdmin ? (
                        <TouchableOpacity onPress={() => router.push('/admin/edit-recipe')} style={{ marginRight: 10 }}>
                            <Ionicons name="add-circle-outline" size={28} color={theme.tint} />
                        </TouchableOpacity>
                    ) : null,
                }}
            />

            <View style={[styles.headerBand, { borderBottomColor: theme.border }]}>
                <Text style={[styles.eyebrow, { color: theme.icon }]}>{catInfo.name}</Text>
                <Text style={[styles.intro, { color: theme.text }]}>카테고리별 레시피를 한눈에 정리했습니다.</Text>
                <Text style={[styles.caption, { color: theme.icon }]}>
                    베이스 유형별로 필요한 레시피만 빠르게 비교하고 선택할 수 있습니다.
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
                            <Text style={{ color: theme.icon, fontSize: 15 }}>이 카테고리에는 아직 등록된 레시피가 없습니다.</Text>
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
    },
});
