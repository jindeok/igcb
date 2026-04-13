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
            setUser(null);
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
            throw new Error(
                'Supabase가 설정되지 않았습니다. 프로젝트 루트에 .env를 만들고 EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY를 넣어 주세요.',
            );
        }
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });
        if (error) {
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
