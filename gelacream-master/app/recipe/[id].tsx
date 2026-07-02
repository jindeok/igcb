import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Pressable, useColorScheme, Linking, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRecipe } from '../../lib/recipes';
import { isSupabaseConfigured, resolveImageSrc, supabase } from '../../lib/supabase';

export default function RecipeDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const { isAdmin, user } = useAuth();
    const { recipe, isLoading } = useRecipe(id);
    const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
    const [ipAddress, setIpAddress] = useState('IP 확인중');
    const [accessedAt] = useState(() => new Date());

    useEffect(() => {
        let mounted = true;

        const loadIpAddress = async () => {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data: { ip?: string } = await response.json();
                if (mounted) {
                    setIpAddress(data.ip ?? 'IP 미확인');
                }
            } catch {
                if (mounted) {
                    setIpAddress('IP 미확인');
                }
            }
        };

        void loadIpAddress();

        return () => {
            mounted = false;
        };
    }, []);

    const watermarkText = useMemo(() => {
        const userName = user?.name?.trim() || '이름 미확인';
        const userId = user?.email || user?.id || 'ID 미확인';
        const accessTime = accessedAt.toLocaleString('ko-KR');
        return `${userName} (${userId}) | ${ipAddress} | ${accessTime}`;
    }, [user, ipAddress, accessedAt]);

    const watermarkRows = useMemo(() => Array.from({ length: 24 }, (_, idx) => `${watermarkText}   `), [watermarkText]);

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

    const toggleIngredient = (key: string) => {
        const next = new Set(checkedIngredients);
        if (next.has(key)) {
            next.delete(key);
        } else {
            next.add(key);
        }
        setCheckedIngredients(next);
    };

    const ingredientGroups =
        recipe.ingredientGroups && recipe.ingredientGroups.length > 0
            ? recipe.ingredientGroups
            : [{ ingredients: recipe.ingredients }];
    const stepGroups =
        recipe.stepGroups && recipe.stepGroups.length > 0
            ? recipe.stepGroups
            : recipe.steps.length > 0
              ? [{ steps: recipe.steps }]
              : [];

    const openLink = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert('Error', 'Cannot open this link');
        }
    };

    const performDeleteRecipe = async () => {
        if (!isSupabaseConfigured) {
            if (Platform.OS === 'web') {
                window.alert('Supabase 설정이 필요합니다.');
            } else {
                Alert.alert('오류', 'Supabase 설정이 필요합니다.');
            }
            return;
        }

        try {
            // Storage 이미지 정리 (버킷에 올라간 것만 대상; 정적/외부 경로는 제외)
            const storagePaths = [...(recipe.images ?? []), ...(recipe.instructionImages ?? [])]
                .map((img) => img.src)
                .filter((src) => src && !src.startsWith('http') && !src.startsWith('/'));
            if (storagePaths.length > 0) {
                await supabase.storage.from('recipe-images').remove(storagePaths);
            }

            const { data, error } = await supabase.from('recipes').delete().eq('id', recipe.id).select('id');
            if (error) {
                throw error;
            }
            if (!data || data.length === 0) {
                const message = '삭제 권한이 없거나 이미 삭제된 레시피입니다.';
                if (Platform.OS === 'web') {
                    window.alert(message);
                } else {
                    Alert.alert('오류', message);
                }
                return;
            }

            if (Platform.OS === 'web') {
                window.alert('레시피가 삭제되었습니다.');
                router.replace('/category/all');
            } else {
                Alert.alert('완료', '레시피가 삭제되었습니다.', [
                    { text: '확인', onPress: () => router.replace('/category/all') },
                ]);
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : '삭제 중 오류가 발생했습니다.';
            if (Platform.OS === 'web') {
                window.alert(message);
            } else {
                Alert.alert('오류', message);
            }
        }
    };

    const handleDeleteRecipe = () => {
        if (Platform.OS === 'web') {
            const ok = window.confirm('레시피를 삭제하시겠습까?');
            if (ok) {
                void performDeleteRecipe();
            }
            return;
        }

        Alert.alert('레시피 삭제', '레시피를 삭제하시겠습까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                style: 'destructive',
                onPress: () => {
                    void performDeleteRecipe();
                },
            },
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View pointerEvents="none" style={styles.watermarkOverlay}>
                {watermarkRows.map((row, idx) => (
                    <Text key={idx} style={styles.watermarkText}>
                        {row.repeat(3)}
                    </Text>
                ))}
            </View>
            <Stack.Screen
                options={{
                    title: '', // Hide title for clean look
                    headerTransparent: true,
                    headerTintColor: theme.text,
                    headerRight: () => isAdmin ? (
                        <View style={{ flexDirection: 'row', marginRight: 8 }}>
                            <Pressable
                                onPress={() => router.push({ pathname: '/admin/edit-recipe', params: { id: recipe.id } })}
                                hitSlop={10}
                                style={({ pressed }) => ({
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    borderRadius: 999,
                                    borderWidth: 1,
                                    borderColor: theme.border,
                                    backgroundColor: theme.cardBackground,
                                    marginRight: 8,
                                    opacity: pressed ? 0.75 : 1,
                                })}
                            >
                                <Text style={{ color: theme.tint, fontWeight: '700', fontSize: 14 }}>Edit</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleDeleteRecipe}
                                hitSlop={10}
                                style={({ pressed }) => ({
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    borderRadius: 999,
                                    borderWidth: 1,
                                    borderColor: '#EF4444',
                                    backgroundColor: theme.cardBackground,
                                    opacity: pressed ? 0.75 : 1,
                                })}
                            >
                                <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 14 }}>Delete</Text>
                            </Pressable>
                        </View>
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
                        {recipe.description ? (
                            <Text style={[styles.description, { color: theme.icon }]}>{recipe.description}</Text>
                        ) : null}
                        {recipe.hardness != null && (
                            <View style={styles.infoChipRow}>
                                <View style={[styles.infoChip, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                    <Ionicons name="speedometer-outline" size={16} color={theme.tint} />
                                    <Text style={[styles.infoChipLabel, { color: theme.icon }]}>머신 경도값</Text>
                                    <Text style={[styles.infoChipValue, { color: theme.text }]}>{recipe.hardness}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Ingredients Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionEyebrow, { color: theme.icon }]}>INGREDIENTS</Text>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>배합</Text>
                        {ingredientGroups.map((group, groupIndex) => {
                            const amountColCount = Math.max(
                                group.columns?.length ?? 0,
                                ...group.ingredients.map((ing) => ing.amounts?.length ?? 0),
                            );
                            const isWide = amountColCount >= 3;
                            const rows = (
                                <View style={isWide ? { minWidth: 132 + amountColCount * 92 + 36 } : undefined}>
                                    {group.columns && group.columns.length > 0 ? (
                                        <View style={[styles.columnHeaderRow, { borderBottomColor: theme.border }]}>
                                            <View style={styles.columnHeaderSpacer} />
                                            {group.columns.map((col, colIndex) => (
                                                <Text
                                                    key={colIndex}
                                                    style={[styles.columnHeaderText, { color: theme.icon }]}
                                                    numberOfLines={2}
                                                >
                                                    {col}
                                                </Text>
                                            ))}
                                        </View>
                                    ) : null}
                                    {group.ingredients.map((ing, index) => {
                                        const key = `${groupIndex}-${index}`;
                                        const checked = checkedIngredients.has(key);
                                        return (
                                            <TouchableOpacity
                                                key={key}
                                                style={[styles.ingredientRow]}
                                                onPress={() => toggleIngredient(key)}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons
                                                    name={checked ? "checkbox" : "square-outline"}
                                                    size={24}
                                                    color={checked ? theme.tint : theme.icon}
                                                />
                                                <View style={styles.ingredientInfo}>
                                                    <Text style={[
                                                        styles.ingredientName,
                                                        { color: theme.text, textDecorationLine: checked ? 'line-through' : 'none', opacity: checked ? 0.5 : 1 }
                                                    ]}>
                                                        {ing.name}
                                                    </Text>
                                                    {ing.note && <Text style={[styles.ingredientNote, { color: theme.icon }]}>{ing.note}</Text>}
                                                </View>
                                                {ing.amounts && ing.amounts.length > 0 ? (
                                                    ing.amounts.map((amount, amountIndex) => (
                                                        <Text
                                                            key={amountIndex}
                                                            style={[styles.ingredientAmountCol, { color: theme.text }]}
                                                        >
                                                            {amount}
                                                        </Text>
                                                    ))
                                                ) : (
                                                    <Text style={[styles.ingredientAmount, { color: theme.text }]}>{ing.amount}</Text>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            );
                            return (
                                <View key={groupIndex} style={styles.groupBlock}>
                                    {group.title ? (
                                        <Text style={[styles.groupTitle, { color: theme.text }]}>{group.title}</Text>
                                    ) : null}
                                    {isWide ? (
                                        <View style={styles.swipeHintRow}>
                                            <Ionicons name="swap-horizontal" size={13} color={theme.icon} />
                                            <Text style={[styles.swipeHintText, { color: theme.icon }]}>
                                                좌우로 밀어 배합량을 비교하세요
                                            </Text>
                                        </View>
                                    ) : null}
                                    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                        {isWide ? (
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                {rows}
                                            </ScrollView>
                                        ) : (
                                            rows
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* Steps Section */}
                    {(stepGroups.length > 0 || (recipe.instructionImages?.length ?? 0) > 0) && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionEyebrow, { color: theme.icon }]}>INSTRUCTIONS</Text>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>만드는 순서</Text>
                            {stepGroups.map((group, groupIndex) => (
                                <View key={groupIndex} style={styles.groupBlock}>
                                    {group.title ? (
                                        <Text style={[styles.groupTitle, { color: theme.text }]}>{group.title}</Text>
                                    ) : null}
                                    <View style={styles.stepList}>
                                        {group.steps.map((step, index) => (
                                            <View key={index} style={styles.stepRow}>
                                                <View style={[styles.stepNumber, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                                    <Text style={[styles.stepNumberText, { color: theme.tint }]}>{index + 1}</Text>
                                                </View>
                                                <Text style={[styles.stepText, { color: theme.text }]}>{step}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ))}
                            {recipe.instructionImages?.map((image, index) => (
                                <View key={index} style={[styles.diagramCard, { backgroundColor: '#FFFFFF', borderColor: theme.border }]}>
                                    <Image source={{ uri: resolveImageSrc(image.src) }} style={styles.diagramImage} resizeMode="contain" />
                                    {image.caption ? (
                                        <Text style={[styles.imageCaption, { color: theme.icon }]}>{image.caption}</Text>
                                    ) : null}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Notes Section */}
                    {recipe.notes && recipe.notes.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionEyebrow, { color: theme.icon }]}>NOTES</Text>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>참고 사항</Text>
                            <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                {recipe.notes.map((note, index) => {
                                    const isWarning = /^[‼※⚠!]/.test(note);
                                    return (
                                        <View key={index} style={[styles.noteRow, index > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                                            <Ionicons
                                                name={isWarning ? 'alert-circle' : 'information-circle-outline'}
                                                size={18}
                                                color={isWarning ? '#F59E0B' : theme.icon}
                                                style={styles.noteIcon}
                                            />
                                            <Text style={[styles.noteText, { color: isWarning ? '#B45309' : theme.text }]}>{note}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Purchase reference images & links */}
                    {((recipe.images && recipe.images.length > 0) || (recipe.purchaseLinks && recipe.purchaseLinks.length > 0)) && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionEyebrow, { color: theme.icon }]}>SHOPPING</Text>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>재료 구매 참고</Text>
                            {recipe.images && recipe.images.length > 0 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
                                    {recipe.images.map((image, index) => (
                                        <View key={index} style={[styles.imageCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                            <Image source={{ uri: resolveImageSrc(image.src) }} style={styles.referenceImage} resizeMode="cover" />
                                            {image.caption ? (
                                                <Text style={[styles.imageCaption, { color: theme.icon }]} numberOfLines={2}>
                                                    {image.caption}
                                                </Text>
                                            ) : null}
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                            {recipe.purchaseLinks?.map((link, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.linkButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                                    onPress={() => openLink(link.url)}
                                >
                                    <Ionicons name="cart-outline" size={20} color={theme.text} />
                                    <Text style={[styles.linkText, { color: theme.text }]}>{link.item}</Text>
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
    sectionEyebrow: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 16,
        letterSpacing: -0.6,
    },
    infoChipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 14,
    },
    infoChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    infoChipLabel: {
        fontSize: 13,
    },
    infoChipValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    groupBlock: {
        marginBottom: 14,
    },
    groupTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    swipeHintRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
    },
    swipeHintText: {
        fontSize: 12,
    },
    columnHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: 8,
        marginBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    columnHeaderSpacer: {
        flex: 1,
        marginLeft: 36,
    },
    columnHeaderText: {
        width: 92,
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'right',
    },
    ingredientAmountCol: {
        width: 92,
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'right',
    },
    noteRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8,
    },
    noteIcon: {
        marginTop: 2,
        marginRight: 10,
    },
    noteText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
    diagramCard: {
        marginTop: 8,
        borderWidth: 1,
        borderRadius: 16,
        padding: 10,
        gap: 8,
    },
    diagramImage: {
        width: '100%',
        height: 260,
        borderRadius: 10,
    },
    imageRow: {
        gap: 12,
        paddingBottom: 4,
        marginBottom: 10,
    },
    imageCard: {
        width: 168,
        borderWidth: 1,
        borderRadius: 16,
        padding: 8,
        gap: 8,
    },
    referenceImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
    },
    imageCaption: {
        fontSize: 12,
        lineHeight: 16,
        paddingHorizontal: 2,
        paddingBottom: 2,
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
    watermarkOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 10,
    },
    watermarkText: {
        color: '#000',
        opacity: 0.08,
        fontSize: 15,
        fontWeight: '600',
        transform: [{ rotate: '-24deg' }],
        marginVertical: 10,
        marginLeft: -90,
        includeFontPadding: false,
    },
});
