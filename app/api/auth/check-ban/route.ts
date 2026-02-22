import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiAuth, corsHeaders } from '@/lib/api-auth'

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders() })
}

export async function GET(request: NextRequest) {
  const auth = await validateApiAuth(request)
  if (!auth.valid) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400, headers: corsHeaders() })
    }

    const ban = await prisma.authUserBan.findFirst({
      where: {
        databaseId: auth.databaseId,
        externalUserId: userId,
        isActive: true,
      },
      orderBy: { bannedAt: 'desc' },
    })

    // Check if temporary ban has expired
    if (ban && ban.expiresAt && new Date() > ban.expiresAt) {
      await prisma.authUserBan.update({
        where: { id: ban.id },
        data: { isActive: false, unbannedAt: new Date() },
      })
      return NextResponse.json({ banned: false }, { headers: corsHeaders() })
    }

    if (ban) {
      return NextResponse.json(
        {
          banned: true,
          reason: ban.reason,
          type: ban.type,
          expiresAt: ban.expiresAt?.toISOString() || null,
          bannedAt: ban.bannedAt.toISOString(),
        },
        { headers: corsHeaders() }
      )
    }

    return NextResponse.json({ banned: false }, { headers: corsHeaders() })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders() })
  }
}
