import { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Pressable,
    useColorScheme,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import * as Linking from 'expo-linking';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

function leaveSignupScreen(router: ReturnType<typeof useRouter>) {
    if (router.canDismiss()) {
        router.dismiss();
    } else {
        router.replace('/login');
    }
}

export default function SignupScreen() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [agreedToCopyrightTerms, setAgreedToCopyrightTerms] = useState(false);
    const [busy, setBusy] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successEmail, setSuccessEmail] = useState<string | null>(null);
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const showNotice = (title: string, message: string, onConfirm?: () => void) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
            onConfirm?.();
            return;
        }
        Alert.alert(title, message, onConfirm ? [{ text: '확인', onPress: onConfirm }] : [{ text: '확인' }]);
    };

    useEffect(() => {
        if (user) {
            router.replace('/');
        }
    }, [user, router]);

    const handleSignup = async () => {
        setFormError(null);

        if (!id.trim() || !password || !name.trim()) {
            setFormError('아이디, 비밀번호, 사용자 이름을 모두 입력해 주세요.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(id.trim())) {
            setFormError('올바른 이메일 형식을 입력해 주세요. (예: you@example.com)');
            return;
        }

        if (password !== confirmPassword) {
            setFormError('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
            return;
        }

        if (!agreedToCopyrightTerms) {
            setFormError('회원가입을 위해 콘텐츠 유출 손해배상 책임 약관에 동의해 주세요.');
            return;
        }

        if (!isSupabaseConfigured) {
            setFormError('Supabase 설정이 되어 있지 않습니다. .env에 Supabase 정보를 먼저 넣어주세요.');
            return;
        }

        setBusy(true);
        try {
            const redirectUrl = Platform.OS === 'web'
                ? 'https://igcbrcp.netlify.app/'
                : Linking.createURL('/');

            const { data, error } = await supabase.auth.signUp({
                email: id.trim(),
                password,
                options: {
                    data: {
                        full_name: name.trim(),
                    },
                    emailRedirectTo: redirectUrl,
                },
            });

            if (error) {
                const message = error.message || '회원가입 중 오류가 발생했습니다.';
                if (message.toLowerCase().includes('already') || message.toLowerCase().includes('exists')) {
                    setFormError('이미 존재하는 아이디입니다. 다른 아이디를 사용해 주세요.');
                } else {
                    setFormError(message);
                }
                return;
            }

            if (!data.user || !data.session) {
                setSuccessEmail(id.trim());
                return;
            }

            setSuccessEmail(id.trim());
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : '다시 시도해 주세요.';
            setFormError(message);
            if (Platform.OS === 'web') {
                window.alert(`회원가입 실패\n\n${message}`);
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, { backgroundColor: theme.background }]}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={[styles.frame, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <View style={styles.headerContainer}>
                            <View style={[styles.brandPill, { borderColor: theme.border, backgroundColor: theme.background }]}>
                                <Text style={[styles.brandPillText, { color: theme.icon }]}>ICE GIRL CREAM BOY</Text>
                            </View>
                            <Text style={[styles.title, { color: theme.text }]}>계정 만들기</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>아이디 (이메일)</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                                    placeholder="you@example.com"
                                    placeholderTextColor={theme.icon}
                                    value={id}
                                    onChangeText={setId}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>비밀번호</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                                    placeholder="8자 이상 입력해 주세요"
                                    placeholderTextColor={theme.icon}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>비밀번호 확인</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                                    placeholder="비밀번호를 다시 입력해 주세요"
                                    placeholderTextColor={theme.icon}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>사용자 이름 (실명)</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                                    placeholder="예: 홍길동"
                                    placeholderTextColor={theme.icon}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View style={[styles.termsCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                <Text style={[styles.termsTitle, { color: theme.text }]}>무단 도용 및 유포 금지 안내</Text>
                                <Text style={[styles.termsBody, { color: theme.icon }]}>
                                    본 페이지에 게시된 모든 레시피, 사진, 영상 및 편집물에 대한 저작권은 (주)로미요에 있습니다. 저작권법 제103조 및 관련 법률에 따라 보호받고 있으며, 사전 승인 없는 무단 복제, 배포, 상업적 이용 및 제2차 저작물 작성을 금합니다. 이를 위반할 경우 민·형사상의 법적 책임을 물을 수 있습니다.
                                </Text>
                                <TouchableOpacity
                                    style={styles.checkboxRow}
                                    onPress={() => setAgreedToCopyrightTerms((prev) => !prev)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={agreedToCopyrightTerms ? 'checkbox' : 'square-outline'}
                                        size={22}
                                        color={agreedToCopyrightTerms ? theme.tint : theme.icon}
                                    />
                                    <Text style={[styles.checkboxLabel, { color: theme.text }]}>
                                        확인했습니다.
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {formError ? (
                                <View style={[styles.errorBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                    <Text style={[styles.errorText, { color: '#DC2626' }]}>{formError}</Text>
                                </View>
                            ) : null}

                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    { backgroundColor: theme.tint, opacity: busy ? 0.7 : pressed ? 0.85 : 1 },
                                ]}
                                onPress={handleSignup}
                                disabled={busy}
                                hitSlop={8}
                            >
                                {busy ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>회원가입</Text>}
                            </Pressable>

                            <TouchableOpacity
                                style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.background }]}
                                onPress={() => router.replace('/login')}
                                disabled={busy}
                            >
                                <Text style={[styles.secondaryButtonText, { color: theme.text }]}>로그인 화면으로 이동</Text>
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <Text style={[styles.helperText, { color: theme.icon }]}>
                                    가입 후 권한이 필요하면 관리자에게 role 설정을 요청해 주세요.
                                </Text>
                                <Text style={[styles.contactText, { color: theme.icon }]}>문의 mail: joannadaye@naver.com</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* 회원가입 성공 모달 */}
            <Modal
                visible={!!successEmail}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setSuccessEmail(null);
                    leaveSignupScreen(router);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <View style={[styles.modalIconCircle, { backgroundColor: theme.tint + '18' }]}>
                            <Ionicons name="mail-outline" size={40} color={theme.tint} />
                        </View>

                        <Text style={[styles.modalTitle, { color: theme.text }]}>회원가입 신청 완료 🎉</Text>

                        <View style={[styles.modalEmailBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Ionicons name="at-outline" size={18} color={theme.icon} />
                            <Text style={[styles.modalEmailText, { color: theme.text }]} numberOfLines={1}>
                                {successEmail}
                            </Text>
                        </View>

                        <Text style={[styles.modalBody, { color: theme.icon }]}>
                            입력하신 이메일로{' '}
                            <Text style={{ fontWeight: '700', color: theme.text }}>
                                "Confirm Your Signup"
                            </Text>
                            {' '}제목의 인증 메일이 전송되었습니다.{"\n\n"}
                            메일함에서 인증 링크를 클릭하시면 회원가입이 완료됩니다.
                        </Text>

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: theme.tint }]}
                            onPress={() => {
                                setSuccessEmail(null);
                                leaveSignupScreen(router);
                            }}
                        >
                            <Text style={styles.modalButtonText}>확인</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    frame: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 24,
        gap: 28,
        maxWidth: 520,
        width: '100%',
        alignSelf: 'center',
    },
    headerContainer: {
        gap: 14,
    },
    brandPill: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
        alignSelf: 'flex-start',
    },
    brandPillText: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1.2,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
        letterSpacing: -0.8,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 24,
    },
    formContainer: {
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    termsCard: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 10,
    },
    termsTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    termsBody: {
        fontSize: 13,
        lineHeight: 20,
    },
    checkboxRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '600',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        minHeight: 52,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    errorBox: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    button: {
        minHeight: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        gap: 8,
        paddingTop: 8,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '600',
    },
    secondaryButton: {
        minHeight: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    helperText: {
        fontSize: 12,
        lineHeight: 18,
    },
    contactText: {
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalCard: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 28,
        maxWidth: 420,
        width: '100%',
        alignItems: 'center',
        gap: 16,
    },
    modalIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.4,
    },
    modalEmailBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        width: '100%',
    },
    modalEmailText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    modalBody: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
    },
    modalButton: {
        minHeight: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 4,
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

