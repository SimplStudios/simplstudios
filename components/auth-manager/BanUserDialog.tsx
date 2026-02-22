'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Ban, Clock, Infinity, Loader2 } from 'lucide-react'
import { banUser } from '@/app/actions/auth-manager'
import type { ExternalUser } from '@/lib/turso'

export function BanUserDialog({
  user,
  databaseId,
  open,
  onClose,
}: {
  user: ExternalUser
  databaseId: string
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [type, setType] = useState<'permanent' | 'temporary'>('permanent')
  const [duration, setDuration] = useState('24')
  const [reason, setReason] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData()
    formData.set('databaseId', databaseId)
    formData.set('userId', user.id)
    formData.set('email', (user.email as string) || '')
    formData.set('reason', reason)
    formData.set('type', type)
    if (type === 'temporary') formData.set('duration', duration)

    startTransition(async () => {
      await banUser(formData)
      onClose()
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="font-outfit flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-400" />
            Ban User
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-jakarta">
            Ban <span className="text-white font-medium">{user.email || user.name || user.id}</span> from this application.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Ban Type */}
          <div>
            <label className="text-sm text-slate-400 font-jakarta mb-2 block">Ban Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('permanent')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-jakarta transition-all ${
                  type === 'permanent'
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Infinity className="w-4 h-4" />
                Permanent
              </button>
              <button
                type="button"
                onClick={() => setType('temporary')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-jakarta transition-all ${
                  type === 'temporary'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Clock className="w-4 h-4" />
                Temporary
              </button>
            </div>
          </div>

          {/* Duration (if temporary) */}
          {type === 'temporary' && (
            <div>
              <label className="text-sm text-slate-400 font-jakarta mb-2 block">Duration (hours)</label>
              <div className="flex gap-2">
                {['1', '6', '24', '72', '168'].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDuration(h)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-jakarta transition-all ${
                      duration === h
                        ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                        : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {h === '1' ? '1h' : h === '6' ? '6h' : h === '24' ? '1d' : h === '72' ? '3d' : '7d'}
                  </button>
                ))}
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-20 bg-slate-800 border-slate-700 text-sm h-8"
                  min="1"
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="text-sm text-slate-400 font-jakarta mb-2 block">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this user being banned?"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none h-20 font-jakarta"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !reason}
              variant="destructive"
            >
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ban className="w-4 h-4 mr-2" />}
              Ban User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
