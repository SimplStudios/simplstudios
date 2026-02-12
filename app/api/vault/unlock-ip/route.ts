import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

/**
 * POST /api/vault/unlock-ip
 * Admin action to unlock a locked IP from keygen
 * Requires admin session
 * 
 * Body: { ipAddress: string }
 */
export async function POST(request: NextRequest) {
    try {
        // Verify admin session
        const cookieStore = await cookies()
        const isAdmin = cookieStore.get('admin_session')?.value === 'true'
        
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { ipAddress } = body

        if (!ipAddress) {
            return NextResponse.json({ error: 'IP address required' }, { status: 400 })
        }

        // Check if IP exists in locks
        // @ts-ignore - Prisma types available after migration
        const lock = await prisma.keygenLock.findUnique({
            where: { ipAddress }
        })

        if (!lock) {
            return NextResponse.json({ error: 'IP not found in lock list' }, { status: 404 })
        }

        // Unlock the IP
        // @ts-ignore
        await prisma.keygenLock.update({
            where: { ipAddress },
            data: {
                isLocked: false,
                unlockedAt: new Date(),
                unlockedBy: 'Admin' // Could be enhanced to track which admin
            }
        })

        // Log this action
        // @ts-ignore
        await prisma.vaultEvent.create({
            data: {
                eventType: 'ip_unlocked',
                ipAddress,
                userAgent: request.headers.get('user-agent'),
                details: JSON.stringify({ unlockedBy: 'Admin', previousAttempts: lock.attempts }),
                severity: 'info'
            }
        })

        // Also log to audit log
        // @ts-ignore
        await prisma.auditLog.create({
            data: {
                action: 'keygen_ip_unlocked',
                ipAddress,
                userAgent: request.headers.get('user-agent'),
                details: JSON.stringify({ targetIp: ipAddress, attempts: lock.attempts })
            }
        })

        return NextResponse.json({ 
            success: true, 
            message: `IP ${ipAddress} has been unlocked`,
            unlockedAt: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Vault API] Unlock IP error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
