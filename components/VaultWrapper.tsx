'use client'

import { useState, useEffect } from 'react'
import { VaultKeyGate } from './VaultKeyGate'

interface VaultWrapperProps {
    children: React.ReactNode
}

export function VaultWrapper({ children }: VaultWrapperProps) {
    const [validated, setValidated] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        // Check if already validated in this session
        const isValidated = sessionStorage.getItem('vault_key_validated') === 'true'
        setValidated(isValidated)
        setChecking(false)
    }, [])

    if (checking) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
        )
    }

    if (!validated) {
        return <VaultKeyGate onValidated={() => setValidated(true)} />
    }

    return <>{children}</>
}
