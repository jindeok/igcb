import { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

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

        if (!isSupabaseConfigured) {
            setFormError('Supabase 설정이 되어 있지 않습니다. .env에 Supabase 정보를 먼저 넣어주세요.');
            return;
        }

        setBusy(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: id.trim(),
                password,
                options: {
                    data: {
                        full_name: name.trim(),
                    },
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

            if (!data.user) {
                Alert.alert('회원가입 완료', '가입이 완료되었습니다. 이메일 인증 후 다시 로그인해 주세요.', [
                    { text: '확인', onPress: () => leaveSignupScreen(router) },
                ]);
                return;
            }

            Alert.alert('회원가입 완료', '가입이 완료되었습니다. 이제 로그인할 수 있습니다.', [
                { text: '로그인 하러가기', onPress: () => leaveSignupScreen(router) },
            ]);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : '다시 시도해 주세요.';
            setFormError(message);
        } finally {
            setBusy(false);
        }
    };

    return (
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
                        <Text style={[styles.title, { color: theme.text }]}>간단한 정보로 계정 만들기</Text>
                        <Text style={[styles.subtitle, { color: theme.icon }]}>
                            꼭 필요한 입력만 남겨서 빠르게 가입하고, 팀 레시피 아카이브에 바로 접근할 수 있도록 구성했습니다.
                        </Text>
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
                            <Text style={[styles.label, { color: theme.text }]}>사용자 이름</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                                placeholder="예: Gelato Master"
                                placeholderTextColor={theme.icon}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {formError ? (
                            <View style={[styles.errorBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                <Text style={[styles.errorText, { color: '#DC2626' }]}>{formError}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.tint, opacity: busy ? 0.7 : 1 }]}
                            onPress={handleSignup}
                            disabled={busy}
                        >
                            {busy ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>회원가입</Text>}
                        </TouchableOpacity>

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
});

