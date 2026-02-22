import { Resend } from 'resend'
import { prisma } from '@/lib/db'

let resendInstance: Resend | null = null
let cachedSettings: { apiKey: string; fromEmail: string; appUrl: string } | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60_000 // 60 seconds

export function clearEmailCache() {
  resendInstance = null
  cachedSettings = null
  cacheTimestamp = 0
}

async function loadSettings(): Promise<{ apiKey: string | null; fromEmail: string; appUrl: string }> {
  const now = Date.now()
  if (cachedSettings && now - cacheTimestamp < CACHE_TTL) {
    return cachedSettings
  }

  try {
    const result = await prisma.$queryRawUnsafe<any[]>(
      `SELECT resend_api_key, from_email, app_url FROM auth_email_settings WHERE id = 'default' LIMIT 1`
    )
    if (result.length > 0 && result[0].resend_api_key) {
      cachedSettings = {
        apiKey: result[0].resend_api_key,
        fromEmail: result[0].from_email || 'onboarding@resend.dev',
        appUrl: result[0].app_url || 'https://simplstudios.vercel.app',
      }
      cacheTimestamp = now
      return cachedSettings
    }
  } catch (e) {
    // Table might not exist yet, fall back to env
  }

  const fallback = {
    apiKey: process.env.RESEND_API_KEY || null,
    fromEmail: process.env.AUTH_MANAGER_FROM_EMAIL || 'onboarding@resend.dev',
    appUrl: process.env.AUTH_MANAGER_APP_URL || 'https://simplstudios.vercel.app',
  }
  if (fallback.apiKey) {
    cachedSettings = fallback as any
    cacheTimestamp = now
  }
  return fallback
}

async function getResend(): Promise<Resend> {
  const settings = await loadSettings()

  if (!settings.apiKey) {
    throw new Error('Resend is not configured. Go to Auth Manager → Settings to add your API key.')
  }

  // Recreate instance if key changed
  if (!resendInstance || (cachedSettings && cachedSettings.apiKey !== settings.apiKey)) {
    resendInstance = new Resend(settings.apiKey)
  }

  return resendInstance
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
  appName: string,
  resetUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const settings = await loadSettings()
  const link = resetUrl
    ? `${resetUrl}?token=${token}`
    : `${settings.appUrl}/reset-password?token=${token}`

  try {
    const resend = await getResend()
    const { error } = await resend.emails.send({
      from: `${appName} <${settings.fromEmail}>`,
      to,
      subject: `Password Reset - ${appName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f172a; color: #e2e8f0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Password Reset</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">${appName}</p>
          </div>
          <div style="background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155;">
            <p style="color: #e2e8f0; font-size: 16px; margin: 0 0 16px 0;">
              A password reset was requested for your account. Click the button below to set a new password.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${link}" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="color: #64748b; font-size: 13px; margin: 16px 0 0 0;">
              This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
            Sent by SimplStudios Auth Manager
          </p>
        </div>
      `,
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send email' }
  }
}

export async function sendVerificationEmail(
  to: string,
  token: string,
  appName: string,
  verifyUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const settings = await loadSettings()
  const link = verifyUrl
    ? `${verifyUrl}?token=${token}`
    : `${settings.appUrl}/verify-email?token=${token}`

  try {
    const resend = await getResend()
    const { error } = await resend.emails.send({
      from: `${appName} <${settings.fromEmail}>`,
      to,
      subject: `Verify Your Email - ${appName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f172a; color: #e2e8f0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Verify Your Email</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">${appName}</p>
          </div>
          <div style="background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155;">
            <p style="color: #e2e8f0; font-size: 16px; margin: 0 0 16px 0;">
              Please verify your email address to complete your account setup.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${link}" style="display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Verify Email
              </a>
            </div>
            <p style="color: #64748b; font-size: 13px; margin: 16px 0 0 0;">
              This link expires in 24 hours.
            </p>
          </div>
          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
            Sent by SimplStudios Auth Manager
          </p>
        </div>
      `,
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send email' }
  }
}

export async function sendMagicLinkEmail(
  to: string,
  token: string,
  appName: string,
  loginUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const settings = await loadSettings()
  const link = loginUrl
    ? `${loginUrl}?token=${token}`
    : `${settings.appUrl}/magic-login?token=${token}`

  try {
    const resend = await getResend()
    const { error } = await resend.emails.send({
      from: `${appName} <${settings.fromEmail}>`,
      to,
      subject: `Sign In Link - ${appName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f172a; color: #e2e8f0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Magic Sign In Link</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">${appName}</p>
          </div>
          <div style="background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155;">
            <p style="color: #e2e8f0; font-size: 16px; margin: 0 0 16px 0;">
              Click the button below to sign in to your account. No password needed.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${link}" style="display: inline-block; background: #8b5cf6; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Sign In
              </a>
            </div>
            <p style="color: #64748b; font-size: 13px; margin: 16px 0 0 0;">
              This link expires in 15 minutes and can only be used once.
            </p>
          </div>
          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
            Sent by SimplStudios Auth Manager
          </p>
        </div>
      `,
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send email' }
  }
}
