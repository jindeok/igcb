import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface MembershipRequest {
    id: string;
    full_name: string;
    email: string;
    requested_at: string;
    approval_status: 'pending' | 'approved' | 'rejected';
    reviewed_at: string | null;
    reviewer_name: string | null;
}

export function useMembershipRequests(enabled: boolean) {
    const [requests, setRequests] = useState<MembershipRequest[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(enabled);
    const refresh = useCallback(async () => {
        if (!enabled) return;
        try {
            const { data, error: rpcError } = await supabase.rpc('list_membership_requests');
            if (rpcError) throw rpcError;
            setRequests(data ?? []);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : '가입 신청을 불러오지 못했습니다. 다시 시도해 주세요.');
        } finally { setIsLoading(false); }
    }, [enabled]);
    useEffect(() => {
        if (!enabled) { setRequests([]); setIsLoading(false); return; }
        void refresh();
        const timer = setInterval(() => { void refresh(); }, 30_000);
        return () => clearInterval(timer);
    }, [enabled, refresh]);
    return { requests, error, isLoading, refresh };
}

export async function reviewMembership(applicant: string, decision: 'approved' | 'rejected') {
    const { data, error } = await supabase.rpc('review_membership_request', { applicant, decision });
    if (error) throw error;
    return data === true;
}
