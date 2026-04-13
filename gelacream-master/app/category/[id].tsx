import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { RECIPES, Recipe } from '../../constants/MockData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function CategoryScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const { isAdmin } = useAuth();

    // Filter recipes by category
    const filteredRecipes = RECIPES.filter((r) => r.category === id);

    // Get category display name and color
    const getCategoryInfo = (catId: string | string[]) => {
        switch (catId) {
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
                <Text style={{ fontSize: 40 }}>🍨</Text>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.tagRow}>
                    {item.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.cardSubtitle, { color: theme.icon }]}>{item.ingredients.length} Ingredients</Text>
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

            <FlatList
                data={filteredRecipes}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: theme.icon }}>No recipes found in this category.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardImagePlaceholder: {
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
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
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 6,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 10,
        color: '#666',
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
});
