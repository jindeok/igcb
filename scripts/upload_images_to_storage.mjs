#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// public/recipe-images/*  →  Supabase Storage 버킷 'recipe-images' 로 업로드.
//
// 전제: 20260702000000_recipes_and_storage.sql 마이그레이션으로 버킷이 생성돼 있어야 함.
// 이 스크립트는 RLS 를 우회하는 SERVICE ROLE 키로 직접 업로드합니다.
//
// 실행:
//   cd gelacream-master
//   SUPABASE_URL="https://xxxx.supabase.co" \
//   SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
//   node ../scripts/upload_images_to_storage.mjs
//
// ⚠️ service role 키는 절대 클라이언트 번들/깃에 커밋하지 마세요. 셸 변수로만 전달.
// ─────────────────────────────────────────────────────────────
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { dirname, extname, join, resolve } from 'node:path';

const BUCKET = 'recipe-images';
const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = resolve(__dirname, '../gelacream-master/public/recipe-images');

// @supabase/supabase-js 는 앱(gelacream-master)의 node_modules 에 설치돼 있으므로
// 실행 위치와 무관하게 그쪽에서 로드한다.
const require = createRequire(import.meta.url);
const { createClient } = require(resolve(__dirname, '../gelacream-master/node_modules/@supabase/supabase-js'));

const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
    console.error('환경변수 SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 설정하세요.');
    process.exit(1);
}

const CONTENT_TYPES = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
};

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

// 버킷이 없으면 생성(공개). 마이그레이션에서 이미 만들었으면 그대로 사용.
const { data: buckets } = await supabase.storage.listBuckets();
if (!buckets?.some((b) => b.id === BUCKET)) {
    const { error: bucketError } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (bucketError) {
        console.error(`버킷 생성 실패: ${bucketError.message}`);
        process.exit(1);
    }
    console.log(`버킷 '${BUCKET}' 생성 완료(public).`);
}

const files = readdirSync(IMAGES_DIR).filter((name) => extname(name).toLowerCase() in CONTENT_TYPES);
console.log(`${files.length}개 파일 업로드 시작 → ${url} / ${BUCKET}`);

let ok = 0;
let fail = 0;
for (const name of files) {
    const body = readFileSync(join(IMAGES_DIR, name));
    const contentType = CONTENT_TYPES[extname(name).toLowerCase()];
    const { error } = await supabase.storage.from(BUCKET).upload(name, body, {
        contentType,
        upsert: true,
    });
    if (error) {
        fail += 1;
        console.error(`  ✗ ${name}: ${error.message}`);
    } else {
        ok += 1;
    }
}

console.log(`완료: 성공 ${ok}개, 실패 ${fail}개`);
process.exit(fail > 0 ? 1 : 0);
