'use server'

import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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
            cookies().set('admin_session', 'true', {
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
    cookies().delete('admin_session')
    redirect('/login')
}
