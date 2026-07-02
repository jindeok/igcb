import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, useColorScheme, ActivityIndicator, Image } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { IngredientGroup, StepGroup, RecipeImage, PurchaseLink } from '../../constants/MockData';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured, resolveImageSrc, RECIPE_IMAGE_BUCKET } from '../../lib/supabase';
import { useRecipe } from '../../lib/recipes';

const CATEGORIES = [
    { id: 'milk', label: '우유 베이스' },
    { id: 'sorbet', label: '소르베' },
    { id: 'vegan', label: '비건' },
    { id: 'alcohol', label: '알코올' },
] as const;

type Category = (typeof CATEGORIES)[number]['id'];
type ImageField = 'images' | 'instructionImages';

function notify(title: string, message: string) {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
    } else {
        Alert.alert(title, message);
    }
}

export default function EditRecipeScreen() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.role !== 'admin') {
            notify('접근 제한', '관리자만 레시피를 편집할 수 있습니다.');
            router.replace('/');
        }
    }, [authLoading, user, router]);

    const { id } = useLocalSearchParams();
    const isEditing = !!id;
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { recipe: existingRecipe, isLoading: recipeLoading } = useRecipe(id);

    // 새 레시피 생성 시 이미지 업로드 경로를 위해 id를 한 번만 확정
    const recipeId = useMemo(() => {
        if (existingRecipe?.id) return existingRecipe.id;
        if (typeof id === 'string') return id;
        return `recipe-${Date.now()}`;
    }, [existingRecipe?.id, id]);

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<Category>('milk');
    const [hardnessText, setHardnessText] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [extraTags, setExtraTags] = useState<string[]>([]);
    const [tagDraft, setTagDraft] = useState('');
    const [groups, setGroups] = useState<IngredientGroup[]>([{ ingredients: [{ name: '', amount: '' }] }]);
    const [stepGroups, setStepGroups] = useState<StepGroup[]>([{ steps: [''] }]);
    const [notes, setNotes] = useState<string[]>([]);
    const [images, setImages] = useState<RecipeImage[]>([]);
    const [instructionImages, setInstructionImages] = useState<RecipeImage[]>([]);
    const [purchaseLinks, setPurchaseLinks] = useState<PurchaseLink[]>([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!existingRecipe) return;
        setTitle(existingRecipe.title);
        setCategory(existingRecipe.category);
        setHardnessText(existingRecipe.hardness != null ? String(existingRecipe.hardness) : '');
        setIsFeatured(existingRecipe.tags.includes('추천'));
        setExtraTags(existingRecipe.tags.filter((t) => t !== '추천'));
        setGroups(
            existingRecipe.ingredientGroups && existingRecipe.ingredientGroups.length > 0
                ? existingRecipe.ingredientGroups.map((g) => ({
                      title: g.title,
                      columns: g.columns,
                      ingredients: g.ingredients.length > 0 ? g.ingredients : [{ name: '', amount: '' }],
                  }))
                : [{ ingredients: existingRecipe.ingredients.length > 0 ? existingRecipe.ingredients : [{ name: '', amount: '' }] }],
        );
        setStepGroups(
            existingRecipe.stepGroups && existingRecipe.stepGroups.length > 0
                ? existingRecipe.stepGroups.map((g) => ({ title: g.title, steps: g.steps.length > 0 ? g.steps : [''] }))
                : existingRecipe.steps.length > 0
                  ? [{ steps: existingRecipe.steps }]
                  : [{ steps: [''] }],
        );
        setNotes(existingRecipe.notes ?? []);
        setImages(existingRecipe.images ?? []);
        setInstructionImages(existingRecipe.instructionImages ?? []);
        setPurchaseLinks(existingRecipe.purchaseLinks ?? []);
    }, [existingRecipe]);

    // ── 이미지 업로드 / 삭제 (웹) ────────────────────────────
    const pickAndUpload = (field: ImageField) => {
        if (!isSupabaseConfigured) {
            notify('Supabase 설정 필요', '.env에 Supabase URL/anon key를 추가해야 이미지를 업로드할 수 있습니다.');
            return;
        }
        if (Platform.OS !== 'web' || typeof document === 'undefined') {
            notify('웹에서 업로드', '이미지 업로드는 웹 관리자 화면에서 지원됩니다.');
            return;
        }
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const ext = (file.name.split('.').pop() || 'png').toLowerCase();
            const path = `${recipeId}/${field === 'images' ? 'ref' : 'step'}-${Date.now()}.${ext}`;
            setUploading(true);
            try {
                const { error } = await supabase.storage
                    .from(RECIPE_IMAGE_BUCKET)
                    .upload(path, file, { contentType: file.type || undefined, upsert: true });
                if (error) throw error;
                const entry: RecipeImage = { src: path };
                if (field === 'images') setImages((prev) => [...prev, entry]);
                else setInstructionImages((prev) => [...prev, entry]);
            } catch (e: unknown) {
                notify('업로드 실패', e instanceof Error ? e.message : '이미지 업로드 중 오류가 발생했습니다.');
            } finally {
                setUploading(false);
            }
        };
        input.click();
    };

    const removeImage = async (field: ImageField, index: number) => {
        const list = field === 'images' ? images : instructionImages;
        const target = list[index];
        const setList = field === 'images' ? setImages : setInstructionImages;
        setList(list.filter((_, i) => i !== index));
        // 버킷에 올라간 것만 정리 (정적/외부 경로 제외)
        if (isSupabaseConfigured && target?.src && !target.src.startsWith('http') && !target.src.startsWith('/')) {
            await supabase.storage.from(RECIPE_IMAGE_BUCKET).remove([target.src]).catch(() => undefined);
        }
    };

    const setImageCaption = (field: ImageField, index: number, caption: string) => {
        const setList = field === 'images' ? setImages : setInstructionImages;
        setList((prev) => prev.map((img, i) => (i === index ? { ...img, caption } : img)));
    };

    // ── 배합 그룹 편집 ──────────────────────────────────────
    const updateGroup = (gi: number, patch: Partial<IngredientGroup>) =>
        setGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, ...patch } : g)));
    const addGroup = () => setGroups((prev) => [...prev, { ingredients: [{ name: '', amount: '' }] }]);
    const removeGroup = (gi: number) => setGroups((prev) => prev.filter((_, i) => i !== gi));

    const addColumn = (gi: number) =>
        setGroups((prev) =>
            prev.map((g, i) => {
                if (i !== gi) return g;
                const columns = [...(g.columns ?? []), ''];
                const ingredients = g.ingredients.map((ing) => ({
                    ...ing,
                    amounts: [...(ing.amounts ?? (ing.amount ? [ing.amount] : [])), ''].slice(0, columns.length),
                }));
                return { ...g, columns, ingredients };
            }),
        );
    const updateColumn = (gi: number, ci: number, value: string) =>
        setGroups((prev) =>
            prev.map((g, i) => (i === gi ? { ...g, columns: (g.columns ?? []).map((c, j) => (j === ci ? value : c)) } : g)),
        );
    const removeColumn = (gi: number, ci: number) =>
        setGroups((prev) =>
            prev.map((g, i) => {
                if (i !== gi) return g;
                const columns = (g.columns ?? []).filter((_, j) => j !== ci);
                const ingredients = g.ingredients.map((ing) => ({
                    ...ing,
                    amounts: (ing.amounts ?? []).filter((_, j) => j !== ci),
                }));
                return { ...g, columns: columns.length > 0 ? columns : undefined, ingredients };
            }),
        );

    const addIngredient = (gi: number) =>
        setGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, ingredients: [...g.ingredients, { name: '', amount: '' }] } : g)));
    const updateIngredientName = (gi: number, ii: number, name: string) =>
        setGroups((prev) =>
            prev.map((g, i) => (i === gi ? { ...g, ingredients: g.ingredients.map((ing, j) => (j === ii ? { ...ing, name } : ing)) } : g)),
        );
    const updateIngredientAmount = (gi: number, ii: number, value: string, ci?: number) =>
        setGroups((prev) =>
            prev.map((g, i) => {
                if (i !== gi) return g;
                return {
                    ...g,
                    ingredients: g.ingredients.map((ing, j) => {
                        if (j !== ii) return ing;
                        if (ci == null) return { ...ing, amount: value };
                        const amounts = [...(ing.amounts ?? [])];
                        amounts[ci] = value;
                        return { ...ing, amounts };
                    }),
                };
            }),
        );
    const removeIngredient = (gi: number, ii: number) =>
        setGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, ingredients: g.ingredients.filter((_, j) => j !== ii) } : g)));

    // ── 스텝 그룹 편집 ──────────────────────────────────────
    const addStepGroup = () => setStepGroups((prev) => [...prev, { steps: [''] }]);
    const removeStepGroup = (gi: number) => setStepGroups((prev) => prev.filter((_, i) => i !== gi));
    const updateStepGroupTitle = (gi: number, title: string) =>
        setStepGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, title } : g)));
    const addStep = (gi: number) => setStepGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, steps: [...g.steps, ''] } : g)));
    const updateStep = (gi: number, si: number, value: string) =>
        setStepGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, steps: g.steps.map((s, j) => (j === si ? value : s)) } : g)));
    const removeStep = (gi: number, si: number) =>
        setStepGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, steps: g.steps.filter((_, j) => j !== si) } : g)));

    // ── 노트 / 구매링크 ─────────────────────────────────────
    const addNote = () => setNotes((prev) => [...prev, '']);
    const updateNote = (i: number, value: string) => setNotes((prev) => prev.map((n, j) => (j === i ? value : n)));
    const removeNote = (i: number) => setNotes((prev) => prev.filter((_, j) => j !== i));

    const addLink = () => setPurchaseLinks((prev) => [...prev, { item: '', url: '' }]);
    const updateLink = (i: number, patch: Partial<PurchaseLink>) =>
        setPurchaseLinks((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));
    const removeLink = (i: number) => setPurchaseLinks((prev) => prev.filter((_, j) => j !== i));

    const addTag = () => {
        const t = tagDraft.trim();
        if (t && !extraTags.includes(t) && t !== '추천') setExtraTags((prev) => [...prev, t]);
        setTagDraft('');
    };
    const removeTag = (t: string) => setExtraTags((prev) => prev.filter((x) => x !== t));

    const buildPayload = () => {
        const cleanGroups = groups
            .map((g) => {
                const cols = (g.columns ?? []).map((c) => c.trim()).filter(Boolean);
                const hasCols = cols.length > 0;
                const ingredients = g.ingredients
                    .filter((ing) => ing.name.trim())
                    .map((ing) => {
                        const base: Record<string, unknown> = { name: ing.name.trim() };
                        if (hasCols) {
                            const amounts = cols.map((_, ci) => (ing.amounts?.[ci] ?? '').trim());
                            base.amounts = amounts;
                        } else if (ing.amount?.trim()) {
                            base.amount = ing.amount.trim();
                        }
                        if (ing.note?.trim()) base.note = ing.note.trim();
                        return base;
                    });
                const out: Record<string, unknown> = { ingredients };
                if (g.title?.trim()) out.title = g.title.trim();
                if (hasCols) out.columns = cols;
                return out;
            })
            .filter((g) => (g.ingredients as unknown[]).length > 0);

        const cleanStepGroups = stepGroups
            .map((g) => {
                const steps = g.steps.map((s) => s.trim()).filter(Boolean);
                const out: Record<string, unknown> = { steps };
                if (g.title?.trim()) out.title = g.title.trim();
                return out;
            })
            .filter((g) => (g.steps as unknown[]).length > 0);

        const tags = [...extraTags, ...(isFeatured ? ['추천'] : [])];
        const hardnessNum = hardnessText.trim() ? Number.parseInt(hardnessText.trim(), 10) : null;

        return {
            id: recipeId,
            title: title.trim(),
            category,
            description: null as string | null,
            hardness: Number.isFinite(hardnessNum as number) ? hardnessNum : null,
            tags,
            ingredient_groups: cleanGroups,
            step_groups: cleanStepGroups,
            notes: notes.map((n) => n.trim()).filter(Boolean),
            images: images.filter((img) => img.src).map((img) => (img.caption?.trim() ? { src: img.src, caption: img.caption.trim() } : { src: img.src })),
            instruction_images: instructionImages
                .filter((img) => img.src)
                .map((img) => (img.caption?.trim() ? { src: img.src, caption: img.caption.trim() } : { src: img.src })),
            purchase_links: purchaseLinks.filter((l) => l.item.trim() && l.url.trim()).map((l) => ({ item: l.item.trim(), url: l.url.trim() })),
            image_color: existingRecipe?.imageColor ?? '#FFE5DA',
            created_by: user?.id,
        };
    };

    const handleSave = async () => {
        if (!title.trim()) {
            notify('입력 필요', '레시피 제목을 입력해 주세요.');
            return;
        }
        if (!isSupabaseConfigured) {
            notify('Supabase 설정 필요', 'Supabase 연결이 필요합니다. .env에 EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY를 추가해 주세요.');
            return;
        }
        setSaving(true);
        try {
            const payload = buildPayload();
            const upsertPayload: Record<string, unknown> = { ...payload };
            if (!isEditing) upsertPayload.sort_order = 9999; // 신규는 목록 끝에 추가
            const { error } = await supabase.from('recipes').upsert(upsertPayload);
            if (error) throw error;
            notify('완료', `레시피를 ${isEditing ? '수정' : '생성'}했습니다.`);
            router.back();
        } catch (e: unknown) {
            notify('오류', e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
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

    const inputStyle = [styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }];

    const renderImageSection = (field: ImageField, label: string, list: RecipeImage[]) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>{label}</Text>
                <TouchableOpacity onPress={() => pickAndUpload(field)} disabled={uploading}>
                    <Ionicons name="cloud-upload-outline" size={24} color={uploading ? theme.icon : theme.tint} />
                </TouchableOpacity>
            </View>
            <View style={styles.imageGrid}>
                {list.map((img, i) => (
                    <View key={i} style={[styles.imageThumbWrap, { borderColor: theme.border }]}>
                        <Image source={{ uri: resolveImageSrc(img.src) }} style={styles.imageThumb} resizeMode="cover" />
                        <TouchableOpacity style={styles.imageRemove} onPress={() => removeImage(field, i)}>
                            <Ionicons name="close-circle" size={22} color="#EF4444" />
                        </TouchableOpacity>
                        <TextInput
                            style={[styles.captionInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                            placeholder="설명(선택)"
                            placeholderTextColor={theme.icon}
                            value={img.caption ?? ''}
                            onChangeText={(t) => setImageCaption(field, i, t)}
                        />
                    </View>
                ))}
                {list.length === 0 ? <Text style={[styles.hint, { color: theme.icon }]}>업로드 아이콘을 눌러 이미지를 추가하세요.</Text> : null}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    title: isEditing ? '레시피 편집' : '새 레시피',
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={saving}
                            style={{ marginRight: 10, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.cardBackground }}
                        >
                            <Text style={{ color: theme.tint, fontWeight: '700', fontSize: 14 }}>{saving ? '저장 중…' : '저장'}</Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {!isSupabaseConfigured ? (
                    <View style={[styles.warnBanner, { borderColor: theme.border }]}>
                        <Ionicons name="alert-circle" size={18} color="#F59E0B" />
                        <Text style={[styles.warnText, { color: theme.text }]}>미리보기 모드: Supabase 미설정 상태라 저장/업로드는 되지 않습니다.</Text>
                    </View>
                ) : null}

                {/* 기본 정보 */}
                <View style={[styles.panel, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <Text style={[styles.label, { color: theme.text }]}>제목</Text>
                    <TextInput style={inputStyle} value={title} onChangeText={setTitle} placeholder="예) 솔티크래커" placeholderTextColor={theme.icon} />

                    <Text style={[styles.label, { color: theme.text }]}>카테고리</Text>
                    <View style={styles.segmentRow}>
                        {CATEGORIES.map((c) => (
                            <TouchableOpacity
                                key={c.id}
                                onPress={() => setCategory(c.id)}
                                style={[
                                    styles.segment,
                                    { borderColor: theme.border, backgroundColor: category === c.id ? theme.tint : theme.background },
                                ]}
                            >
                                <Text style={{ color: category === c.id ? '#FFFFFF' : theme.icon, fontWeight: '600', fontSize: 13 }}>{c.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { color: theme.text }]}>머신 경도값 (선택)</Text>
                    <TextInput
                        style={[...inputStyle, { width: 120 }]}
                        value={hardnessText}
                        onChangeText={setHardnessText}
                        placeholder="예) 26"
                        placeholderTextColor={theme.icon}
                        keyboardType="number-pad"
                    />

                    <TouchableOpacity style={styles.featuredRow} onPress={() => setIsFeatured((v) => !v)}>
                        <Ionicons name={isFeatured ? 'checkbox' : 'square-outline'} size={22} color={isFeatured ? theme.tint : theme.icon} />
                        <Text style={[styles.featuredLabel, { color: theme.text }]}>추천 레시피로 노출</Text>
                    </TouchableOpacity>

                    <Text style={[styles.label, { color: theme.text, marginTop: 16 }]}>태그</Text>
                    <View style={styles.tagRow}>
                        {extraTags.map((t) => (
                            <TouchableOpacity key={t} onPress={() => removeTag(t)} style={[styles.tagChip, { borderColor: theme.border, backgroundColor: theme.background }]}>
                                <Text style={{ color: theme.text, fontSize: 13 }}>{t}</Text>
                                <Ionicons name="close" size={14} color={theme.icon} />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.row}>
                        <TextInput
                            style={[...inputStyle, { flex: 1, marginRight: 8 }]}
                            value={tagDraft}
                            onChangeText={setTagDraft}
                            placeholder="예) 믹서, 여름"
                            placeholderTextColor={theme.icon}
                            onSubmitEditing={addTag}
                            returnKeyType="done"
                        />
                        <TouchableOpacity onPress={addTag}>
                            <Ionicons name="add-circle" size={26} color={theme.tint} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 배합 그룹 */}
                <View style={[styles.panel, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.panelTitle, { color: theme.text }]}>배합</Text>
                        <TouchableOpacity onPress={addGroup}>
                            <Text style={{ color: theme.tint, fontWeight: '600' }}>+ 그룹 추가</Text>
                        </TouchableOpacity>
                    </View>

                    {groups.map((group, gi) => {
                        const cols = group.columns ?? [];
                        return (
                            <View key={gi} style={[styles.groupCard, { borderColor: theme.border }]}>
                                <View style={styles.row}>
                                    <TextInput
                                        style={[...inputStyle, { flex: 1, marginRight: 8 }]}
                                        value={group.title ?? ''}
                                        onChangeText={(t) => updateGroup(gi, { title: t })}
                                        placeholder="그룹 이름(선택) 예) 커피시럽"
                                        placeholderTextColor={theme.icon}
                                    />
                                    {groups.length > 1 ? (
                                        <TouchableOpacity onPress={() => removeGroup(gi)}>
                                            <Ionicons name="trash-outline" size={20} color={theme.icon} />
                                        </TouchableOpacity>
                                    ) : null}
                                </View>

                                {/* 배합량 컬럼 (1바트/2바트 등) */}
                                {cols.length > 0 ? (
                                    <View style={styles.colHeaderRow}>
                                        <Text style={[styles.colHeaderSpacer, { color: theme.icon }]}>배합량 열</Text>
                                        {cols.map((c, ci) => (
                                            <View key={ci} style={styles.colHeaderCell}>
                                                <TextInput
                                                    style={[styles.colInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                                    value={c}
                                                    onChangeText={(t) => updateColumn(gi, ci, t)}
                                                    placeholder={`열${ci + 1}`}
                                                    placeholderTextColor={theme.icon}
                                                />
                                                <TouchableOpacity onPress={() => removeColumn(gi, ci)}>
                                                    <Ionicons name="close-circle" size={16} color={theme.icon} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                ) : null}

                                {group.ingredients.map((ing, ii) => (
                                    <View key={ii} style={styles.row}>
                                        <TextInput
                                            style={[styles.input, styles.ingNameInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                            value={ing.name}
                                            onChangeText={(t) => updateIngredientName(gi, ii, t)}
                                            placeholder="재료명"
                                            placeholderTextColor={theme.icon}
                                        />
                                        {cols.length > 0 ? (
                                            cols.map((_, ci) => (
                                                <TextInput
                                                    key={ci}
                                                    style={[styles.input, styles.ingAmtCol, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                                    value={ing.amounts?.[ci] ?? ''}
                                                    onChangeText={(t) => updateIngredientAmount(gi, ii, t, ci)}
                                                    placeholder="양"
                                                    placeholderTextColor={theme.icon}
                                                />
                                            ))
                                        ) : (
                                            <TextInput
                                                style={[styles.input, styles.ingAmtSingle, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                                value={ing.amount ?? ''}
                                                onChangeText={(t) => updateIngredientAmount(gi, ii, t)}
                                                placeholder="양"
                                                placeholderTextColor={theme.icon}
                                            />
                                        )}
                                        <TouchableOpacity onPress={() => removeIngredient(gi, ii)}>
                                            <Ionicons name="trash-outline" size={18} color={theme.icon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                <View style={styles.groupActions}>
                                    <TouchableOpacity onPress={() => addIngredient(gi)}>
                                        <Text style={{ color: theme.tint, fontSize: 13, fontWeight: '600' }}>+ 재료</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => addColumn(gi)}>
                                        <Text style={{ color: theme.tint, fontSize: 13, fontWeight: '600' }}>+ 배합량 열</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* 만드는 순서 */}
                <View style={[styles.panel, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.panelTitle, { color: theme.text }]}>만드는 순서</Text>
                        <TouchableOpacity onPress={addStepGroup}>
                            <Text style={{ color: theme.tint, fontWeight: '600' }}>+ 그룹 추가</Text>
                        </TouchableOpacity>
                    </View>

                    {stepGroups.map((group, gi) => (
                        <View key={gi} style={[styles.groupCard, { borderColor: theme.border }]}>
                            <View style={styles.row}>
                                <TextInput
                                    style={[...inputStyle, { flex: 1, marginRight: 8 }]}
                                    value={group.title ?? ''}
                                    onChangeText={(t) => updateStepGroupTitle(gi, t)}
                                    placeholder="묶음 이름(선택) 예) 시럽 만들기"
                                    placeholderTextColor={theme.icon}
                                />
                                {stepGroups.length > 1 ? (
                                    <TouchableOpacity onPress={() => removeStepGroup(gi)}>
                                        <Ionicons name="trash-outline" size={20} color={theme.icon} />
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                            {group.steps.map((step, si) => (
                                <View key={si} style={styles.row}>
                                    <Text style={[styles.stepIndex, { color: theme.icon }]}>{si + 1}.</Text>
                                    <TextInput
                                        style={[styles.input, styles.stepInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                        value={step}
                                        onChangeText={(t) => updateStep(gi, si, t)}
                                        placeholder="작업 내용"
                                        placeholderTextColor={theme.icon}
                                        multiline
                                    />
                                    <TouchableOpacity onPress={() => removeStep(gi, si)}>
                                        <Ionicons name="trash-outline" size={18} color={theme.icon} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity onPress={() => addStep(gi)}>
                                <Text style={{ color: theme.tint, fontSize: 13, fontWeight: '600' }}>+ 순서</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* 참고 사항 */}
                <View style={[styles.panel, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.panelTitle, { color: theme.text }]}>참고 사항</Text>
                        <TouchableOpacity onPress={addNote}>
                            <Ionicons name="add-circle" size={24} color={theme.tint} />
                        </TouchableOpacity>
                    </View>
                    {notes.map((note, i) => (
                        <View key={i} style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.stepInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                value={note}
                                onChangeText={(t) => updateNote(i, t)}
                                placeholder="주의/참고 문구 (앞에 ‼ 또는 ※ 를 붙이면 강조 표시)"
                                placeholderTextColor={theme.icon}
                                multiline
                            />
                            <TouchableOpacity onPress={() => removeNote(i)}>
                                <Ionicons name="trash-outline" size={18} color={theme.icon} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {notes.length === 0 ? <Text style={[styles.hint, { color: theme.icon }]}>필요 시 + 버튼으로 추가하세요.</Text> : null}
                </View>

                {/* 이미지 */}
                <View style={[styles.panel, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    {renderImageSection('images', '재료 구매 참고 사진', images)}
                    {renderImageSection('instructionImages', '만드는 순서 작업 사진', instructionImages)}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>구매 링크</Text>
                        <TouchableOpacity onPress={addLink}>
                            <Ionicons name="add-circle" size={24} color={theme.tint} />
                        </TouchableOpacity>
                    </View>
                    {purchaseLinks.map((link, i) => (
                        <View key={i} style={styles.row}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 8, color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                value={link.item}
                                onChangeText={(t) => updateLink(i, { item: t })}
                                placeholder="이름"
                                placeholderTextColor={theme.icon}
                            />
                            <TextInput
                                style={[styles.input, { flex: 2, marginRight: 8, color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                value={link.url}
                                onChangeText={(t) => updateLink(i, { url: t })}
                                placeholder="https://"
                                placeholderTextColor={theme.icon}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => removeLink(i)}>
                                <Ionicons name="trash-outline" size={18} color={theme.icon} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    guardRoot: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1 },
    content: { padding: 20, gap: 16 },
    warnBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 14, padding: 12 },
    warnText: { fontSize: 13, flex: 1 },
    panel: { borderWidth: 1, borderRadius: 20, padding: 18 },
    panelTitle: { fontSize: 18, fontWeight: '700' },
    section: { marginBottom: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    label: { fontSize: 15, fontWeight: '600', marginBottom: 8, marginTop: 4 },
    input: { padding: 12, borderRadius: 12, borderWidth: 1, fontSize: 15, marginBottom: 8 },
    segmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    segment: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1 },
    featuredRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
    featuredLabel: { fontSize: 14, fontWeight: '600' },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    tagChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    groupCard: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 12 },
    groupActions: { flexDirection: 'row', gap: 18, marginTop: 4 },
    colHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
    colHeaderSpacer: { flex: 1, fontSize: 12 },
    colHeaderCell: { flexDirection: 'row', alignItems: 'center', width: 92, gap: 2 },
    colInput: { flex: 1, padding: 8, borderRadius: 8, borderWidth: 1, fontSize: 12 },
    ingNameInput: { flex: 1, marginRight: 8 },
    ingAmtSingle: { width: 96, marginRight: 8, textAlign: 'right' },
    ingAmtCol: { width: 84, marginRight: 6, textAlign: 'right' },
    stepIndex: { marginRight: 8, width: 22 },
    stepInput: { flex: 1, marginRight: 8, minHeight: 48 },
    hint: { fontSize: 13, paddingVertical: 4 },
    imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    imageThumbWrap: { width: 130, borderWidth: 1, borderRadius: 12, padding: 6, gap: 6 },
    imageThumb: { width: '100%', height: 100, borderRadius: 8, backgroundColor: '#F1F5F9' },
    imageRemove: { position: 'absolute', top: 2, right: 2, backgroundColor: '#FFFFFF', borderRadius: 999 },
    captionInput: { padding: 6, borderRadius: 8, borderWidth: 1, fontSize: 12 },
});
