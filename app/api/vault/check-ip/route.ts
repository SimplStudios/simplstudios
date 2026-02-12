import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// CORS headers for external keygen site
const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://68fe8atay8wewqw0d9ew7fe99w8e8fe7y329.puter.site',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

/**
 * POST /api/vault/check-ip
 * Checks if an IP is locked from keygen
 * Called by external keygen site on page load
 * 
 * Body: { ipAddress?: string } (optional, we get from headers)
 * 
 * Returns: {
 *   locked: boolean
 *   whitelisted: boolean
 *   reason?: string
 *   lockedAt?: string
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // Get IP from headers
        const forwarded = request.headers.get('x-forwarded-for')
        const realIp = request.headers.get('x-real-ip')
        const body = await request.json().catch(() => ({}))
        const ipAddress = forwarded?.split(',')[0] || realIp || body.ipAddress || 'unknown'

        // Check if IP is locked
        // @ts-ignore - Prisma types available after migration
        const lock = await prisma.keygenLock.findUnique({
            where: { ipAddress }
        })

        if (lock && lock.isLocked) {
            return NextResponse.json({
                locked: true,
                whitelisted: false,
                reason: lock.reason,
                lockedAt: lock.lockedAt.toISOString(),
                attempts: lock.attempts
            }, { headers: corsHeaders })
        }

        // If unlocked (was locked before but admin restored)
        if (lock && !lock.isLocked) {
            return NextResponse.json({
                locked: false,
                whitelisted: true, // Explicitly whitelisted by admin
                unlockedAt: lock.unlockedAt?.toISOString(),
                unlockedBy: lock.unlockedBy
            }, { headers: corsHeaders })
        }

        // Never locked
        return NextResponse.json({
            locked: false,
            whitelisted: false
        }, { headers: corsHeaders })

    } catch (error) {
        console.error('[Vault API] Check IP error:', error)
        return NextResponse.json({ 
            locked: false, 
            whitelisted: false,
            error: 'Check failed' 
        }, { headers: corsHeaders })
    }
}
