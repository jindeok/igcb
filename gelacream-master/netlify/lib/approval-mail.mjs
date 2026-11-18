import nodemailer from 'nodemailer';

export function makeMessage(item, appUrl) {
    const base = new URL(appUrl);
    if (base.protocol !== 'https:') throw new Error('APP_URL must use HTTPS');
    const request = item.kind === 'request';
    return {
        subject: request ? '[IGCB] 회원 가입 승인 요청' : '[IGCB] 가입이 승인되었습니다',
        text: request
            ? `이메일 인증을 마친 가입 신청이 있습니다.\n\n이름: ${item.applicant_name || '이름 미입력'}\n이메일: ${item.applicant_email}\n\n아래 웹앱에 관리자 계정으로 로그인하여 승인 또는 거절해 주세요. 관리자 한 명이 승인하면 이용할 수 있습니다.\n${new URL('/admin/members', base).href}\n\n이미 처리된 신청은 처리 내역에서 확인할 수 있습니다.`
            : `가입이 승인되었습니다. 이제 로그인하여 레시피를 이용할 수 있습니다.\n${new URL('/login', base).href}`,
    };
}

export async function processApprovalEmails({ env = process.env, fetcher = fetch, createTransport = nodemailer.createTransport } = {}) {
    const smtp = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
    const resend = !!env.RESEND_API_KEY;
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.MAIL_FROM || !env.APP_URL || (!smtp && !resend)) {
        return { status: 'not_configured', sent: 0, failed: 0 };
    }
    const rpc = async (name, body) => {
        const response = await fetcher(`${env.SUPABASE_URL}/rest/v1/rpc/${name}`, {
            method: 'POST',
            headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body), signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) throw new Error(`Database RPC failed (${response.status})`);
        return response.status === 204 ? null : response.json();
    };
    // Validate before claiming; a configuration error must not consume delivery attempts.
    makeMessage({ kind: 'approved' }, env.APP_URL);
    const transport = smtp ? createTransport({
        host: env.SMTP_HOST, port: Number(env.SMTP_PORT || 465), secure: (env.SMTP_PORT || '465') === '465',
        requireTLS: true, auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
        connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 8000,
    }) : null;
    const items = await rpc('claim_approval_emails', { batch_size: 4 });
    const results = await Promise.all(items.map(async item => {
        let failure = null;
        try {
            const message = { ...makeMessage(item, env.APP_URL), from: env.MAIL_FROM, to: item.recipient_email };
            if (transport) {
                const result = await transport.sendMail({ ...message, messageId: `<igcb-approval-${item.id}@${new URL(env.APP_URL).hostname}>` });
                if (!result.accepted?.length) throw new Error('SMTP rejected recipient');
            } else {
                const response = await fetcher('https://api.resend.com/emails', {
                    method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `approval-${item.id}` },
                    body: JSON.stringify(message), signal: AbortSignal.timeout(8000),
                });
                if (!response.ok) throw new Error(`Mail API failed (${response.status})`);
            }
        } catch {
            // Provider error text may contain passwords or recipient details; store a fixed message.
            failure = '메일을 보내지 못했습니다. 발송 설정 및 서비스 한도를 확인해 주세요.';
        }
        // If acknowledgement fails, leave the lease to expire and retry on the next run.
        await rpc('finish_approval_email', { mail_id: item.id, token: item.lease_token, failure });
        return failure ? 'failed' : 'sent';
    }));
    transport?.close();
    return { status: 'ok', sent: results.filter(v => v === 'sent').length, failed: results.filter(v => v === 'failed').length };
}
