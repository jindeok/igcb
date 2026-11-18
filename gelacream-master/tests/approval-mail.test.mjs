import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeMessage, processApprovalEmails } from '../netlify/lib/approval-mail.mjs';

const item = { id: 'mail-1', lease_token: 'lease-1', kind: 'request', recipient_email: 'admin@example.com', applicant_email: 'new@example.com', applicant_name: '<script>신규</script>' };
const env = { SUPABASE_URL: 'https://database.example', SUPABASE_SERVICE_ROLE_KEY: 'test-secret', MAIL_FROM: 'IGCB <sender@example.com>', APP_URL: 'https://app.example', RESEND_API_KEY: 'test-key' };
test('unconfigured mail does not claim requests or prevent signup', async () => {
    assert.deepEqual(await processApprovalEmails({ env: {}, fetcher: () => { throw new Error('must not call'); } }), { status: 'not_configured', sent: 0, failed: 0 });
});
test('request link opens the web app and never approves through a GET', () => {
    const message = makeMessage(item, env.APP_URL);
    assert.match(message.text, /https:\/\/app.example\/admin\/members/);
    assert.equal(message.html, undefined, 'applicant text is never injected into HTML');
    assert.throws(() => makeMessage(item, 'http://insecure.example'), /HTTPS/);
});
test('Resend delivery uses stable idempotency key and acknowledges lease', async () => {
    const calls = [];
    const fetcher = async (url, options) => {
        calls.push({ url, options, body: JSON.parse(options.body) });
        return new Response(JSON.stringify(url.endsWith('claim_approval_emails') ? [item] : {}), { status: 200 });
    };
    assert.deepEqual(await processApprovalEmails({ env, fetcher }), { status: 'ok', sent: 1, failed: 0 });
    assert.equal(calls[1].options.headers['Idempotency-Key'], 'approval-mail-1');
    assert.equal(calls[1].body.to, item.recipient_email);
    assert.deepEqual(calls[2].body, { mail_id: item.id, token: item.lease_token, failure: null });
});
test('delivery failure is recorded for retry without saving credentials', async () => {
    let acknowledgement;
    const fetcher = async (url, options) => {
        if (url.endsWith('claim_approval_emails')) return Response.json([item]);
        if (url.endsWith('finish_approval_email')) { acknowledgement = JSON.parse(options.body); return new Response(null, { status: 204 }); }
        throw new Error('secret-password');
    };
    assert.equal((await processApprovalEmails({ env, fetcher })).failed, 1);
    assert.ok(acknowledgement.failure);
    assert.doesNotMatch(acknowledgement.failure, /secret-password/);
});
test('existing SMTP mailbox works without a custom domain or Resend account', async () => {
    let delivered;
    const fetcher = async url => url.endsWith('claim_approval_emails') ? Response.json([item]) : new Response(null, { status: 204 });
    const smtpEnv = { ...env, RESEND_API_KEY: '', SMTP_HOST: 'smtp.naver.com', SMTP_USER: 'sender@naver.com', SMTP_PASS: 'test-password' };
    const result = await processApprovalEmails({ env: smtpEnv, fetcher, createTransport: config => {
        assert.equal(config.secure, true);
        assert.equal(config.requireTLS, true);
        return { sendMail: async message => { delivered = message; return { accepted: [message.to] }; }, close() {} };
    } });
    assert.equal(result.sent, 1);
    assert.equal(delivered.to, item.recipient_email);
});
