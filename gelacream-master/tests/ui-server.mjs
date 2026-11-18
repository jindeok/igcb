// Local UI smoke fixture. No real credentials, recipes or remote network calls.
// Build: npx expo export -p web --output-dir dist-ui
// Run: node tests/ui-server.mjs, then open http://127.0.0.1:54329
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
const root = resolve('dist-ui');
const publicConfig = JSON.parse(await readFile(new URL('../app.json', import.meta.url), 'utf8')).expo.extra;
const admin = { id: '10000000-0000-0000-0000-000000000001', email: 'admin@example.test', full_name: '테스트 관리자', role: 'admin', approval_status: 'approved' };
const applicant = { id: '10000000-0000-0000-0000-000000000002', email: 'pending@example.test', full_name: '테스트 가입자', role: 'staff', approval_status: 'pending' };
const existing = { id: '10000000-0000-0000-0000-000000000003', email: 'existing@example.test', full_name: '기존 회원', role: 'staff', approval_status: 'approved' };
const profiles = [admin, applicant, existing];
const requested_at = new Date().toISOString();
let reviewer_name = null;
let reviewed_at = null;
const jwt = id => `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: id, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })).toString('base64url')}.local-test-signature`;
createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1:54329');
    if (['http://127.0.0.1:54329', 'http://localhost:54329'].includes(req.headers.origin)) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    }
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    const json = (data, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
        const bearer = req.headers.authorization?.split(' ')[1];
        let sub;
        try { sub = JSON.parse(Buffer.from(bearer.split('.')[1], 'base64url')).sub; } catch {}
        const current = profiles.find(p => p.id === sub);
        if (url.pathname === '/auth/v1/token') {
            const p = profiles.find(p => p.email === body.email);
            if (!p || body.password !== 'local-test-password') return json({ message: 'Invalid login credentials' }, 400);
            return json({ access_token: jwt(p.id), token_type: 'bearer', expires_in: 3600, refresh_token: `test-${p.id}`, user: { id: p.id, email: p.email, aud: 'authenticated', role: 'authenticated', email_confirmed_at: requested_at, user_metadata: { full_name: p.full_name } } });
        }
        if (url.pathname === '/auth/v1/logout') return json({});
        if (url.pathname === '/rest/v1/profiles') return json(current ? [current] : []);
        if (url.pathname === '/rest/v1/rpc/list_membership_requests') {
            if (current?.role !== 'admin') return json({ message: '관리자만 조회할 수 있습니다.' }, 403);
            return json([{ ...applicant, requested_at, reviewed_at, reviewer_name }]);
        }
        if (url.pathname === '/rest/v1/rpc/review_membership_request') {
            if (current?.role !== 'admin') return json({ message: '관리자만 처리할 수 있습니다.' }, 403);
            if (body.applicant !== applicant.id || applicant.approval_status !== 'pending') return json(false);
            applicant.approval_status = body.decision; reviewed_at = new Date().toISOString(); reviewer_name = current.full_name;
            return json(true);
        }
        if (url.pathname === '/rest/v1/recipes') return json(current?.approval_status === 'approved' ? [{ id: 'local-smoke', title: '승인 후 확인용 테스트 레시피', category: 'milk', tags: [], ingredient_groups: [], step_groups: [] }] : []);
        let path = resolve(root, `.${url.pathname}`);
        if (!path.startsWith(root + sep)) path = resolve(root, 'index.html');
        try { if (!(await stat(path)).isFile()) path = resolve(root, 'index.html'); } catch { path = resolve(root, 'index.html'); }
        const type = path.endsWith('.js') ? 'application/javascript' : path.endsWith('.html') ? 'text/html' : path.endsWith('.ttf') ? 'font/ttf' : 'application/octet-stream';
        let data = await readFile(path);
        if (path.endsWith('.js')) {
            // Keep the production artifact intact; this local fixture serves a copy that
            // directs the real Supabase client exclusively to this test backend.
            data = data.toString().replaceAll(publicConfig.supabaseUrl, 'http://127.0.0.1:54329')
                .replaceAll(publicConfig.supabaseAnonKey, 'local-test-key');
        }
        res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(data);
    } catch { json({ message: 'Local fixture error' }, 500); }
}).listen(54329, '127.0.0.1', () => console.log('Local UI smoke fixture: http://127.0.0.1:54329'));
