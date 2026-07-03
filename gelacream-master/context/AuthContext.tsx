import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'staff';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAdmin: false,
    login: async () => {},
    logout: async () => {},
});

// Supabase 미설정 상태의 로컬 개발 프리뷰용 계정 (프로덕션 번들에서는 활성화되지 않음).
// 관리자 화면까지 로컬에서 확인할 수 있도록 admin 으로 둔다. Supabase 연동 시에는
// 실제 profiles.role 을 따르므로 배포 환경에는 영향이 없다.
const isDevPreview = !isSupabaseConfigured && typeof __DEV__ !== 'undefined' && __DEV__;
const PREVIEW_USER: User = {
    id: 'local-preview',
    email: 'preview@local.dev',
    name: '로컬 미리보기',
    role: 'admin',
};

async function userFromSession(session: Session): Promise<User> {
    const u = session.user;
    const email = u.email ?? '';

    const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', u.id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    const role: UserRole = data?.role === 'admin' ? 'admin' : 'staff';
    const name =
        (data?.full_name && String(data.full_name).trim()) ||
        email.split('@')[0] ||
        'User';

    return { id: u.id, email, name, role };
}

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setUser(isDevPreview ? PREVIEW_USER : null);
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        const applySession = async (session: Session | null) => {
            if (cancelled) return;
            if (!session?.user) {
                setUser(null);
                return;
            }
            try {
                const next = await userFromSession(session);
                if (!cancelled) setUser(next);
            } catch {
                if (!cancelled) setUser(null);
            }
        };

        const init = async () => {
            const { data } = await supabase.auth.getSession();
            await applySession(data.session ?? null);
            if (!cancelled) setIsLoading(false);
        };

        void init();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            void (async () => {
                await applySession(session);
                if (!cancelled) setIsLoading(false);
            })();
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        if (!isSupabaseConfigured) {
            if (isDevPreview) {
                setUser(PREVIEW_USER);
                return;
            }
            throw new Error(
                'Supabase가 설정되지 않았습니다. 프로젝트 루트에 .env를 만들고 EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY를 넣어 주세요.',
            );
        }
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });
        if (error) {
            const raw = (error.message || '').toLowerCase();
            if (raw.includes('email not confirmed') || raw.includes('email_not_confirmed')) {
                throw new Error('이메일 인증이 완료되지 않았습니다. 가입한 이메일에서 인증 링크를 먼저 눌러주세요.');
            }
            if (raw.includes('invalid login credentials')) {
                throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
            }
            throw new Error(error.message);
        }
        if (data.session) {
            setUser(await userFromSession(data.session));
        }
    };

    const logout = async () => {
        if (!isSupabaseConfigured) {
            setUser(null);
            return;
        }
        await supabase.auth.signOut();
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, isLoading, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
