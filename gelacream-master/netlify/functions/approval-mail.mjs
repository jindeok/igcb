import { processApprovalEmails } from '../lib/approval-mail.mjs';

// Scheduled functions cannot be invoked through a public HTTP request on Netlify.
export default async () => {
    const result = await processApprovalEmails();
    // Counts only: never write mail addresses, passwords, or API responses to logs.
    console.log('approval-mail', JSON.stringify(result));
    return new Response(null, { status: 204 });
};
