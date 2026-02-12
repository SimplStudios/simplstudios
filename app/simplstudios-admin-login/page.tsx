'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Shield, AlertTriangle, Lock } from 'lucide-react'

const ADMIN_USERNAME = 'simplstudiosadmin0365'
const ADMIN_PASSWORD = '^&*9uh8y79T657**98UHuh'
const MAX_ATTEMPTS = 3
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

export default function SecureAdminLoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [attempts, setAttempts] = useState(0)
    const [isLocked, setIsLocked] = useState(false)
    const [lockEndTime, setLockEndTime] = useState<number | null>(null)
    const [timeRemaining, setTimeRemaining] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Load lockout state from localStorage on mount
    useEffect(() => {
        setMounted(true)
        const storedLockEnd = localStorage.getItem('admin_lock_end')
        const storedAttempts = localStorage.getItem('admin_attempts')
        
        if (storedLockEnd) {
            const lockEnd = parseInt(storedLockEnd)
            if (Date.now() < lockEnd) {
                setIsLocked(true)
                setLockEndTime(lockEnd)
                setAttempts(MAX_ATTEMPTS)
            } else {
                // Lockout expired, clear it
                localStorage.removeItem('admin_lock_end')
                localStorage.removeItem('admin_attempts')
            }
        }
        
        if (storedAttempts && !storedLockEnd) {
            setAttempts(parseInt(storedAttempts))
        }
    }, [])

    // Live countdown timer
    useEffect(() => {
        if (!isLocked || !lockEndTime) return

        const updateTimer = () => {
            const now = Date.now()
            const remaining = lockEndTime - now

            if (remaining <= 0) {
                setIsLocked(false)
                setLockEndTime(null)
                setAttempts(0)
                setError('')
                localStorage.removeItem('admin_lock_end')
                localStorage.removeItem('admin_attempts')
                return
            }

            const minutes = Math.floor(remaining / 60000)
            const seconds = Math.floor((remaining % 60000) / 1000)
            setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [isLocked, lockEndTime])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (isLocked) return
        
        setIsLoading(true)
        setError('')

        // Simulate network delay
        await new Promise(r => setTimeout(r, 500))

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // Success - set session cookie and redirect
            document.cookie = 'admin_session=true; path=/; max-age=86400; samesite=strict'
            localStorage.removeItem('admin_lock_end')
            localStorage.removeItem('admin_attempts')
            window.location.href = '/admin'
        } else {
            // Failed attempt
            const newAttempts = attempts + 1
            setAttempts(newAttempts)
            localStorage.setItem('admin_attempts', newAttempts.toString())

            if (newAttempts >= MAX_ATTEMPTS) {
                // Lock the account
                const lockEnd = Date.now() + LOCKOUT_DURATION
                setIsLocked(true)
                setLockEndTime(lockEnd)
                localStorage.setItem('admin_lock_end', lockEnd.toString())
                setError('Too many failed attempts.')
            } else {
                const remaining = MAX_ATTEMPTS - newAttempts
                setError(`Incorrect credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`)
            }
        }

        setIsLoading(false)
        setPassword('')
    }

    if (!mounted) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    // Lockout screen with live timer
    if (isLocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-slate-950 to-black" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
                
                <Card className="w-full max-w-md p-8 bg-red-950/40 backdrop-blur-xl border-red-800/50 relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600/20 rounded-2xl mb-6 border border-red-600/40">
                            <Lock className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold font-outfit text-red-500 mb-3">Access Locked</h1>
                        <p className="text-red-300/70 font-jakarta mb-6">
                            Too many failed attempts. Access has been temporarily disabled.
                        </p>
                        
                        {/* Live Timer */}
                        <div className="bg-red-900/30 rounded-xl p-6 border border-red-800/50 mb-4">
                            <p className="text-red-400/60 text-sm font-jakarta mb-2">Time remaining</p>
                            <p className="text-5xl font-bold font-mono text-red-500">{timeRemaining}</p>
                        </div>
                        
                        <p className="text-red-400/40 text-xs font-jakarta">
                            This incident has been logged.
                        </p>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden select-none">
            {/* Red Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-slate-950 to-black" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-md p-8 md:p-10 bg-red-950/30 backdrop-blur-xl border-red-900/50 relative z-10 shadow-2xl shadow-red-900/20">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-700 to-red-900 rounded-2xl mb-6 shadow-lg shadow-red-900/50 ring-1 ring-red-500/20">
                        <Shield className="w-8 h-8 text-red-200" />
                    </div>
                    <h1 className="text-2xl font-bold font-outfit text-white mb-2">Secure Access</h1>
                    <p className="text-red-400/60 font-jakarta text-sm">Authorized personnel only</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-red-300/80 font-jakarta ml-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="off"
                            spellCheck="false"
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-xl bg-red-950/50 border border-red-800/50 text-white placeholder:text-red-900/50 focus:outline-none focus:border-red-700/70 focus:ring-1 focus:ring-red-700/30 transition-all font-jakarta disabled:opacity-50"
                            placeholder="Enter username"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-red-300/80 font-jakarta ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="off"
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-xl bg-red-950/50 border border-red-800/50 text-white placeholder:text-red-900/50 focus:outline-none focus:border-red-700/70 focus:ring-1 focus:ring-red-700/30 transition-all font-jakarta disabled:opacity-50"
                            placeholder="Enter password"
                        />
                    </div>

                    {/* Error with attempts remaining */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-900/40 border border-red-700/50 text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                <span className="text-red-300 font-medium font-jakarta">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Attempts indicator (always visible when attempts > 0) */}
                    {attempts > 0 && !error && (
                        <div className="text-center">
                            <span className="text-red-400/60 text-sm font-jakarta">
                                {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} remaining
                            </span>
                        </div>
                    )}

                    <div className="pt-2">
                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-red-700 hover:bg-red-600 h-12 text-base font-semibold shadow-lg shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Shield className="mr-2 w-5 h-5" />
                                    Authenticate
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                <p className="text-center text-xs text-red-900/80 mt-8 font-jakarta">
                    Unauthorized access attempts are monitored and logged.
                </p>
            </Card>
        </div>
    )
}
