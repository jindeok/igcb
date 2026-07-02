import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// 우선순위: 빌드 시 주입되는 EXPO_PUBLIC_* (로컬 .env / Netlify env) → app.json 의 extra(공개 설정).
// publishable(anon) 키는 클라이언트 공개용이므로 app.json 에 두어도 안전하며, 데이터는 RLS 로 보호됩니다.
const extra = (Constants.expoConfig?.extra ?? {}) as { supabaseUrl?: string; supabaseAnonKey?: string };
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const RECIPE_IMAGE_BUCKET = 'recipe-images';

/**
 * 이미지 src 를 실제 로드 가능한 URL 로 변환.
 * - http(s):// → 그대로 (외부 링크)
 * - /recipe-images/... → 정적 번들 파일 (Supabase 미설정 시 MockData 폴백)
 * - 그 외(예: "m17-1.png") → Supabase Storage 공개 URL
 */
export function resolveImageSrc(src: string): string {
    if (!src) return src;
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
        return src;
    }
    if (src.startsWith('/')) {
        return src;
    }
    if (isSupabaseConfigured) {
        return supabase.storage.from(RECIPE_IMAGE_BUCKET).getPublicUrl(src).data.publicUrl;
    }
    // Supabase 미설정 + Storage 경로만 있는 경우: 번들 정적 파일로 폴백
    return `/recipe-images/${src}`;
}

if (!isSupabaseConfigured && typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(
        '[gelacream] Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to a .env file at the project root.',
    );
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    },
);
