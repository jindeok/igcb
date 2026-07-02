#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// supabase/seed_recipes.json 을 secret 키로 recipes 테이블에 upsert.
// ⚠️ 전제: 마이그레이션(20260702000000_recipes_and_storage.sql)이 이미 적용되어
//    신규 컬럼(ingredient_groups 등)이 존재해야 함. secret 키는 RLS 를 우회한다.
//
// 실행:
//   SUPABASE_URL="https://<ref>.supabase.co" \
//   SUPABASE_SERVICE_ROLE_KEY="sb_secret_..." \
//   node scripts/seed_recipes_via_api.mjs
// ─────────────────────────────────────────────────────────────
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { createClient } = require(resolve(__dirname, '../gelacream-master/node_modules/@supabase/supabase-js'));

const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
    console.error('SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 설정하세요.');
    process.exit(1);
}

const rows = JSON.parse(readFileSync(resolve(__dirname, '../gelacream-master/supabase/seed_recipes.json'), 'utf8'));
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

let done = 0;
const CHUNK = 50;
for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from('recipes').upsert(chunk, { onConflict: 'id' });
    if (error) {
        console.error(`업서트 실패 (행 ${i}~): ${error.message}`);
        process.exit(1);
    }
    done += chunk.length;
    console.log(`  ${done}/${rows.length}`);
}
console.log(`완료: ${done}개 레시피 시드`);
