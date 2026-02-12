'use server'

import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { logAuditAction, isIPBanned, incrementFailedAttempts, banIP } from './vault'

// Safe error parsing helper
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // 1. Validation Errors
    if (!email || !password) return { error: 'Please enter both email and password.' }
    if (password.length < 6) return { error: 'Password is too short.' }
    if (!email.includes('@')) return { error: 'Please enter a valid email address.' }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        // 2. Account Errors
        if (!user) {
            console.warn(`[Auth] Login attempt for non-existent user: ${email}`)
            return { error: 'Account not found. Please check your email.' }
        }

        // 3. Credential Errors
        const isValid = await verifyPassword(password, user.password)
        if (!isValid) {
            console.warn(`[Auth] Invalid password attempt for: ${email}`)
            return { error: 'Incorrect password. Please try again.' }
        }

        // 4. Role/Status Errors (Future proofing)
        if (user.role !== 'admin') {
            return { error: 'Access denied. You do not have admin privileges.' }
        }

        // 5. Session Errors
        try {
            const cookieStore = await cookies()
            cookieStore.set('admin_session', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            })
        } catch (cookieError) {
            console.error('[Auth] Cookie set failed:', cookieError)
            return { error: 'Failed to establish session. Please enable cookies.' }
        }

    } catch (error: any) {
        console.error('[Auth] Critical Login Error:', error)

        // 6. Database / Prisma Errors
        if (error.code === 'P1001') return { error: 'Cannot connect to database. Please try again later.' }
        if (error.code === 'P1002') return { error: 'Database timeout. Please retry.' }
        if (error.code === 'P1017') return { error: 'Database server closed the connection.' }
        if (error.code === 'P2002') return { error: 'Unique constraint violation detected.' }
        if (error.code === 'P2025') return { error: 'Record not found in database.' }

        // 7. Network / Environment Errors
        const msg = getErrorMessage(error).toLowerCase()
        if (msg.includes('fetch failed')) return { error: 'Network connection failed. Check your internet.' }
        if (msg.includes('econnrefused')) return { error: 'Unable to connect to authentication server.' }
        if (msg.includes('timed out')) return { error: 'Request timed out. Server is busy.' }
        if (msg.includes('client is closed')) return { error: 'Database client is not initialized.' }

        // 8. Payload/Data Errors
        if (msg.includes('invalid input')) return { error: 'Invalid data format received.' }
        if (msg.includes('serialization')) return { error: 'Data serialization failed.' }

        // 9. Generic Fallbacks
        return { error: `System Error: ${msg.slice(0, 50)}... (Check console)` }
    }

    redirect('/admin')
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')
    cookieStore.delete('admin_lock')
    cookieStore.delete('admin_attempts')
    redirect('/')
}

// Secure login for hidden admin page with brute force protection
const ADMIN_USERNAME = 'simplstudiosadmin0365'
const ADMIN_PASSWORD = '^&*9uh8y79T657**98UHuh'
const MAX_ATTEMPTS = 3
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

// Helper to get IP address
async function getClientIP() {
    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    return forwarded?.split(',')[0] || realIp || 'unknown'
}

// Clear lockout cookies (secret admin reset)
export async function clearLockout() {
    const cookieStore = await cookies()
    cookieStore.delete('admin_lock')
    cookieStore.delete('admin_attempts')
}

export async function secureLogin(prevState: any, formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const cookieStore = await cookies()
    const ipAddress = await getClientIP()

    // Check if IP is banned in the database
    try {
        const banned = await isIPBanned(ipAddress)
        if (banned) {
            await logAuditAction('login_blocked_banned_ip', `Blocked banned IP: ${ipAddress}`)
            return { error: 'Access denied. Your IP has been blocked.', locked: true, remainingAttempts: 0 }
        }
    } catch (e) {
        // Continue if vault check fails (db not migrated yet)
    }

    // Check if account is locked via cookies
    const lockCookie = cookieStore.get('admin_lock')
    if (lockCookie) {
        const lockTime = parseInt(lockCookie.value)
        const now = Date.now()
        if (now - lockTime < LOCKOUT_DURATION) {
            return { error: 'Account temporarily locked.', locked: true, remainingAttempts: 0 }
        } else {
            // Lockout expired, clear it
            cookieStore.delete('admin_lock')
            cookieStore.delete('admin_attempts')
        }
    }

    // Get current attempt count
    const attemptsCookie = cookieStore.get('admin_attempts')
    let attempts = attemptsCookie ? parseInt(attemptsCookie.value) : 0

    // Validation
    if (!username || !password) {
        return { error: 'Enter credentials.', locked: false, remainingAttempts: MAX_ATTEMPTS - attempts }
    }

    // Check credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        attempts++
        
        // Log failed attempt to audit
        try {
            await logAuditAction('login_failed', `Failed login attempt ${attempts}/${MAX_ATTEMPTS}`)
            
            // Check if should ban IP based on database records
            const shouldBan = await incrementFailedAttempts(ipAddress)
            if (shouldBan) {
                cookieStore.set('admin_lock', Date.now().toString(), {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: LOCKOUT_DURATION / 1000,
                    path: '/',
                })
                console.error(`[Security] IP ${ipAddress} banned after multiple failed attempts`)
                return { error: 'Access locked. Your IP has been recorded.', locked: true, remainingAttempts: 0 }
            }
        } catch (e) {
            // Continue with cookie-based tracking if vault isn't set up
        }
        
        // Store attempt count in cookies
        cookieStore.set('admin_attempts', attempts.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60, // 1 hour
            path: '/',
        })

        // Check if should lock via cookies
        if (attempts >= MAX_ATTEMPTS) {
            cookieStore.set('admin_lock', Date.now().toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: LOCKOUT_DURATION / 1000,
                path: '/',
            })
            
            // Also ban the IP in database
            try {
                await banIP(ipAddress, 'Cookie-based lockout triggered', false)
            } catch (e) {}
            
            console.error(`[Security] Account locked after ${MAX_ATTEMPTS} failed attempts from IP: ${ipAddress}`)
            return { error: 'Access locked due to multiple failed attempts.', locked: true, remainingAttempts: 0 }
        }

        console.warn(`[Security] Failed login attempt ${attempts}/${MAX_ATTEMPTS} from IP: ${ipAddress}`)
        return { 
            error: 'Invalid credentials.', 
            locked: false, 
            remainingAttempts: MAX_ATTEMPTS - attempts 
        }
    }

    // Success - clear attempts and set session
    cookieStore.delete('admin_attempts')
    cookieStore.delete('admin_lock')
    
    // Log successful login
    try {
        await logAuditAction('login_success', `Successful admin login from IP: ${ipAddress}`)
    } catch (e) {}
    
    cookieStore.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
        sameSite: 'strict',
    })

    console.log(`[Security] Successful admin login from IP: ${ipAddress}`)
    redirect('/admin')
}
