import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiAuth, corsHeaders } from '@/lib/api-auth'
import { getTursoClient, getUserById } from '@/lib/turso'

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
    if (authToken.type !== 'magic_link') {
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

    // Get user data to return for session creation
    const mapping = await prisma.authSchemaMapping.findUnique({
      where: { databaseId: auth.databaseId },
    })
    const db = await prisma.connectedDatabase.findUnique({ where: { id: auth.databaseId } })

    let user = null
    if (db && mapping) {
      const client = getTursoClient(db.connectionUrl, db.serviceRole)
      user = await getUserById(client, db.userTable, mapping as any, authToken.externalUserId)
    }

    // Mark token as used
    await prisma.authToken.update({
      where: { id: authToken.id },
      data: { usedAt: new Date() },
    })

    return NextResponse.json(
      {
        success: true,
        user: user
          ? { id: user.id, email: user.email, name: user.name, username: user.username, role: user.role }
          : { id: authToken.externalUserId, email: authToken.email },
      },
      { headers: corsHeaders() }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders() })
  }
}
