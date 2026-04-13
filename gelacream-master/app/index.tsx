import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useColorScheme, Platform, SafeAreaView, TextInput, FlatList } from 'react-native';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { RECIPES, Recipe } from '../constants/MockData';

const CATEGORIES = [
    { id: 'milk', name: 'Milk Base', dbName: '우유 베이스', color: Colors.light.categoryMilk, icon: '🥛' },
    { id: 'sorbet', name: 'Sorbet & Fruit', dbName: '소르베 & 과일', color: Colors.light.categorySorbet, icon: '🍧' },
    { id: 'vegan', name: 'Vegan', dbName: '비건', color: Colors.light.categoryVegan, icon: '🌱' },
    { id: 'alcohol', name: 'Alcohol', dbName: '알코올', color: Colors.light.categoryAlcohol, icon: '🍷' },
];

const SEASONAL_PICKS = [
    { id: '1', name: '초당옥수수', category: 'milk', tag: 'Summer' },
    { id: '2', name: '유기농 참외', category: 'sorbet', tag: 'Summer' },
    { id: '3', name: '살얼음 식혜', category: 'milk', tag: 'Summer' },
];

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const { user, logout, isAdmin } = useAuth();

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Recipe[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Search Handler
    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.length > 0) {
            setIsSearching(true);
            const results = RECIPES.filter(recipe =>
                recipe.title.toLowerCase().includes(text.toLowerCase()) ||
                recipe.ingredients.some(ing => ing.name.toLowerCase().includes(text.toLowerCase()))
            );
            setSearchResults(results);
        } else {
            setIsSearching(false);
            setSearchResults([]);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: theme.icon }]}>
                            {user
                                ? `Welcome back, ${user.name}${isAdmin ? ' · Admin' : ''}`
                                : 'Welcome Guest'}
                        </Text>
                        <Text style={[styles.title, { color: theme.text }]}>Gelacream{'\n'}Recipe Master</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.profileButton, { backgroundColor: theme.cardBackground }]}
                        onPress={() => user ? logout() : router.push('/login')}
                    >
                        <Text style={{ fontSize: 24 }}>{user ? '👤' : '🔑'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar - Fancy & Floating Dropdown */}
                {/* Search Bar - Fancy & Floating Dropdown */}
                <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground, shadowColor: theme.shadow }]}>
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search flavor..."
                        placeholderTextColor={theme.icon}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        onSubmitEditing={() => {
                            if (searchQuery.length > 0) {
                                router.push(`/search?query=${searchQuery}`);
                                setIsSearching(false); // Close dropdown
                            }
                        }}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')} style={{ marginRight: 8 }}>
                            <Ionicons name="close-circle" size={18} color={theme.icon} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={() => {
                            if (searchQuery.length > 0) {
                                router.push(`/search?query=${searchQuery}`);
                                setIsSearching(false);
                            }
                        }}
                        style={{ padding: 4 }}
                    >
                        <Ionicons name="search" size={24} color={theme.tint} />
                    </TouchableOpacity>
                </View>

                {/* Search Results Dropdown */}
                {isSearching && (
                    <View style={[styles.searchResultsContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        {searchResults.length > 0 ? (
                            searchResults.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
                                    onPress={() => router.push(`/recipe/${item.id}`)}
                                >
                                    <Text style={{ fontSize: 20, marginRight: 10 }}>🍨</Text>
                                    <View>
                                        <Text style={[styles.resultTitle, { color: theme.text }]}>{item.title}</Text>
                                        <Text style={[styles.resultSubtitle, { color: theme.icon }]}>{item.category.toUpperCase()}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.noResult}>
                                <Text style={{ color: theme.icon }}>No recipes found.</Text>
                            </View>
                        )}
                    </View>
                )}


                {/* Seasonal Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>☀️ This Summer</Text>
                        <TouchableOpacity onPress={() => router.push('/category/milk')}>
                            <Text style={{ color: theme.tint }}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {SEASONAL_PICKS.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.featuredCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                                onPress={() => {
                                    const recipeId = item.id === '1' ? 'm2' : 'm1';
                                    router.push(`/recipe/${recipeId}`);
                                }}
                            >
                                <View style={styles.tagBadge}>
                                    <Text style={styles.tagText}>{item.tag}</Text>
                                </View>
                                <Text style={[styles.featuredTitle, { color: theme.text }]}>{item.name}</Text>
                                <Text style={[styles.featuredSubtitle, { color: theme.icon }]}>{item.category.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Categories Grid */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 15 }]}>Categories</Text>
                    <View style={styles.gridContainer}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.categoryCard, { backgroundColor: cat.color }]}
                                onPress={() => router.push(`/category/${cat.id}`)}
                            >
                                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                <Text style={styles.categoryName}>{cat.name}</Text>
                                <Text style={styles.categorySub}>{cat.dbName}</Text>
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
        paddingTop: Platform.OS === 'android' ? 30 : 0,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginTop: 20,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    greeting: {
        fontSize: 16,
        marginBottom: 5,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 40,
    },
    // Search Styles
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 25,
        marginBottom: 30,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    searchResultsContainer: {
        position: 'absolute',
        top: 170, // Adjust based on header height
        left: 20,
        right: 20,
        zIndex: 1000,
        borderRadius: 16,
        borderWidth: 1,
        maxHeight: 200,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    resultTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    resultSubtitle: {
        fontSize: 12,
    },
    noResult: {
        padding: 20,
        alignItems: 'center',
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    horizontalScroll: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    featuredCard: {
        width: 140,
        height: 160,
        borderRadius: 20,
        padding: 15,
        marginRight: 15,
        borderWidth: 1,
        justifyContent: 'flex-end',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    tagBadge: {
        position: 'absolute',
        top: 15,
        left: 15,
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        color: '#F57C00',
        fontSize: 10,
        fontWeight: 'bold',
    },
    featuredTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    featuredSubtitle: {
        fontSize: 12,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '47%',
        aspectRatio: 1, // Square
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        // Glassmorphism effect simulation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    categoryIcon: {
        fontSize: 32,
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
    },
    categorySub: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
});
