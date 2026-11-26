// Vercel serverless function — portfolio contact form → email via Resend.
//
// The Resend API cannot be called from the browser (the key would be exposed
// and Resend blocks client-side calls), so the form POSTs here and this function
// sends the email server-side with the key held in an environment variable.
//
// Required env var (set in Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY   — your Resend API key (starts with "re_")
// Optional env vars:
//   CONTACT_TO       — destination inbox (default: suchiban07@gmail.com)
//   CONTACT_FROM     — verified sender (default: Resend's onboarding sender,
//                      which only delivers to the Resend account owner — set a
//                      verified-domain sender like "Portfolio <noreply@suchibansal.com>"
//                      for production delivery to any inbox).

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'Email service not configured' });
  }

  // Vercel usually parses JSON bodies for us; fall back to a manual parse.
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const name = String(body.name || '').trim().slice(0, 200);
  const email = String(body.email || '').trim().slice(0, 200);
  const phone = String(body.phone || '').trim().slice(0, 60);
  const topic = String(body.topic || 'General').trim().slice(0, 120);
  const message = String(body.message || '').trim().slice(0, 5000);

  // Honeypot — if a bot fills the hidden field, pretend success and drop it.
  if (String(body.botcheck || '').trim()) return res.status(200).json({ success: true });

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email and message are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
  }

  const to = process.env.CONTACT_TO || 'suchiban07@gmail.com';
  const from = process.env.CONTACT_FROM || 'Suchi Bansal Portfolio <onboarding@resend.dev>';
  const subject = `New inquiry: ${topic} — ${name}`;

  const received = (() => {
    try {
      return new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short'
      }) + ' IST';
    } catch { return new Date().toUTCString(); }
  })();
  const replyHref = `mailto:${email}?subject=${encodeURIComponent('Re: your inquiry — Suchi Bansal')}`;

  const text =
    `NEW PORTFOLIO INQUIRY — ${topic}\n` +
    `------------------------------------------------\n\n` +
    `Name:     ${name}\n` +
    `Email:    ${email}\n` +
    (phone ? `Phone:    ${phone}\n` : '') +
    `Topic:    ${topic}\n` +
    `Received: ${received}\n\n` +
    `Message:\n${message}\n\n` +
    `------------------------------------------------\n` +
    `Reply directly to this email to reach ${name}.\n\n` +
    `Suchi Bansal — Senior Product Manager, AI & Enterprise Products\n` +
    `suchiban07@gmail.com · www.suchibansal.com\n`;

  // Email-client-safe: table layout + inline styles only (no flex/grid/<style>).
  const row = (label, value) =>
    `<tr>` +
      `<td style="padding:7px 0;width:94px;vertical-align:top;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8a8a8a;">${label}</td>` +
      `<td style="padding:7px 0;font-size:15px;color:#111111;line-height:1.5;">${value}</td>` +
    `</tr>`;

  const html =
`<div style="margin:0;padding:0;background:#f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e6e6e8;border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

        <tr><td style="background:#0d0d0d;padding:26px 32px;">
          <div style="font-size:13px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:#ffffff;">Suchi&nbsp;Bansal</div>
          <div style="font-size:12px;letter-spacing:.05em;color:#9a9a9a;margin-top:5px;">Portfolio &middot; suchibansal.com</div>
        </td></tr>

        <tr><td style="padding:28px 32px 6px;">
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#0d0d0d;letter-spacing:-.01em;">New portfolio inquiry</h1>
          <span style="display:inline-block;background:#0d0d0d;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:6px 13px;border-radius:999px;">${esc(topic)}</span>
        </td></tr>

        <tr><td style="padding:16px 32px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row('Name', esc(name))}
            ${row('Email', `<a href="mailto:${esc(email)}" style="color:#0d0d0d;text-decoration:underline;">${esc(email)}</a>`)}
            ${phone ? row('Phone', esc(phone)) : ''}
            ${row('Received', esc(received))}
          </table>
        </td></tr>

        <tr><td style="padding:14px 32px 4px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8a8a8a;margin-bottom:8px;">Message</div>
          <div style="border-left:3px solid #0d0d0d;background:#fafafa;padding:14px 16px;border-radius:0 10px 10px 0;font-size:15px;line-height:1.65;color:#222222;white-space:pre-wrap;">${esc(message)}</div>
        </td></tr>

        <tr><td style="padding:22px 32px 28px;">
          <a href="${replyHref}" style="display:inline-block;background:#0d0d0d;color:#ffffff;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;padding:13px 28px;border-radius:999px;">Reply to ${esc(name)}</a>
          <div style="font-size:12px;color:#9a9a9a;margin-top:11px;">Or just hit reply — it goes straight to ${esc(name)}.</div>
        </td></tr>

        <tr><td style="background:#0d0d0d;padding:24px 32px;">
          <div style="font-size:14px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#ffffff;">Suchi Bansal</div>
          <div style="font-size:12px;color:#9a9a9a;margin-top:5px;line-height:1.6;">Senior Product Manager &middot; AI &amp; Enterprise Products</div>
          <div style="font-size:12px;margin-top:11px;line-height:1.7;">
            <a href="mailto:suchiban07@gmail.com" style="color:#ffffff;text-decoration:none;">suchiban07@gmail.com</a>
            <span style="color:#555555;">&nbsp;&middot;&nbsp;</span>
            <a href="https://www.suchibansal.com" style="color:#ffffff;text-decoration:none;">www.suchibansal.com</a>
          </div>
        </td></tr>

      </table>
      <div style="font-size:11px;color:#b5b5b8;margin-top:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Sent from the contact form at suchibansal.com</div>
    </td></tr>
  </table>
</div>`;

  try {
    const r = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: email, subject, html, text })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(502).json({ success: false, error: data?.message || 'Email send failed' });
    }
    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    return res.status(502).json({ success: false, error: 'Email send failed' });
  }
}
