'use client'

import { useFormState } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Lock, ArrowRight } from 'lucide-react'
import { login } from '@/app/actions/auth'
import Link from 'next/link'

const initialState = {
    error: '',
}

function SubmitButton() {
    return (
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base shadow-lg shadow-blue-600/20">
            Sign In to Dashboard
            <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
    )
}

export default function LoginPage() {
    const [state, formAction] = useFormState(login, initialState)

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-slate-950" />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-slate-950 to-slate-950" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <Card className="w-full max-w-md p-8 md:p-10 bg-slate-900/50 backdrop-blur-xl border-slate-800 relative z-10 shadow-2xl">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-6 shadow-lg shadow-blue-600/20 ring-1 ring-white/10">
                        <Lock className="w-8 h-8 text-white" />
                    </Link>
                    <h1 className="text-3xl font-bold font-outfit text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-400 font-jakarta">Enter your credentials to access the admin portal.</p>
                </div>

                <form action={formAction} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 font-jakarta ml-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-jakarta"
                            placeholder="admin@simplstudios.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 font-jakarta ml-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-jakarta"
                            placeholder="••••••••"
                        />
                    </div>

                    {state?.error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium animate-fade-in">
                            {state.error}
                        </div>
                    )}

                    <div className="pt-2">
                        <SubmitButton />
                    </div>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        <Link href="/" className="hover:text-white transition-colors">
                            &larr; Return to Website
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    )
}
