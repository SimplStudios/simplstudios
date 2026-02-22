'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Key, Mail, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { resetUserPassword } from '@/app/actions/auth-manager'
import type { ExternalUser } from '@/lib/turso'

export function ResetPasswordDialog({
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
  const [mode, setMode] = useState<'email' | 'direct'>('email')
  const [newPassword, setNewPassword] = useState('')
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)

    const formData = new FormData()
    formData.set('databaseId', databaseId)
    formData.set('userId', user.id)
    formData.set('email', (user.email as string) || '')
    if (mode === 'direct' && newPassword) {
      formData.set('newPassword', newPassword)
    }

    startTransition(async () => {
      const res = await resetUserPassword(formData) as { success?: boolean; error?: string }
      setResult(res)
      if (res.success) {
        router.refresh()
      }
    })
  }

  function handleClose() {
    setResult(null)
    setMode('email')
    setNewPassword('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="font-outfit flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-400" />
            Reset Password
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-jakarta">
            Reset password for <span className="text-white font-medium">{user.email || user.id}</span>
          </DialogDescription>
        </DialogHeader>

        {result?.success ? (
          <div className="py-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-green-400 font-jakarta font-medium mb-1">
              {mode === 'email' ? 'Reset email sent!' : 'Password updated!'}
            </p>
            <p className="text-sm text-slate-400 font-jakarta">
              {mode === 'email'
                ? `A password reset link was sent to ${user.email}`
                : 'The password has been directly updated in the database.'}
            </p>
            <Button onClick={handleClose} variant="ghost" className="mt-4 text-slate-400">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Mode Selector */}
            <div>
              <label className="text-sm text-slate-400 font-jakarta mb-2 block">Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('email')}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-jakarta transition-all ${
                    mode === 'email'
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Send Reset Email
                </button>
                <button
                  type="button"
                  onClick={() => setMode('direct')}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-jakarta transition-all ${
                    mode === 'direct'
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Set Directly
                </button>
              </div>
            </div>

            {mode === 'email' ? (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-300 font-jakarta">
                  A password reset link will be sent to <span className="text-white font-mono">{user.email}</span>.
                  The link expires in 1 hour.
                </p>
              </div>
            ) : (
              <div>
                <label className="text-sm text-slate-400 font-jakarta mb-2 block">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="bg-slate-800 border-slate-700"
                  required={mode === 'direct'}
                  minLength={6}
                />
                <p className="text-xs text-slate-500 mt-1 font-jakarta">
                  Minimum 6 characters. Will be hashed before storage.
                </p>
              </div>
            )}

            {result?.error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-jakarta">{result.error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={handleClose} className="text-slate-400">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || (mode === 'direct' && !newPassword)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                {mode === 'email' ? 'Send Reset Link' : 'Set Password'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
