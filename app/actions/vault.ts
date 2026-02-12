'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

// ===================
// CREDENTIALS MANAGEMENT
// ===================

export async function getCredentials() {
    // @ts-ignore - Prisma types available after migration
    return await prisma.vaultCredential.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export async function createCredential(formData: FormData) {
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const service = formData.get('service') as string
    const identifier = formData.get('identifier') as string || null
    const secret = formData.get('secret') as string
    const notes = formData.get('notes') as string || null

    // @ts-ignore - Prisma types available after migration
    await prisma.vaultCredential.create({
        data: { name, type, service, identifier, secret, notes }
    })

    // Log this action
    await logAuditAction('credential_created', `Created credential: ${name}`)
    revalidatePath('/admin/vault')
}

export async function updateCredential(formData: FormData) {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const service = formData.get('service') as string
    const identifier = formData.get('identifier') as string || null
    const secret = formData.get('secret') as string
    const notes = formData.get('notes') as string || null

    // @ts-ignore - Prisma types available after migration
    await prisma.vaultCredential.update({
        where: { id },
        data: { name, type, service, identifier, secret, notes }
    })

    await logAuditAction('credential_updated', `Updated credential: ${name}`)
    revalidatePath('/admin/vault')
}

export async function deleteCredential(id: string) {
    // @ts-ignore - Prisma types available after migration
    const cred = await prisma.vaultCredential.findUnique({ where: { id } })
    
    // @ts-ignore - Prisma types available after migration
    await prisma.vaultCredential.delete({ where: { id } })

    await logAuditAction('credential_deleted', `Deleted credential: ${cred?.name}`)
    revalidatePath('/admin/vault')
}

// ===================
// AUDIT LOGGING
// ===================

export async function getAuditLogs(limit = 100) {
    // @ts-ignore - Prisma types available after migration
    return await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit
    })
}

export async function logAuditAction(action: string, details?: string) {
    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwarded?.split(',')[0] || realIp || 'unknown'
    const userAgent = headersList.get('user-agent') || null

    // Check if VPN (basic detection via common VPN headers/patterns)
    const isVpn = await detectVPN(ipAddress, headersList)

    // @ts-ignore - Prisma types available after migration
    await prisma.auditLog.create({
        data: {
            action,
            ipAddress,
            userAgent,
            isVpn,
            details
        }
    })
}

async function detectVPN(ip: string, headersList: Headers): Promise<boolean> {
    // Basic VPN detection heuristics
    // Check for common VPN-related headers
    const viaHeader = headersList.get('via')
    const proxyHeader = headersList.get('x-proxy-id')
    const forwardedFor = headersList.get('x-forwarded-for')
    
    // Multiple IPs in forwarded-for often indicates proxy/VPN
    if (forwardedFor && forwardedFor.split(',').length > 2) {
        return true
    }
    
    // Via header present often indicates proxy
    if (viaHeader) {
        return true
    }
    
    // Proxy ID header
    if (proxyHeader) {
        return true
    }

    // Known VPN/datacenter IP ranges (simplified check)
    // In production, you'd use a proper IP geolocation/VPN detection API
    const vpnPatterns = [
        /^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^192\.168\./,
        /^104\./, /^45\./, /^185\./, /^193\./ // Common VPN provider ranges
    ]
    
    for (const pattern of vpnPatterns) {
        if (pattern.test(ip)) {
            return true
        }
    }

    return false
}

// ===================
// IP BANNING
// ===================

export async function getBannedIPs() {
    // @ts-ignore - Prisma types available after migration
    return await prisma.bannedIP.findMany({
        orderBy: { bannedAt: 'desc' }
    })
}

export async function banIP(ipAddress: string, reason?: string, permanent = false) {
    const expiresAt = permanent ? null : new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours default
    
    // @ts-ignore - Prisma types available after migration
    const existing = await prisma.bannedIP.findUnique({
        where: { ipAddress }
    })

    if (existing) {
        // @ts-ignore - Prisma types available after migration
        await prisma.bannedIP.update({
            where: { ipAddress },
            data: {
                reason: reason || existing.reason,
                expiresAt,
                isActive: true,
                unbannedAt: null,
                failedCount: existing.failedCount + 1
            }
        })
    } else {
        // @ts-ignore - Prisma types available after migration
        await prisma.bannedIP.create({
            data: {
                ipAddress,
                reason: reason || 'Too many failed login attempts',
                expiresAt,
                isActive: true
            }
        })
    }

    await logAuditAction('ip_banned', `Banned IP: ${ipAddress} - ${reason}`)
    revalidatePath('/admin/vault')
}

export async function unbanIP(ipAddress: string) {
    // @ts-ignore - Prisma types available after migration
    await prisma.bannedIP.update({
        where: { ipAddress },
        data: {
            isActive: false,
            unbannedAt: new Date()
        }
    })

    await logAuditAction('ip_unbanned', `Unbanned IP: ${ipAddress}`)
    revalidatePath('/admin/vault')
}

export async function isIPBanned(ipAddress: string): Promise<boolean> {
    // @ts-ignore - Prisma types available after migration
    const banned = await prisma.bannedIP.findUnique({
        where: { ipAddress }
    })

    if (!banned || !banned.isActive) return false
    
    // Check if ban has expired
    if (banned.expiresAt && new Date() > banned.expiresAt) {
        // Auto-unban expired bans
        // @ts-ignore - Prisma types available after migration
        await prisma.bannedIP.update({
            where: { ipAddress },
            data: { isActive: false }
        })
        return false
    }

    return true
}

export async function incrementFailedAttempts(ipAddress: string): Promise<boolean> {
    // Get current failed attempts in last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    
    // @ts-ignore - Prisma types available after migration
    const recentAttempts = await prisma.auditLog.count({
        where: {
            ipAddress,
            action: 'login_failed',
            createdAt: { gte: fifteenMinutesAgo }
        }
    })

    // If 3 or more failed attempts, ban the IP
    if (recentAttempts >= 2) { // This would be the 3rd attempt
        await banIP(ipAddress, 'Too many failed login attempts (3+)', false)
        return true // IP is now banned
    }

    return false
}

// ===================
// ADMIN CHAT
// ===================

export async function getAdminChatMessages(limit = 50) {
    // @ts-ignore - Prisma types available after migration
    return await prisma.adminChatMessage.findMany({
        orderBy: { createdAt: 'asc' },
        take: limit
    })
}

export async function sendAdminChatMessage(formData: FormData) {
    const message = formData.get('message') as string
    const sender = formData.get('sender') as string || 'Admin'

    if (!message?.trim()) return

    // @ts-ignore - Prisma types available after migration
    await prisma.adminChatMessage.create({
        data: { sender, message: message.trim() }
    })

    revalidatePath('/admin/vault')
}

export async function deleteAdminChatMessage(id: string) {
    // @ts-ignore - Prisma types available after migration
    await prisma.adminChatMessage.delete({ where: { id } })
    revalidatePath('/admin/vault')
}

// ===================
// CONNECTED DATABASES (User Counting)
// ===================

export async function getConnectedDatabases() {
    // @ts-ignore - Prisma types available after migration
    return await prisma.connectedDatabase.findMany({
        orderBy: { appName: 'asc' }
    })
}

export async function addConnectedDatabase(formData: FormData) {
    const name = formData.get('name') as string
    const appName = formData.get('appName') as string
    const connectionUrl = formData.get('connectionUrl') as string
    const serviceRole = formData.get('serviceRole') as string || null
    const userTable = formData.get('userTable') as string || 'users'

    // @ts-ignore - Prisma types available after migration
    await prisma.connectedDatabase.create({
        data: { name, appName, connectionUrl, serviceRole, userTable }
    })

    await logAuditAction('database_connected', `Connected database: ${name} for ${appName}`)
    revalidatePath('/admin/vault')
}

export async function updateConnectedDatabase(formData: FormData) {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const appName = formData.get('appName') as string
    const connectionUrl = formData.get('connectionUrl') as string
    const serviceRole = formData.get('serviceRole') as string || null
    const userTable = formData.get('userTable') as string || 'users'

    // @ts-ignore - Prisma types available after migration
    await prisma.connectedDatabase.update({
        where: { id },
        data: { name, appName, connectionUrl, serviceRole, userTable }
    })

    await logAuditAction('database_updated', `Updated database: ${name}`)
    revalidatePath('/admin/vault')
}

export async function deleteConnectedDatabase(id: string) {
    // @ts-ignore - Prisma types available after migration
    const db = await prisma.connectedDatabase.findUnique({ where: { id } })
    
    // @ts-ignore - Prisma types available after migration
    await prisma.connectedDatabase.delete({ where: { id } })

    await logAuditAction('database_deleted', `Deleted database: ${db?.name}`)
    revalidatePath('/admin/vault')
}

export async function refreshUserCount(id: string) {
    // @ts-ignore - Prisma types available after migration
    const db = await prisma.connectedDatabase.findUnique({ where: { id } })
    
    if (!db) return { error: 'Database not found' }

    try {
        // Note: In production, you'd use a separate connection pool for each database
        // This is a simplified version that would need proper implementation
        // For now, we'll simulate with a placeholder
        
        // In real implementation:
        // const externalPrisma = new PrismaClient({ datasources: { db: { url: db.connectionUrl } } })
        // const count = await externalPrisma[db.userTable].count()
        
        // Placeholder - in production, connect to external DB and count
        const count = Math.floor(Math.random() * 1000) + 100 // Simulated for demo

        // @ts-ignore - Prisma types available after migration
        await prisma.connectedDatabase.update({
            where: { id },
            data: {
                lastUserCount: count,
                lastCheckedAt: new Date()
            }
        })

        await logAuditAction('user_count_refreshed', `Refreshed user count for ${db.name}: ${count}`)
        revalidatePath('/admin/vault')

        return { success: true, count }
    } catch (error) {
        return { error: 'Failed to connect to database' }
    }
}

export async function getTotalUsersAcrossApps() {
    // @ts-ignore - Prisma types available after migration
    const databases = await prisma.connectedDatabase.findMany({
        where: { isActive: true }
    })

    let total = 0
    for (const db of databases) {
        if (db.lastUserCount) {
            total += db.lastUserCount
        }
    }

    return { total, databases }
}

// ===================
// KEYGEN LOCKS MANAGEMENT
// ===================

export async function getKeygenLocks() {
    // @ts-ignore - Prisma types available after migration
    return await prisma.keygenLock.findMany({
        orderBy: { lockedAt: 'desc' }
    })
}

export async function unlockKeygenIP(ipAddress: string) {
    // @ts-ignore - Prisma types available after migration
    await prisma.keygenLock.update({
        where: { ipAddress },
        data: {
            isLocked: false,
            unlockedAt: new Date(),
            unlockedBy: 'Admin'
        }
    })

    // Log to vault events
    // @ts-ignore
    await prisma.vaultEvent.create({
        data: {
            eventType: 'ip_unlocked',
            ipAddress,
            details: JSON.stringify({ unlockedBy: 'Admin' }),
            severity: 'info'
        }
    })

    await logAuditAction('keygen_ip_unlocked', `Unlocked keygen IP: ${ipAddress}`)
    revalidatePath('/admin/vault')
}

// ===================
// VAULT EVENTS
// ===================

export async function getVaultEvents(limit = 50) {
    // @ts-ignore - Prisma types available after migration
    return await prisma.vaultEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit
    })
}

export async function getUsedVaultKeys(limit = 20) {
    // @ts-ignore - Prisma types available after migration
    return await prisma.usedVaultKey.findMany({
        orderBy: { usedAt: 'desc' },
        take: limit
    })
}

