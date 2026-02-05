'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Megaphone, AlertTriangle, CheckCircle, Rocket, Info } from 'lucide-react'
import type { Announcement } from '@/lib/types'

interface AnnouncementBannerProps {
    announcements: Announcement[]
}

const typeConfig = {
    info: {
        icon: Info,
        bg: 'from-blue-600/20 to-blue-500/10',
        border: 'border-blue-500/30',
        iconColor: 'text-blue-400',
        textColor: 'text-blue-200',
    },
    warning: {
        icon: AlertTriangle,
        bg: 'from-amber-600/20 to-amber-500/10',
        border: 'border-amber-500/30',
        iconColor: 'text-amber-400',
        textColor: 'text-amber-200',
    },
    success: {
        icon: CheckCircle,
        bg: 'from-green-600/20 to-green-500/10',
        border: 'border-green-500/30',
        iconColor: 'text-green-400',
        textColor: 'text-green-200',
    },
    release: {
        icon: Rocket,
        bg: 'from-violet-600/20 to-violet-500/10',
        border: 'border-violet-500/30',
        iconColor: 'text-violet-400',
        textColor: 'text-violet-200',
    },
}

export function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
    const [dismissedIds, setDismissedIds] = useState<string[]>([])
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Load dismissed announcements from localStorage
        const stored = localStorage.getItem('dismissedAnnouncements')
        if (stored) {
            try {
                setDismissedIds(JSON.parse(stored))
            } catch {
                // Invalid JSON, reset
                localStorage.removeItem('dismissedAnnouncements')
            }
        }
    }, [])

    const handleDismiss = (id: string) => {
        const newDismissed = [...dismissedIds, id]
        setDismissedIds(newDismissed)
        localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed))
    }

    // Filter out dismissed and expired announcements
    const activeAnnouncements = announcements.filter((ann) => {
        if (dismissedIds.includes(ann.id)) return false
        if (ann.expiresAt && new Date(ann.expiresAt) < new Date()) return false
        return ann.active
    })

    // Sort by priority (highest first)
    const sortedAnnouncements = activeAnnouncements.sort((a, b) => b.priority - a.priority)

    // Only show the highest priority announcement
    const announcement = sortedAnnouncements[0]

    if (!mounted || !announcement) return null

    const config = typeConfig[announcement.type as keyof typeof typeConfig] || typeConfig.info
    const Icon = config.icon

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`
          relative w-full bg-gradient-to-r ${config.bg}
          border-b ${config.border}
          backdrop-blur-xl
        `}
            >
                <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`shrink-0 ${config.iconColor}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${config.textColor} font-jakarta truncate`}>
                                    <span className="font-bold font-outfit">{announcement.title}</span>
                                    <span className="mx-2 opacity-60">—</span>
                                    <span className="opacity-90">{announcement.content}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDismiss(announcement.id)}
                            className={`shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors ${config.textColor} opacity-70 hover:opacity-100`}
                            aria-label="Dismiss announcement"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Subtle animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
            </motion.div>
        </AnimatePresence>
    )
}
