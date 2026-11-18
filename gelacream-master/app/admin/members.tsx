import { useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { type MembershipRequest, reviewMembership, useMembershipRequests } from '../../lib/membership';

export default function MembersScreen() {
    const { isAdmin } = useAuth();
    const theme = Colors[useColorScheme() ?? 'light'];
    const { requests, isLoading, error, refresh } = useMembershipRequests(isAdmin);
    const [tab, setTab] = useState<'pending' | 'history'>('pending');
    const [selection, setSelection] = useState<{ request: MembershipRequest; decision: 'approved' | 'rejected' } | null>(null);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState('');
    if (!isAdmin) return <Redirect href="/" />;
    const pending = requests.filter(r => r.approval_status === 'pending');
    const visible = tab === 'pending' ? pending : requests.filter(r => r.approval_status !== 'pending');
    const submit = async () => {
        if (!selection || busy) return;
        setBusy(true); setNotice('');
        try {
            const changed = await reviewMembership(selection.request.id, selection.decision);
            setNotice(changed ? (selection.decision === 'approved' ? '승인했습니다. 이제 레시피를 이용할 수 있습니다.' : '가입 신청을 거절했습니다.')
                : '다른 관리자가 이미 처리한 신청입니다. 최신 내역을 확인해 주세요.');
            setSelection(null);
            await refresh();
        } catch { setNotice('처리하지 못했습니다. 새로고침 후 다시 시도해 주세요.'); }
        finally { setBusy(false); }
    };
    return <>
        <Stack.Screen options={{ title: '회원 가입 승인', headerBackTitle: '뒤로' }} />
        <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.page}>
            <View style={styles.heading}>
                <Text style={[styles.title, { color: theme.text }]}>회원 가입 승인</Text>
                <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => { void refresh(); }} style={[styles.button, { borderColor: theme.border }]}><Text style={{ color: theme.tint }}>새로고침</Text></TouchableOpacity>
            </View>
            <Text style={[styles.body, { color: theme.icon }]}>이메일 인증을 마친 신청입니다. 관리자 한 명이 승인하면 바로 이용할 수 있습니다.</Text>
            <View style={styles.actions}>{(['pending', 'history'] as const).map(value =>
                <TouchableOpacity key={value} accessibilityRole="button" accessibilityState={{ selected: tab === value }} onPress={() => { setTab(value); setSelection(null); }} disabled={busy}
                    style={[styles.button, { borderColor: theme.border, backgroundColor: tab === value ? theme.tint : theme.cardBackground }]}>
                    <Text style={{ color: tab === value ? '#fff' : theme.text }}>{value === 'pending' ? `승인 대기 ${pending.length}건` : '처리 내역'}</Text>
                </TouchableOpacity>)}</View>
            {!!(notice || error) && <Text accessibilityRole="alert" style={[styles.message, { color: error ? '#B42318' : theme.tint }]}>{notice || error}</Text>}
            {isLoading ? <ActivityIndicator color={theme.tint} /> : visible.length === 0 ?
                <Text style={[styles.empty, { color: theme.icon }]}>{error ? '목록을 불러오지 못했습니다.' : tab === 'pending' ? '승인 대기 중인 신청이 없습니다.' : '처리 내역이 없습니다.'}</Text> : visible.map(request =>
                <View key={request.id} style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <Text style={[styles.name, { color: theme.text }]}>{request.full_name || '이름 미입력'}</Text>
                    <Text selectable style={[styles.body, { color: theme.text }]}>{request.email}</Text>
                    <Text style={[styles.body, { color: theme.icon }]}>신청: {new Date(request.requested_at).toLocaleString('ko-KR')}</Text>
                    {request.approval_status === 'pending' ? selection?.request.id === request.id ? <View style={styles.confirm}>
                        <Text style={[styles.body, { color: theme.text }]}>{request.full_name || request.email}님의 가입을 {selection.decision === 'approved' ? '승인' : '거절'}하시겠습니까?</Text>
                        <View style={styles.actions}>
                            <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={submit} style={[styles.button, { borderColor: theme.tint, backgroundColor: theme.tint }]}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.white}>확정</Text>}</TouchableOpacity>
                            <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => setSelection(null)} style={[styles.button, { borderColor: theme.border }]}><Text style={{ color: theme.text }}>취소</Text></TouchableOpacity>
                        </View>
                    </View> : <View style={styles.actions}>
                        <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => setSelection({ request, decision: 'approved' })} style={[styles.button, { backgroundColor: theme.tint, borderColor: theme.tint }]}><Text style={styles.white}>승인</Text></TouchableOpacity>
                        <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => setSelection({ request, decision: 'rejected' })} style={[styles.button, { borderColor: theme.border }]}><Text style={{ color: '#B42318' }}>거절</Text></TouchableOpacity>
                    </View> : <Text style={[styles.body, { color: theme.icon }]}>{request.approval_status === 'approved' ? '승인' : '거절'} · {request.reviewer_name || '관리자'} · {request.reviewed_at ? new Date(request.reviewed_at).toLocaleString('ko-KR') : ''}</Text>}
                </View>)}
        </ScrollView>
    </>;
}
const styles = StyleSheet.create({
    page: { padding: 24, gap: 18, width: '100%', maxWidth: 900, alignSelf: 'center' },
    heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
    title: { fontSize: 26, fontWeight: '700' }, name: { fontSize: 20, fontWeight: '700' },
    body: { fontSize: 15, lineHeight: 23 }, actions: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
    card: { borderWidth: 1, borderRadius: 18, padding: 22, gap: 12 },
    button: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, borderWidth: 1, minWidth: 80, alignItems: 'center' },
    white: { color: '#fff', fontWeight: '700' }, message: { fontSize: 15, lineHeight: 24 },
    empty: { paddingVertical: 45, textAlign: 'center', fontSize: 16 }, confirm: { gap: 12 },
});
