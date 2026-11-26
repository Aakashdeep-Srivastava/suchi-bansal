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

  const text =
    `New message from the portfolio contact form\n\n` +
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    (phone ? `Phone: ${phone}\n` : '') +
    `Topic: ${topic}\n\n` +
    `${message}\n`;

  const html =
    `<div style="font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">` +
    `<h2 style="margin:0 0 12px">New portfolio inquiry</h2>` +
    `<p style="margin:4px 0"><strong>Name:</strong> ${esc(name)}</p>` +
    `<p style="margin:4px 0"><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` +
    (phone ? `<p style="margin:4px 0"><strong>Phone:</strong> ${esc(phone)}</p>` : '') +
    `<p style="margin:4px 0"><strong>Topic:</strong> ${esc(topic)}</p>` +
    `<hr style="border:none;border-top:1px solid #eee;margin:14px 0"/>` +
    `<p style="white-space:pre-wrap;margin:0">${esc(message)}</p>` +
    `</div>`;

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
