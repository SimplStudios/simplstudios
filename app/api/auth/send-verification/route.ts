import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiAuth, corsHeaders } from '@/lib/api-auth'
import { sendVerificationEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders() })
}

export async function POST(request: NextRequest) {
  const auth = await validateApiAuth(request)
  if (!auth.valid) return auth.response

  try {
    const { userId, email, verifyUrl } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required' }, { status: 400, headers: corsHeaders() })
    }

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.authToken.create({
      data: {
        databaseId: auth.databaseId,
        externalUserId: userId,
        email,
        token,
        type: 'email_verification',
        expiresAt,
      },
    })

    const db = await prisma.connectedDatabase.findUnique({ where: { id: auth.databaseId } })
    const result = await sendVerificationEmail(email, token, db?.appName || 'SimplStudios', verifyUrl)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500, headers: corsHeaders() })
    }

    return NextResponse.json(
      { success: true, expiresAt: expiresAt.toISOString() },
      { headers: corsHeaders() }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders() })
  }
}
