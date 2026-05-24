import nodemailer from 'nodemailer';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createTransporter() {
  return nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendShareNotificationEmail({ toEmail, fromName, noteTitle }) {
  const transporter = createTransporter();
  const previewTitle = noteTitle || 'Untitled Note';

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: `${escapeHtml(fromName)} shared a note with you - AI Notes`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0f; border-radius: 16px; border: 1px solid rgba(59,130,246,0.2);">
        <h2 style="color: #f1f5f9; margin: 0 0 8px 0; font-size: 22px;">New Shared Note</h2>
        <p style="color: #94a3b8; margin: 0 0 24px 0; font-size: 14px;">
          <strong style="color: #60a5fa;">${escapeHtml(fromName)}</strong> shared a note with you.
        </p>
        <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.25); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 1px;">Note Title</p>
          <p style="color: #f1f5f9; font-size: 18px; font-weight: 600; margin: 0;">${escapeHtml(previewTitle)}</p>
        </div>
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">
          Open AI Notes to view and accept the shared note.
        </p>
        <p style="color: #64748b; font-size: 12px; margin: 0;">This is an automated notification from AI Notes.</p>
      </div>
    `,
  });
}
