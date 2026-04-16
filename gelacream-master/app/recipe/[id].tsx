import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useColorScheme, Linking, Alert, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRecipe } from '../../lib/recipes';

export default function RecipeDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const { isAdmin } = useAuth();
    const { recipe, isLoading } = useRecipe(id);
    const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Recipe not found</Text>
            </View>
        );
    }

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
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/admin/edit-recipe', params: { id: recipe.id } })}
                            style={{
                                marginRight: 12,
                                paddingHorizontal: 14,
                                paddingVertical: 8,
                                borderRadius: 999,
                                borderWidth: 1,
                                borderColor: theme.border,
                                backgroundColor: theme.cardBackground,
                            }}
                        >
                            <Text style={{ color: theme.tint, fontWeight: '700', fontSize: 14 }}>Edit</Text>
                        </TouchableOpacity>
                    ) : null,
                }}
            />

            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
                <View style={[styles.imageHeader, { backgroundColor: recipe.imageColor }]}>
                    <Text style={styles.heroEmoji}>🍨</Text>
                </View>

                <View style={[styles.contentContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.headerSection}>
                        <View style={styles.tagRow}>
                            <View style={[styles.categoryTag, { backgroundColor: theme.tint }]}>
                                <Text style={styles.categoryTagText}>{recipe.category.toUpperCase()}</Text>
                            </View>
                            {recipe.tags.map((tag, idx) => (
                                <View key={idx} style={[styles.tag, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
                                    <Text style={[styles.tagText, { color: theme.icon }]}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={[styles.title, { color: theme.text }]}>{recipe.title}</Text>
                        <Text style={[styles.description, { color: theme.icon }]}>
                            정리된 재료와 순서를 따라 바로 작업할 수 있는 실무용 레시피 카드입니다.
                        </Text>
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
                        <View style={styles.stepList}>
                            {recipe.steps.map((step, index) => (
                                <View key={index} style={styles.stepRow}>
                                    <View style={[styles.stepNumber, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                        <Text style={[styles.stepNumberText, { color: theme.tint }]}>{index + 1}</Text>
                                    </View>
                                    <Text style={[styles.stepText, { color: theme.text }]}>{step}</Text>
                                </View>
                            ))}
                        </View>
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
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageHeader: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroEmoji: {
        fontSize: 72,
    },
    contentContainer: {
        flex: 1,
        marginTop: -18,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 28,
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
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.8,
    },
    description: {
        marginTop: 10,
        fontSize: 14,
        lineHeight: 22,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 16,
        letterSpacing: -0.6,
    },
    card: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 18,
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
    stepList: {
        gap: 16,
    },
    stepRow: {
        flexDirection: 'row',
        paddingRight: 4,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
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
