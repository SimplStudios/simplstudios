'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Key, AlertTriangle, CheckCircle } from 'lucide-react'

interface VaultKeyGateProps {
    onValidated: () => void
}

export function VaultKeyGate({ onValidated }: VaultKeyGateProps) {
    const [key, setKey] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [validated, setValidated] = useState(false)
    const [developerName, setDeveloperName] = useState('')

    const handleValidate = async () => {
        if (!key.trim()) {
            setError('Please enter your security key')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/vault/validate-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: key.trim() })
            })

            const result = await response.json()

            if (result.valid) {
                setValidated(true)
                setDeveloperName(result.developer || 'Admin')
                
                // Set vault session cookie via API or just proceed
                // Store in sessionStorage for this session
                sessionStorage.setItem('vault_key_validated', 'true')
                sessionStorage.setItem('vault_developer', result.developer)
                
                // Brief success message then proceed
                setTimeout(() => {
                    onValidated()
                }, 1500)
            } else {
                setError(result.error || 'Invalid key')
                if (result.age) {
                    setError(`Key expired (${result.age}s old, max ${result.maxAge}s)`)
                }
            }
        } catch (err) {
            setError('Validation failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (validated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <Card className="max-w-md w-full bg-slate-900/50 border-green-800/50 p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-xl font-bold font-outfit text-white mb-2">Access Granted</h2>
                    <p className="text-slate-400 font-jakarta">Welcome, {developerName}</p>
                    <p className="text-sm text-slate-500 mt-2">Entering The Vault...</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl" />
            </div>

            <Card className="relative max-w-md w-full bg-slate-900/80 backdrop-blur-xl border-amber-700/30 p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold font-outfit text-white mb-1">The Vault</h1>
                    <p className="text-slate-400 font-jakarta text-sm">Enter your security key to access</p>
                </div>

                {/* Key Input */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                            Security Key
                        </label>
                        <Input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                            placeholder="Enter security key"
                            className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    )}

                    <Button 
                        onClick={handleValidate}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Validating...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Key className="w-4 h-4" />
                                Unlock Vault
                            </span>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    )
}
