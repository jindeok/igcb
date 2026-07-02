#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Supabase Postgres 에 SQL 파일들을 순서대로 실행한다(DDL 포함).
// publishable/secret 키로는 DDL 이 안 되므로, DB 연결 문자열(비밀번호 포함)이 필요하다.
//
// 연결 문자열: Supabase 대시보드 → Project Settings → Database → Connection string → URI
//   예) postgresql://postgres.<ref>:<password>@aws-0-...pooler.supabase.com:5432/postgres
//
// 실행:
//   DATABASE_URL="postgresql://...:...@...:5432/postgres" \
//   node scripts/run_sql.mjs \
//     gelacream-master/supabase/migrations/20250413000000_profiles_and_rls.sql \
//     gelacream-master/supabase/migrations/20260702000000_recipes_and_storage.sql \
//     gelacream-master/supabase/seed_recipes.sql
//
// ⚠️ 연결 문자열은 절대 커밋하지 말 것. 작업 후 비밀번호 rotate 권장.
// ─────────────────────────────────────────────────────────────
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { Client } = require(resolve(__dirname, '../node_modules/pg'));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL 환경변수(Postgres 연결 문자열)를 설정하세요.');
    process.exit(1);
}
const files = process.argv.slice(2);
if (files.length === 0) {
    console.error('실행할 .sql 파일 경로를 인자로 넘기세요.');
    process.exit(1);
}

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();
console.log('DB 연결 성공.');

let failed = false;
for (const file of files) {
    const abs = resolve(process.cwd(), file);
    const sql = readFileSync(abs, 'utf8');
    process.stdout.write(`▶ 실행: ${file} … `);
    try {
        await client.query(sql);
        console.log('완료');
    } catch (e) {
        failed = true;
        console.log('실패');
        console.error(`   ${e.message}`);
        break;
    }
}

await client.end();
process.exit(failed ? 1 : 0);
