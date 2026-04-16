import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, useColorScheme, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ingredient } from '../../constants/MockData';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useRecipe } from '../../lib/recipes';

export default function EditRecipeScreen() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.role !== 'admin') {
            Alert.alert('접근 제한', '관리자만 레시피를 편집할 수 있습니다.', [
                { text: '확인', onPress: () => router.replace('/') },
            ]);
        }
    }, [authLoading, user, router]);

    const { id } = useLocalSearchParams(); // If id exists, it's edit mode
    const isEditing = !!id;
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { recipe: existingRecipe, isLoading: recipeLoading } = useRecipe(id);

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<'milk' | 'sorbet' | 'vegan' | 'alcohol'>('milk');
    const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }]);
    const [steps, setSteps] = useState<string[]>(['']);

    useEffect(() => {
        if (!existingRecipe) return;
        setTitle(existingRecipe.title);
        setCategory(existingRecipe.category);
        setIngredients(existingRecipe.ingredients.length > 0 ? existingRecipe.ingredients : [{ name: '', amount: '' }]);
        setSteps(existingRecipe.steps.length > 0 ? existingRecipe.steps : ['']);
    }, [existingRecipe]);

    const buildRecipeId = () => {
        const slug = title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9가-힣]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return `${slug || 'recipe'}-${Date.now()}`;
    };

    const handleSave = async () => {
        if (!title) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        if (!isSupabaseConfigured) {
            Alert.alert(
                'Supabase 설정 필요',
                'Supabase 연결이 아직 설정되지 않았습니다. .env에 EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY를 추가해 주세요.',
            );
            return;
        }

        try {
            const payload = {
                id: existingRecipe?.id ?? buildRecipeId(),
                title,
                category,
                tags: existingRecipe?.tags ?? [],
                ingredients: ingredients.filter((item) => item.name.trim()),
                steps: steps.map((step) => step.trim()).filter(Boolean),
                purchase_links: existingRecipe?.purchaseLinks ?? [],
                image_color: existingRecipe?.imageColor ?? '#FFE5DA',
                created_by: user.id,
            };

            const { error } = await supabase.from('recipes').upsert(payload);
            if (error) {
                throw error;
            }

            Alert.alert('Success', `Recipe ${isEditing ? 'updated' : 'created'} successfully!`);
            router.back();
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.';
            Alert.alert('Error', message);
        }
    };

    if (authLoading || recipeLoading) {
        return (
            <View style={[styles.guardRoot, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    if (!user || user.role !== 'admin') {
        return (
            <View style={[styles.guardRoot, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    // Dynamic Form Handlers
    const addIngredient = () => setIngredients([...ingredients, { name: '', amount: '' }]);
    const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setIngredients(newIngredients);
    };
    const removeIngredient = (index: number) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngredients);
    };

    const addStep = () => setSteps([...steps, '']);
    const updateStep = (index: number, value: string) => {
        const newSteps = [...steps];
        newSteps[index] = value;
        setSteps(newSteps);
    };
    const removeStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index);
        setSteps(newSteps);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    title: isEditing ? 'Edit Recipe' : 'New Recipe',
                    headerRight: () => (
                        <TouchableOpacity onPress={handleSave}>
                            <Text style={{ color: theme.tint, fontWeight: 'bold', fontSize: 16 }}>Save</Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
                <View style={[styles.panel, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.text }]}>Title</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Salty Cracker"
                            placeholderTextColor={theme.icon}
                        />

                        <Text style={[styles.label, { color: theme.text }]}>Category (milk, sorbet, vegan, alcohol)</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                            value={category}
                            onChangeText={(text) => setCategory(text as any)}
                            placeholderTextColor={theme.icon}
                        />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>Ingredients</Text>
                            <TouchableOpacity onPress={addIngredient}>
                                <Ionicons name="add-circle" size={24} color={theme.tint} />
                            </TouchableOpacity>
                        </View>

                        {ingredients.map((ing, i) => (
                            <View key={i} style={styles.row}>
                                <TextInput
                                    style={[styles.input, styles.rowInputLarge, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                    placeholder="Name"
                                    placeholderTextColor={theme.icon}
                                    value={ing.name}
                                    onChangeText={(text) => updateIngredient(i, 'name', text)}
                                />
                                <TextInput
                                    style={[styles.input, styles.rowInputSmall, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                    placeholder="Qty"
                                    placeholderTextColor={theme.icon}
                                    value={ing.amount}
                                    onChangeText={(text) => updateIngredient(i, 'amount', text)}
                                />
                                <TouchableOpacity onPress={() => removeIngredient(i)}>
                                    <Ionicons name="trash-outline" size={20} color={theme.icon} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>Steps</Text>
                            <TouchableOpacity onPress={addStep}>
                                <Ionicons name="add-circle" size={24} color={theme.tint} />
                            </TouchableOpacity>
                        </View>

                        {steps.map((step, i) => (
                            <View key={i} style={styles.row}>
                                <Text style={[styles.stepIndex, { color: theme.icon }]}>{i + 1}.</Text>
                                <TextInput
                                    style={[styles.input, styles.stepInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                    placeholder="Description"
                                    placeholderTextColor={theme.icon}
                                    multiline
                                    value={step}
                                    onChangeText={(text) => updateStep(i, text)}
                                />
                                <TouchableOpacity onPress={() => removeStep(i)}>
                                    <Ionicons name="trash-outline" size={20} color={theme.icon} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    guardRoot: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    panel: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        fontSize: 16,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    rowInputLarge: {
        flex: 2,
        marginRight: 8,
    },
    rowInputSmall: {
        flex: 1,
        marginRight: 8,
    },
    stepInput: {
        flex: 1,
        marginRight: 8,
        minHeight: 52,
    },
    stepIndex: {
        marginRight: 8,
        width: 20,
    },
});
