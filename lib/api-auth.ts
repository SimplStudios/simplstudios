import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function validateApiAuth(
  request: NextRequest
): Promise<{ valid: true; databaseId: string } | { valid: false; response: NextResponse }> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Missing or invalid Authorization header. Use: Bearer <token>' },
        { status: 401 }
      ),
    }
  }

  const token = authHeader.slice(7)

  // Find the connected database that matches this auth token
  const db = await prisma.connectedDatabase.findFirst({
    where: { serviceRole: token, isActive: true },
  })

  if (!db) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Invalid API token. Token must match a connected database auth token.' },
        { status: 401 }
      ),
    }
  }

  return { valid: true, databaseId: db.id }
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}
