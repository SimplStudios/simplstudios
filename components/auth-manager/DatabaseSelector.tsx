'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Database, Plus, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface ConnectedDB {
  id: string
  name: string
  appName: string
  userTable: string
  lastUserCount: number | null
}

export function DatabaseSelector({
  databases,
  selectedId,
  onConnectNew,
}: {
  databases: ConnectedDB[]
  selectedId: string | null
  onConnectNew?: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function selectDatabase(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('db', id)
    params.delete('page')
    params.delete('search')
    router.push(`/admin/auth?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {databases.map((db) => (
        <button
          key={db.id}
          onClick={() => selectDatabase(db.id)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all ${
            selectedId === db.id
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <div className="text-left">
            <div className="text-sm font-medium font-jakarta">{db.appName}</div>
            <div className="text-xs text-slate-500">{db.name}</div>
          </div>
        </button>
      ))}
      {onConnectNew && (
        <button
          onClick={onConnectNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-jakarta">Connect Database</span>
        </button>
      )}
    </div>
  )
}
