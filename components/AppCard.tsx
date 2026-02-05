'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, getAppBorderColor } from '@/lib/utils'
import type { App } from '@/lib/types'

interface AppCardProps {
  app: App
  index?: number
  featured?: boolean
}

export function AppCard({ app, index }: { app: App; index: number }) {
  return (
    <div className="group relative bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
      {/* Icon */}
      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
        {app.icon}
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold font-outfit text-white mb-2 group-hover:text-blue-400 transition-colors">
        {app.name}
      </h3>

      <p className="text-slate-400 font-jakarta leading-relaxed mb-6 line-clamp-2">
        {app.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-2">
          {app.status === 'live' && (
            <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-semibold font-jakarta border border-green-500/20">
              Live
            </span>
          )}
          <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-semibold font-jakarta border border-slate-700">
            {app.platforms[0].charAt(0).toUpperCase() + app.platforms[0].slice(1)}
          </span>
        </div>

        <Link
          href={`/apps/${app.slug}`}
          className="inline-flex items-center text-blue-400 hover:text-white font-semibold font-rubik transition-colors group/link"
        >
          Details
          <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}

interface AppCardFullProps {
  app: App
}

export function AppCardFull({ app }: AppCardFullProps) {
  const statusVariant = app.status === 'live' ? 'live' : app.status === 'beta' ? 'beta' : 'coming-soon'

  return (
    <Card className="overflow-hidden">
      {/* Header with gradient */}
      <div className={cn(
        'relative h-32 bg-gradient-to-r',
        app.color === 'blue' && 'from-blue-600 to-blue-400',
        app.color === 'violet' && 'from-violet-600 to-violet-400',
        app.color === 'cyan' && 'from-cyan-600 to-cyan-400',
      )}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="absolute bottom-4 left-6 text-6xl">{app.icon}</div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold font-outfit text-white mb-2">
              {app.name}
            </h2>
            <p className="text-lg text-slate-400 font-jakarta">
              {app.tagline}
            </p>
          </div>
          <Badge variant={statusVariant}>
            {app.status === 'live' ? 'Live' : app.status === 'beta' ? 'Beta' : 'Coming Soon'}
          </Badge>
        </div>

        <p className="text-slate-300 font-jakarta mb-6 leading-relaxed">
          {app.description}
        </p>

        {/* Platforms */}
        <div className="flex flex-wrap gap-2 mb-6">
          {app.platforms.map((platform) => (
            <Badge key={platform} variant="platform">
              {platform}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        {app.url && (
          <Button asChild className="w-full sm:w-auto">
            <a href={app.url} target="_blank" rel="noopener noreferrer">
              Launch App
              <ExternalLink className="ml-2 w-4 h-4" />
            </a>
          </Button>
        )}
      </div>
    </Card>
  )
}
