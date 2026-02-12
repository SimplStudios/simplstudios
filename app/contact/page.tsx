'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send, CheckCircle, AlertTriangle, Bug, HelpCircle, Mail } from 'lucide-react'
import { createUserMessage } from '@/app/actions/messages'

const messageTypes = [
    { value: 'feedback', label: 'General Feedback', icon: MessageSquare, color: 'blue' },
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'red' },
    { value: 'error', label: 'Site Error', icon: AlertTriangle, color: 'amber' },
    { value: 'question', label: 'Question', icon: HelpCircle, color: 'violet' },
]

export default function ContactPage() {
    const [selectedType, setSelectedType] = useState('feedback')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    async function handleSubmit(formData: FormData) {
        setStatus('loading')
        setErrorMessage('')

        formData.set('type', selectedType)
        const result = await createUserMessage(formData)

        if (result.error) {
            setStatus('error')
            setErrorMessage(result.error)
        } else {
            setStatus('success')
        }
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-slate-950 py-32">
                <div className="max-w-2xl mx-auto px-4">
                    <Card className="p-12 bg-slate-900/50 border-slate-800 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                        <h1 className="text-3xl font-bold font-outfit text-white mb-4">Message Sent!</h1>
                        <p className="text-slate-400 font-jakarta mb-8">
                            Thank you for reaching out. We'll get back to you at the email address you provided.
                        </p>
                        <Button
                            onClick={() => setStatus('idle')}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Send Another Message
                        </Button>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 py-32">
            {/* Hero */}
            <section className="relative mb-16">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
                <div className="relative mx-auto max-w-7xl px-4 pt-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold text-blue-400 font-jakarta uppercase tracking-wide">
                            Get in Touch
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold font-outfit text-white mb-6">
                        Contact Us
                    </h1>
                    <p className="text-xl text-slate-400 font-jakarta max-w-2xl mx-auto">
                        Have feedback, found a bug, or just want to say hi? We'd love to hear from you.
                    </p>
                </div>
            </section>

            <div className="max-w-3xl mx-auto px-4">
                <Card className="p-8 md:p-10 bg-slate-900/50 border-slate-800">
                    {/* Message Type Selection */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-slate-400 mb-4 font-jakarta">
                            What would you like to tell us?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {messageTypes.map((type) => {
                                const Icon = type.icon
                                const isSelected = selectedType === type.value
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setSelectedType(type.value)}
                                        className={`p-4 rounded-xl border transition-all ${
                                            isSelected
                                                ? 'bg-blue-500/10 border-blue-500/50 text-white'
                                                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-blue-400' : ''}`} />
                                        <span className="text-sm font-medium font-jakarta">{type.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <form action={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">
                                    Your Name *
                                </label>
                                <input
                                    name="name"
                                    required
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-jakarta"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">
                                    Email Address *
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-jakarta"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">
                                Subject *
                            </label>
                            <input
                                name="subject"
                                required
                                placeholder="What's this about?"
                                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-jakarta"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">
                                Message *
                            </label>
                            <textarea
                                name="message"
                                required
                                rows={6}
                                placeholder="Tell us more..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-jakarta resize-none"
                            />
                        </div>

                        {status === 'error' && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-jakarta">
                                {errorMessage}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold disabled:opacity-50"
                        >
                            {status === 'loading' ? (
                                'Sending...'
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Message
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6 font-jakarta">
                        We typically respond within 24-48 hours.
                    </p>
                </Card>

                {/* Alternative Contact */}
                <div className="mt-8 text-center">
                    <p className="text-slate-500 font-jakarta">
                        Prefer email? Reach us directly at{' '}
                        <a href="mailto:simplstudios@protonmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                            simplstudios@protonmail.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
