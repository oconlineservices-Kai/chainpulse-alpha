/**
 * Email utilities for ChainPulse Alpha
 *
 * Supports multiple email providers:
 * 1. Resend (recommended) — set RESEND_API_KEY
 * 2. SMTP — set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * 3. Console log fallback when no provider is configured
 */

const APP_NAME = 'ChainPulse Alpha'
const APP_URL = process.env.APP_URL || 'https://chainpulsealpha.com'
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@chainpulsealpha.com'

type EmailOptions = {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send an email using the configured provider.
 * Falls back to console.log when no provider is available.
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<{ success: boolean; provider: string; error?: string }> {
  // Try Resend first
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${APP_NAME} <${FROM_EMAIL}>`,
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]+>/g, ''),
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`Resend error: ${err}`)
      }

      return { success: true, provider: 'resend' }
    } catch (err: any) {
      console.error('[Email] Resend failed:', err.message)
      // Fall through to SMTP or console
    }
  }

  // Try SMTP next
  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = require('nodemailer')
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: `"${APP_NAME}" <${FROM_EMAIL}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ''),
      })

      return { success: true, provider: 'smtp' }
    } catch (err: any) {
      console.error('[Email] SMTP failed:', err.message)
      // Fall through to console
    }
  }

  // Fallback: log to console
  console.log(`\n========== 📧 EMAIL (${APP_NAME}) ==========`)
  console.log(`To:      ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(`Text:    ${text || html.replace(/<[^>]+>/g, '')}`)
  console.log(`HTML:    ${html.substring(0, 500)}...`)
  console.log('==========================================\n')

  return { success: true, provider: 'console' }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<{ success: boolean; provider: string; error?: string }> {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`

  return sendEmail({
    to: email,
    subject: 'Reset your ChainPulse Alpha password',
    html: `
      <div style="max-width:600px;margin:40px auto;padding:32px;background:#0f0f1a;border-radius:16px;border:1px solid #1e293b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#fff;font-size:24px;margin:0;">🔺 ChainPulse Alpha</h1>
        </div>
        <h2 style="color:#fff;font-size:20px;margin-bottom:16px;">Reset Your Password</h2>
        <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin-bottom:8px;">
          We received a request to reset the password for your ChainPulse Alpha account.
        </p>
        <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin-bottom:24px;">
          Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <div style="text-align:center;margin-bottom:24px;">
          <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
            Reset Password
          </a>
        </div>
        <p style="color:#64748b;font-size:13px;line-height:1.5;margin-bottom:8px;">
          If you did not request a password reset, please ignore this email or contact support.
        </p>
        <p style="color:#64748b;font-size:13px;line-height:1.5;">
          Or copy this link into your browser:<br/>
          <a href="${resetUrl}" style="color:#60a5fa;word-break:break-all;">${resetUrl}</a>
        </p>
        <hr style="border:none;border-top:1px solid #1e293b;margin:24px 0;" />
        <p style="color:#475569;font-size:12px;text-align:center;margin:0;">
          ChainPulse Alpha &bull; AI-powered crypto signals
        </p>
      </div>
    `,
  })
}
