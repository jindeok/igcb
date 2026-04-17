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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

function leaveLoginScreen(router: ReturnType<typeof useRouter>) {
    if (router.canDismiss()) {
        router.dismiss();
    } else {
        router.replace('/');
    }
}

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const { login, isLoading, user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        if (user) {
            leaveLoginScreen(router);
        }
    }, [user, router]);

    const handleLogin = async () => {
        setFormError(null);
        if (!email.trim() || !password) {
            setFormError('이메일과 비밀번호를 입력해 주세요.');
            return;
        }
        setBusy(true);
        try {
            await login(email, password);
            leaveLoginScreen(router);
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
                            <Text style={[styles.brandPillText, { color: theme.icon }]}>(주)로미요</Text>
                        </View>
                        <Text style={[styles.brandTitle, { color: theme.text }]}>ICE GIRL CREAM BOY</Text>
                        <Text style={[styles.subtitle, { color: theme.icon }]}>
                            아이스걸 크림보이 메뉴와 레시피 관리 시스템입니다.
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                                placeholder="staff@gelacream.com"
                                placeholderTextColor={theme.icon}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                                placeholder="비밀번호를 입력하세요"
                                placeholderTextColor={theme.icon}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        {formError ? (
                            <View style={[styles.errorBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                <Text style={[styles.errorText, { color: '#DC2626' }]}>{formError}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.tint, opacity: busy || isLoading ? 0.7 : 1 }]}
                            onPress={handleLogin}
                            disabled={busy || isLoading}
                        >
                            {busy || isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>로그인</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.background }]}
                            onPress={() => router.push('/signup')}
                            disabled={busy || isLoading}
                        >
                            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>회원가입</Text>
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <Text style={[styles.helperText, { color: theme.icon }]}>
                                 
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
    brandTitle: {
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
