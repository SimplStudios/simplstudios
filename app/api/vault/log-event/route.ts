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
 * POST /api/vault/log-event
 * Logs events from external Key Maker site
 * 
 * Body: {
 *   eventType: 'failed_attempt' | 'lockout' | 'devtools_opened' | 'key_generated' | 'key_expired'
 *   ipAddress?: string (we also get from headers)
 *   userAgent?: string
 *   location?: string
 *   details?: object (will be stringified)
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { eventType, location, details } = body

        // Get IP from headers (Vercel forwards this)
        const forwarded = request.headers.get('x-forwarded-for')
        const realIp = request.headers.get('x-real-ip')
        const ipAddress = forwarded?.split(',')[0] || realIp || body.ipAddress || 'unknown'
        const userAgent = request.headers.get('user-agent') || body.userAgent || null

        // Validate event type
        const validEvents = ['failed_attempt', 'lockout', 'devtools_opened', 'key_generated', 'key_expired', 'key_validated', 'page_load']
        if (!validEvents.includes(eventType)) {
            return NextResponse.json({ error: 'Invalid event type' }, { status: 400, headers: corsHeaders })
        }

        // Determine severity
        let severity = 'info'
        if (eventType === 'failed_attempt') severity = 'warning'
        if (eventType === 'lockout' || eventType === 'devtools_opened') severity = 'critical'

        // Log the event
        // @ts-ignore - Prisma types available after migration
        await prisma.vaultEvent.create({
            data: {
                eventType,
                ipAddress,
                userAgent,
                location: location || null,
                details: details ? JSON.stringify(details) : null,
                severity
            }
        })

        // If it's a lockout, also create/update the keygen lock
        if (eventType === 'lockout') {
            const restoreUrl = `https://simplstudios.vercel.app/admin/vault?unlock=${encodeURIComponent(ipAddress)}`
            
            // @ts-ignore
            const existing = await prisma.keygenLock.findUnique({
                where: { ipAddress }
            })

            if (existing) {
                // @ts-ignore
                await prisma.keygenLock.update({
                    where: { ipAddress },
                    data: {
                        attempts: existing.attempts + 3,
                        lockedAt: new Date(),
                        isLocked: true,
                        unlockedAt: null,
                        restoreUrl
                    }
                })
            } else {
                // @ts-ignore
                await prisma.keygenLock.create({
                    data: {
                        ipAddress,
                        reason: details?.reason || 'Too many failed keygen attempts',
                        attempts: 3,
                        isLocked: true,
                        restoreUrl
                    }
                })
            }
        }

        return NextResponse.json({ 
            success: true, 
            logged: eventType,
            ip: ipAddress 
        }, { headers: corsHeaders })

    } catch (error) {
        console.error('[Vault API] Log event error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
    }
}
