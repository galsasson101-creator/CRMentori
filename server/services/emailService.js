let accessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const { AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET } = process.env;

  if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET) {
    throw new Error('Azure not configured. Set AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET in .env');
  }

  const url = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    client_id: AZURE_CLIENT_ID,
    client_secret: AZURE_CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Azure token error: ${err.error_description || res.statusText}`);
  }

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return accessToken;
}

async function sendEmail({ to, subject, html, text }) {
  const token = await getAccessToken();
  const sender = process.env.MAIL_FROM || 'info@mentori.app';

  const message = {
    message: {
      subject,
      body: {
        contentType: html ? 'HTML' : 'Text',
        content: html || text || subject,
      },
      toRecipients: [
        { emailAddress: { address: to } },
      ],
    },
    saveToSentItems: true,
  };

  const url = `https://graph.microsoft.com/v1.0/users/${sender}/sendMail`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Graph API error: ${err.error?.message || res.statusText}`);
  }

  return {
    messageId: `graph-${Date.now()}`,
    to,
    subject,
    sentAt: new Date().toISOString(),
  };
}

async function sendBulkEmails(recipients, { subject, html, text }) {
  const results = [];
  for (const recipient of recipients) {
    try {
      const result = await sendEmail({
        to: recipient.email,
        subject: subject.replace(/\{\{name\}\}/g, recipient.name || ''),
        html: html.replace(/\{\{name\}\}/g, recipient.name || ''),
        text: text ? text.replace(/\{\{name\}\}/g, recipient.name || '') : undefined,
      });
      results.push({ ...result, status: 'sent' });
    } catch (err) {
      results.push({ to: recipient.email, status: 'failed', error: err.message });
    }
  }
  return results;
}

async function verifyConnection() {
  try {
    await getAccessToken();
    return { connected: true, provider: 'Microsoft Graph (Outlook)' };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

async function fetchBouncedEmails() {
  const token = await getAccessToken();
  const sender = process.env.MAIL_FROM || 'info@mentori.app';

  // Search for NDR / bounce messages in the inbox
  const searchQueries = [
    `subject:Undeliverable`,
    `subject:Delivery has failed`,
    `subject:Mail Delivery Failed`,
    `subject:Failure notice`,
    `subject:Returned mail`,
    `subject:Undelivered Mail Returned`,
  ];

  const bouncedEmails = new Set();
  // Regex to extract email addresses from NDR body
  const emailRegex = /[\w.+-]+@[\w-]+\.[\w.-]+/g;

  for (const query of searchQueries) {
    let url = `https://graph.microsoft.com/v1.0/users/${sender}/messages?$search="${query}"&$top=500&$select=body,subject,from,receivedDateTime`;

    while (url) {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'outlook.body-content-type="text"',
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Graph API error: ${err.error?.message || res.statusText}`);
      }

      const data = await res.json();

      for (const msg of (data.value || [])) {
        const bodyText = msg.body?.content || '';
        const foundEmails = bodyText.match(emailRegex) || [];
        for (const email of foundEmails) {
          const lower = email.toLowerCase();
          // Skip our own sender address and system addresses
          if (lower === sender.toLowerCase()) continue;
          if (lower.includes('postmaster') || lower.includes('mailer-daemon')) continue;
          if (lower.includes('noreply') || lower.includes('no-reply')) continue;
          if (lower.endsWith('@microsoft.com') || lower.endsWith('@protection.outlook.com')) continue;
          bouncedEmails.add(lower);
        }
      }

      url = data['@odata.nextLink'] || null;
    }
  }

  return Array.from(bouncedEmails);
}

module.exports = { sendEmail, sendBulkEmails, verifyConnection, fetchBouncedEmails };
