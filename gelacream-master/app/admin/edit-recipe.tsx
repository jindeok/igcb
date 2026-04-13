import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, useColorScheme, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { RECIPES, Recipe, Ingredient } from '../../constants/MockData';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

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

    // Initial State Setup
    const existingRecipe = RECIPES.find(r => r.id === id);

    const [title, setTitle] = useState(existingRecipe?.title || '');
    const [category, setCategory] = useState(existingRecipe?.category || 'milk');
    const [ingredients, setIngredients] = useState<Ingredient[]>(existingRecipe?.ingredients || [{ name: '', amount: '' }]);
    const [steps, setSteps] = useState<string[]>(existingRecipe?.steps || ['']);

    const handleSave = () => {
        if (!title) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }
        // In a real app, validat other fields and save to DB
        Alert.alert('Success', `Recipe ${isEditing ? 'updated' : 'created'} successfully! (Mock)`);
        router.back();
    };

    if (authLoading) {
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

                {/* Basic Info */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.text }]}>Title</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBackground }]}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. Salty Cracker"
                    />

                    <Text style={[styles.label, { color: theme.text }]}>Category (milk, sorbet, vegan, alcohol)</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBackground }]}
                        value={category}
                        onChangeText={(text) => setCategory(text as any)}
                    />
                </View>

                {/* Ingredients */}
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
                                style={[styles.input, { flex: 2, marginRight: 8, color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBackground }]}
                                placeholder="Name"
                                value={ing.name}
                                onChangeText={(text) => updateIngredient(i, 'name', text)}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 8, color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBackground }]}
                                placeholder="Qty"
                                value={ing.amount}
                                onChangeText={(text) => updateIngredient(i, 'amount', text)}
                            />
                            <TouchableOpacity onPress={() => removeIngredient(i)}>
                                <Ionicons name="trash-outline" size={20} color={theme.icon} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Steps */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>Steps</Text>
                        <TouchableOpacity onPress={addStep}>
                            <Ionicons name="add-circle" size={24} color={theme.tint} />
                        </TouchableOpacity>
                    </View>

                    {steps.map((step, i) => (
                        <View key={i} style={styles.row}>
                            <Text style={{ marginRight: 8, color: theme.icon, width: 20 }}>{i + 1}.</Text>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 8, color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBackground }]}
                                placeholder="Description"
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
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 16,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
});
