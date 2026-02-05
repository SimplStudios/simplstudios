'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, cn } from '@/lib/utils'
import { Rocket, Zap, Megaphone } from 'lucide-react'
import type { Update } from '@/lib/types'

interface UpdateCardProps {
  update: Update
  index?: number
}

export function UpdateCard({ update, index = 0 }: UpdateCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'release':
        return <Rocket className="w-5 h-5" />
      case 'update':
        return <Zap className="w-5 h-5" />
      case 'announcement':
        return <Megaphone className="w-5 h-5" />
      default:
        return <Zap className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'release':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'update':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'announcement':
        return 'text-violet-400 bg-violet-500/10 border-violet-500/20'
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 group">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Icon */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110 duration-300",
            getTypeColor(update.type)
          )}>
            {getTypeIcon(update.type)}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h3 className="text-xl font-bold font-outfit text-white group-hover:text-blue-400 transition-colors">
                {update.title}
              </h3>
              {update.version && (
                <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400">
                  v{update.version}
                </span>
              )}
            </div>

            <p className="text-slate-400 font-jakarta mb-4 leading-relaxed">
              {update.content}
            </p>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="font-medium font-jakarta text-slate-400">{formatDate(update.createdAt)}</span>
              </div>
              <span className="text-slate-700">|</span>
              <span className="text-blue-400 font-medium capitalize font-jakarta tracking-wide">
                {update.appSlug.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
