import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useColorScheme, Linking, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { RECIPES, Recipe } from '../../constants/MockData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function RecipeDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const { user, isAdmin } = useAuth();

    // Find recipe
    const recipe = RECIPES.find((r) => r.id === id);

    if (!recipe) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text }}>Recipe not found</Text>
            </View>
        );
    }

    const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

    const toggleIngredient = (index: number) => {
        const next = new Set(checkedIngredients);
        if (next.has(index)) {
            next.delete(index);
        } else {
            next.add(index);
        }
        setCheckedIngredients(next);
    };

    const openLink = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert('Error', 'Cannot open this link');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: '', // Hide title for clean look
                    headerTransparent: true,
                    headerTintColor: theme.text,
                    headerRight: () => isAdmin ? (
                        <TouchableOpacity onPress={() => router.push({ pathname: '/admin/edit-recipe', params: { id: recipe.id } })}>
                            <Text style={{ color: theme.tint, fontWeight: 'bold', fontSize: 16 }}>Edit</Text>
                        </TouchableOpacity>
                    ) : null,
                }}
            />

            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
                {/* Header Image Area */}
                <View style={[styles.imageHeader, { backgroundColor: recipe.imageColor }]}>
                    <Text style={{ fontSize: 80 }}>🍨</Text>
                </View>

                <View style={[styles.contentContainer, { backgroundColor: theme.background }]}>
                    {/* Title & Tags */}
                    <View style={styles.headerSection}>
                        <View style={styles.tagRow}>
                            <View style={[styles.categoryTag, { backgroundColor: theme.tint }]}>
                                <Text style={styles.categoryTagText}>{recipe.category.toUpperCase()}</Text>
                            </View>
                            {recipe.tags.map((tag, idx) => (
                                <View key={idx} style={[styles.tag, { borderColor: theme.border }]}>
                                    <Text style={[styles.tagText, { color: theme.icon }]}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={[styles.title, { color: theme.text }]}>{recipe.title}</Text>
                    </View>

                    {/* Ingredients Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ingredients</Text>
                        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            {recipe.ingredients.map((ing, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.ingredientRow]}
                                    onPress={() => toggleIngredient(index)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={checkedIngredients.has(index) ? "checkbox" : "square-outline"}
                                        size={24}
                                        color={checkedIngredients.has(index) ? theme.tint : theme.icon}
                                    />
                                    <View style={styles.ingredientInfo}>
                                        <Text style={[
                                            styles.ingredientName,
                                            { color: theme.text, textDecorationLine: checkedIngredients.has(index) ? 'line-through' : 'none', opacity: checkedIngredients.has(index) ? 0.5 : 1 }
                                        ]}>
                                            {ing.name}
                                        </Text>
                                        {ing.note && <Text style={[styles.ingredientNote, { color: theme.icon }]}>{ing.note}</Text>}
                                    </View>
                                    <Text style={[styles.ingredientAmount, { color: theme.text }]}>{ing.amount}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Steps Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Instructions</Text>
                        {recipe.steps.map((step, index) => (
                            <View key={index} style={styles.stepRow}>
                                <View style={[styles.stepNumber, { backgroundColor: theme.tint + '20' }]}>
                                    <Text style={[styles.stepNumberText, { color: theme.tint }]}>{index + 1}</Text>
                                </View>
                                <Text style={[styles.stepText, { color: theme.text }]}>{step}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Purchase Links */}
                    {recipe.purchaseLinks && recipe.purchaseLinks.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Shop Ingredients</Text>
                            {recipe.purchaseLinks.map((link, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.linkButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                                    onPress={() => openLink(link.url)}
                                >
                                    <Ionicons name="cart-outline" size={20} color={theme.text} />
                                    <Text style={[styles.linkText, { color: theme.text }]}>Buy {link.item}</Text>
                                    <Ionicons name="chevron-forward" size={16} color={theme.icon} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageHeader: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        marginTop: -40,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    headerSection: {
        marginBottom: 30,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    categoryTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 4,
    },
    categoryTagText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
    },
    ingredientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ingredientInfo: {
        flex: 1,
        marginLeft: 12,
    },
    ingredientName: {
        fontSize: 16,
        fontWeight: '500',
    },
    ingredientNote: {
        fontSize: 12,
        marginTop: 2,
    },
    ingredientAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    stepRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        marginTop: 2,
    },
    stepNumberText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    stepText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 10,
    },
    linkText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '500',
    },
});
