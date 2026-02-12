'use client'

import { useFormState } from 'react-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Shield, AlertTriangle } from 'lucide-react'
import { secureLogin } from '@/app/actions/auth'

const initialState = {
    error: '',
    locked: false,
    remainingAttempts: 3,
}

// DevTools detection component
function useDevToolsDetection() {
    const [devToolsOpen, setDevToolsOpen] = useState(false)

    useEffect(() => {
        const threshold = 160

        const checkDevTools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold
            const heightThreshold = window.outerHeight - window.innerHeight > threshold
            
            if (widthThreshold || heightThreshold) {
                setDevToolsOpen(true)
            }
        }

        // Check on resize
        const handleResize = () => {
            checkDevTools()
        }

        // Disable right-click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            return false
        }

        // Disable common keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // F12
            if (e.key === 'F12') {
                e.preventDefault()
                setDevToolsOpen(true)
                return false
            }
            // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
                e.preventDefault()
                setDevToolsOpen(true)
                return false
            }
            // Ctrl+U (view source)
            if (e.ctrlKey && e.key.toUpperCase() === 'U') {
                e.preventDefault()
                return false
            }
        }

        // Detect debugger statement
        const detectDebugger = () => {
            const start = performance.now()
            // This is intentionally empty - debugger detection
            const end = performance.now()
            if (end - start > 100) {
                setDevToolsOpen(true)
            }
        }

        window.addEventListener('resize', handleResize)
        document.addEventListener('contextmenu', handleContextMenu)
        document.addEventListener('keydown', handleKeyDown)
        
        const interval = setInterval(detectDebugger, 1000)
        checkDevTools()

        return () => {
            window.removeEventListener('resize', handleResize)
            document.removeEventListener('contextmenu', handleContextMenu)
            document.removeEventListener('keydown', handleKeyDown)
            clearInterval(interval)
        }
    }, [])

    return devToolsOpen
}

function SubmitButton({ disabled }: { disabled: boolean }) {
    return (
        <Button 
            type="submit" 
            disabled={disabled}
            className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Shield className="mr-2 w-4 h-4" />
            Authenticate
        </Button>
    )
}

export default function SecureAdminLoginPage() {
    const [state, formAction] = useFormState(secureLogin, initialState)
    const devToolsOpen = useDevToolsDetection()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        
        // Disable console methods
        if (typeof window !== 'undefined') {
            const noop = () => {}
            const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'dirxml', 'group', 'groupEnd', 'time', 'timeEnd', 'assert', 'profile']
            methods.forEach(method => {
                (console as any)[method] = noop
            })
        }
    }, [])

    // Show warning if DevTools detected
    if (devToolsOpen && mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-red-950 to-black" />
                <Card className="w-full max-w-md p-8 bg-red-900/30 backdrop-blur-xl border-red-800 relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/20 rounded-2xl mb-6 border border-red-600/30">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold font-outfit text-red-400 mb-2">Security Violation</h1>
                        <p className="text-red-300/70 font-jakarta">
                            Developer tools detected. Access denied.
                        </p>
                        <p className="text-red-400/50 text-sm mt-4 font-jakarta">
                            This incident has been logged.
                        </p>
                    </div>
                </Card>
            </div>
        )
    }

    // Show lockout screen
    if (state?.locked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-slate-950 to-slate-950" />
                <Card className="w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl border-red-800/50 relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/20 rounded-2xl mb-6 border border-red-600/30">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold font-outfit text-red-400 mb-2">Access Locked</h1>
                        <p className="text-slate-400 font-jakarta">
                            Too many failed attempts. Access has been temporarily disabled.
                        </p>
                        <p className="text-slate-500 text-sm mt-4 font-jakarta">
                            Try again in 15 minutes or contact system administrator.
                        </p>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden select-none">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-slate-950" />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/50 via-slate-950 to-slate-950" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-md p-8 md:p-10 bg-slate-900/50 backdrop-blur-xl border-slate-800 relative z-10 shadow-2xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl mb-6 shadow-lg ring-1 ring-white/5">
                        <Shield className="w-8 h-8 text-slate-400" />
                    </div>
                    <h1 className="text-2xl font-bold font-outfit text-white mb-2">Secure Access</h1>
                    <p className="text-slate-500 font-jakarta text-sm">Authorized personnel only</p>
                </div>

                <form action={formAction} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 font-jakarta ml-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            required
                            autoComplete="off"
                            spellCheck="false"
                            className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-700 focus:outline-none focus:border-slate-700 transition-all font-jakarta"
                            placeholder="Enter username"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 font-jakarta ml-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            autoComplete="off"
                            className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-700 focus:outline-none focus:border-slate-700 transition-all font-jakarta"
                            placeholder="Enter password"
                        />
                    </div>

                    {state?.error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
                            {state.error}
                            {state.remainingAttempts !== undefined && state.remainingAttempts > 0 && (
                                <span className="block text-xs mt-1 text-red-400/60">
                                    {state.remainingAttempts} attempt{state.remainingAttempts !== 1 ? 's' : ''} remaining
                                </span>
                            )}
                        </div>
                    )}

                    <div className="pt-2">
                        <SubmitButton disabled={state?.locked || false} />
                    </div>
                </form>

                <p className="text-center text-xs text-slate-600 mt-8 font-jakarta">
                    Unauthorized access attempts are monitored and logged.
                </p>
            </Card>
        </div>
    )
}
