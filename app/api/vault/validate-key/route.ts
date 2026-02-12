import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createHash } from 'crypto'

// Valid access codes (hex encoded)
// "80019" = 3830303139
// "Andy" = 416e6479
// "Brody" = 42726f6479
// "Steven" = 5374657665 (note: original has typo with 'n')
// "Jade" = 4a616465
const VALID_CODE_HEXES = [
    '3830303139', // 80019
    '416e6479',   // Andy
    '42726f6479', // Brody
    '5374657665', // Steve (corrected)
    '4a616465'    // Jade
]

const TTL_SECONDS = 180 // 3 minutes

/**
 * POST /api/vault/validate-key
 * Validates a security key for vault access
 * 
 * Body: { key: string }
 * 
 * Key format: {HEX_CODE}_{HEX_NAME}_{32_CHAR_PAYLOAD}_{YYYYMMDD}_simplstudios
 * 
 * Payload structure:
 * [0-6]   Base36 timestamp
 * [7-9]   Interaction speed (001-999)
 * [10]    Name length checksum
 * [11-14] Instance ID
 * [15-31] Random entropy
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { key } = body

        // Get requester info
        const forwarded = request.headers.get('x-forwarded-for')
        const realIp = request.headers.get('x-real-ip')
        const ipAddress = forwarded?.split(',')[0] || realIp || 'unknown'
        const userAgent = request.headers.get('user-agent')

        if (!key || typeof key !== 'string') {
            await logValidationAttempt(ipAddress, userAgent, 'missing_key', false)
            return NextResponse.json({ valid: false, error: 'Key required' }, { status: 400 })
        }

        // Parse key structure
        const parts = key.split('_')
        if (parts.length !== 5 || parts[4] !== 'simplstudios') {
            await logValidationAttempt(ipAddress, userAgent, 'invalid_format', false)
            return NextResponse.json({ valid: false, error: 'Invalid key format' }, { status: 400 })
        }

        const [hexCode, hexName, payload, dateStamp, suffix] = parts

        // Validate access code
        if (!VALID_CODE_HEXES.includes(hexCode.toLowerCase())) {
            await logValidationAttempt(ipAddress, userAgent, 'invalid_code', false, { hexCode })
            return NextResponse.json({ valid: false, error: 'Invalid access code' }, { status: 401 })
        }

        // Validate payload length
        if (payload.length !== 32) {
            await logValidationAttempt(ipAddress, userAgent, 'invalid_payload', false)
            return NextResponse.json({ valid: false, error: 'Invalid payload' }, { status: 400 })
        }

        // Extract timestamp from payload [0-6] (base36)
        const timestampBase36 = payload.substring(0, 7)
        const keyTimestamp = parseInt(timestampBase36, 36) * 1000
        const now = Date.now()
        const age = (now - keyTimestamp) / 1000

        // Check TTL
        if (age > TTL_SECONDS || age < -30) { // Allow 30s clock skew
            await logValidationAttempt(ipAddress, userAgent, 'expired', false, { age: Math.floor(age) })
            return NextResponse.json({ 
                valid: false, 
                error: 'Key expired', 
                age: Math.floor(age),
                maxAge: TTL_SECONDS 
            }, { status: 401 })
        }

        // Extract instance ID [11-14]
        const instanceId = payload.substring(11, 15)

        // Check if instance ID already used (prevent replay)
        let existingUse = null
        try {
            // @ts-ignore
            existingUse = await prisma.usedVaultKey.findUnique({
                where: { instanceId }
            })
        } catch (dbError) {
            // Table might not exist yet, continue without replay check
            console.warn('[Vault API] usedVaultKey table may not exist:', dbError)
        }

        if (existingUse) {
            await logValidationAttempt(ipAddress, userAgent, 'replay_attempt', false, { instanceId })
            return NextResponse.json({ 
                valid: false, 
                error: 'Key already used',
                usedAt: existingUse.usedAt 
            }, { status: 401 })
        }

        // Extract interaction speed [7-9]
        const interactionSpeed = parseInt(payload.substring(7, 10))
        
        // Flag suspiciously fast interactions (potential bot)
        const isSuspicious = interactionSpeed < 5 // Less than 500ms total

        // Decode developer name for logging
        const developerName = hexToString(hexName)

        // Hash the full key for storage
        const keyHash = createHash('sha256').update(key).digest('hex')

        // Store the used key (if table exists)
        try {
            // @ts-ignore
            await prisma.usedVaultKey.create({
                data: {
                    instanceId,
                    fullKeyHash: keyHash,
                    developerHex: hexName,
                    ipAddress,
                    generatedAt: new Date(keyTimestamp)
                }
            })
        } catch (dbError) {
            // Table might not exist, continue anyway
            console.warn('[Vault API] Could not store used key:', dbError)
        }

        // Log successful validation
        await logValidationAttempt(ipAddress, userAgent, 'success', true, {
            developer: developerName,
            instanceId,
            age: Math.floor(age),
            interactionSpeed,
            suspicious: isSuspicious
        })

        return NextResponse.json({
            valid: true,
            developer: developerName,
            generatedAt: new Date(keyTimestamp).toISOString(),
            age: Math.floor(age),
            suspicious: isSuspicious,
            message: isSuspicious ? 'Key valid but flagged for review' : 'Key validated successfully'
        })

    } catch (error) {
        console.error('[Vault API] Validate key error:', error)
        return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 })
    }
}

// Helper: Hex to string
function hexToString(hex: string): string {
    try {
        let str = ''
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16))
        }
        return str
    } catch {
        return 'Unknown'
    }
}

// Helper: Log validation attempts
async function logValidationAttempt(
    ip: string, 
    userAgent: string | null, 
    result: string, 
    success: boolean,
    details?: Record<string, any>
) {
    try {
        // @ts-ignore
        await prisma.vaultEvent.create({
            data: {
                eventType: success ? 'key_validated' : 'key_validation_failed',
                ipAddress: ip,
                userAgent,
                details: details ? JSON.stringify({ result, ...details }) : JSON.stringify({ result }),
                severity: success ? 'info' : 'warning'
            }
        })
    } catch (e) {
        console.error('Failed to log validation attempt:', e)
    }
}
