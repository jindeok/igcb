import { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

export default function ApprovalPendingScreen() {
    const { user, refreshUser, logout } = useAuth();
    const theme = Colors[useColorScheme() ?? 'light'];
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState('');
    const rejected = user?.approvalStatus === 'rejected';
    const check = async () => {
        setBusy(true); setNotice('');
        try { await refreshUser(); setNotice('아직 승인 대기 중입니다. 승인되면 자동으로 이동합니다.'); }
        catch { setNotice('상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.'); }
        finally { setBusy(false); }
    };
    return <SafeAreaView style={[styles.page, { backgroundColor: theme.background }]}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.brand, { color: theme.icon }]}>ICE GIRL CREAM BOY</Text>
            <Ionicons name={rejected ? 'close-circle-outline' : 'time-outline'} size={54} color={theme.tint} />
            <Text style={[styles.title, { color: theme.text }]}>{rejected ? '가입 신청이 승인되지 않았습니다' : '관리자 승인 대기 중입니다'}</Text>
            <Text style={[styles.body, { color: theme.icon }]}>{user?.email}</Text>
            <Text style={[styles.body, { color: theme.text }]}>{rejected
                ? '가입 신청에 대한 문의는 관리자에게 연락해 주세요.'
                : '이메일 인증이 완료되었습니다.\n관리자 중 한 명이 승인하면 레시피를 이용할 수 있습니다.\n승인 상태는 자동으로 확인합니다.'}</Text>
            {!rejected && <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={check} style={[styles.button, { backgroundColor: theme.tint }]}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.white}>승인 상태 확인</Text>}
            </TouchableOpacity>}
            {!!notice && <Text accessibilityRole="alert" style={[styles.body, { color: theme.icon }]}>{notice}</Text>}
            <Text style={[styles.body, { color: theme.icon }]}>문의: joannadaye@naver.com</Text>
            <TouchableOpacity accessibilityRole="button" onPress={() => logout()} style={styles.button}><Text style={{ color: theme.tint }}>로그아웃</Text></TouchableOpacity>
        </View>
    </SafeAreaView>;
}
const styles = StyleSheet.create({
    page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    card: { width: '100%', maxWidth: 540, borderWidth: 1, borderRadius: 24, padding: 32, alignItems: 'center', gap: 22 },
    brand: { fontSize: 12, letterSpacing: 2, fontWeight: '700' },
    title: { fontSize: 23, fontWeight: '700', textAlign: 'center' },
    body: { fontSize: 15, lineHeight: 25, textAlign: 'center' },
    button: { width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },
    white: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
