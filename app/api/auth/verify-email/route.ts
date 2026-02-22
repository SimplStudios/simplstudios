import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiAuth, corsHeaders } from '@/lib/api-auth'
import { getTursoClient, updateUserField } from '@/lib/turso'

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders() })
}

export async function POST(request: NextRequest) {
  const auth = await validateApiAuth(request)
  if (!auth.valid) return auth.response

  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400, headers: corsHeaders() })
    }

    const authToken = await prisma.authToken.findUnique({ where: { token } })

    if (!authToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400, headers: corsHeaders() })
    }
    if (authToken.type !== 'email_verification') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 400, headers: corsHeaders() })
    }
    if (authToken.usedAt) {
      return NextResponse.json({ error: 'Token already used' }, { status: 400, headers: corsHeaders() })
    }
    if (new Date() > authToken.expiresAt) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400, headers: corsHeaders() })
    }
    if (authToken.databaseId !== auth.databaseId) {
      return NextResponse.json({ error: 'Token does not belong to this database' }, { status: 403, headers: corsHeaders() })
    }

    // Update email_verified in external DB
    const mapping = await prisma.authSchemaMapping.findUnique({
      where: { databaseId: auth.databaseId },
    })
    if (mapping?.emailVerifiedColumn) {
      const db = await prisma.connectedDatabase.findUnique({ where: { id: auth.databaseId } })
      if (db) {
        const client = getTursoClient(db.connectionUrl, db.serviceRole)
        await updateUserField(client, db.userTable, mapping as any, authToken.externalUserId, mapping.emailVerifiedColumn, true)
      }
    }

    // Mark token as used
    await prisma.authToken.update({
      where: { id: authToken.id },
      data: { usedAt: new Date() },
    })

    return NextResponse.json(
      { success: true, userId: authToken.externalUserId, email: authToken.email },
      { headers: corsHeaders() }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders() })
  }
}
