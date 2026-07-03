import { useState } from 'react';
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
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [busy, setBusy] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);
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

    const handleReset = async () => {
        setFormError(null);

        if (!email.trim()) {
            setFormError('이메일을 입력해 주세요.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setFormError('올바른 이메일 형식을 입력해 주세요. (예: you@example.com)');
            return;
        }

        if (!isSupabaseConfigured) {
            setFormError('Supabase 설정이 되어 있지 않습니다. .env에 Supabase 정보를 먼저 넣어주세요.');
            return;
        }

        setBusy(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
            if (error) {
                setFormError(error.message || '비밀번호 재설정 요청 중 오류가 발생했습니다.');
                return;
            }
            setSent(true);
            showNotice('이메일 전송 완료', '비밀번호 재설정 링크를 이메일로 보냈습니다. 이메일을 확인해 주세요.');
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
                        <Text style={[styles.title, { color: theme.text }]}>비밀번호 재설정</Text>
                        <Text style={[styles.subtitle, { color: theme.icon }]}>
                            가입 시 사용한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>이메일</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                                placeholder="you@example.com"
                                placeholderTextColor={theme.icon}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!sent}
                            />
                        </View>

                        {formError ? (
                            <View style={[styles.errorBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                <Text style={[styles.errorText, { color: '#DC2626' }]}>{formError}</Text>
                            </View>
                        ) : null}

                        {sent ? (
                            <View style={[styles.successBox, { backgroundColor: theme.background, borderColor: theme.tint }]}>
                                <Text style={[styles.successText, { color: theme.tint }]}>
                                    ✉️ 비밀번호 재설정 링크를 이메일로 보냈습니다. 이메일을 확인해 주세요.
                                </Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.tint, opacity: busy || sent ? 0.7 : 1 }]}
                            onPress={handleReset}
                            disabled={busy || sent}
                        >
                            {busy ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{sent ? '전송 완료' : '재설정 링크 보내기'}</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.background }]}
                            onPress={() => router.replace('/login')}
                            disabled={busy}
                        >
                            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>로그인 화면으로 돌아가기</Text>
                        </TouchableOpacity>
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
    successBox: {
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
    errorText: {
        fontSize: 14,
        fontWeight: '600',
    },
    successText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
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
});
