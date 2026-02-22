'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Mail, Link2, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { sendVerificationEmailAction, sendMagicLinkAction } from '@/app/actions/auth-manager'
import type { ExternalUser } from '@/lib/turso'

export function SendEmailDialog({
  user,
  databaseId,
  type,
  open,
  onClose,
}: {
  user: ExternalUser
  databaseId: string
  type: 'verification' | 'magic_link'
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

  const isVerification = type === 'verification'
  const title = isVerification ? 'Send Verification Email' : 'Send Magic Link'
  const description = isVerification
    ? 'Send an email verification link to this user.'
    : 'Send a passwordless sign-in link to this user.'
  const icon = isVerification ? Mail : Link2
  const iconColor = isVerification ? 'text-emerald-400' : 'text-violet-400'
  const buttonColor = isVerification ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-violet-600 hover:bg-violet-700'
  const expiry = isVerification ? '24 hours' : '15 minutes'
  const Icon = icon

  async function handleSend() {
    setResult(null)
    const formData = new FormData()
    formData.set('databaseId', databaseId)
    formData.set('userId', user.id)
    formData.set('email', (user.email as string) || '')

    startTransition(async () => {
      const action = isVerification ? sendVerificationEmailAction : sendMagicLinkAction
      const res = await action(formData)
      setResult(res)
      if (res.success) router.refresh()
    })
  }

  function handleClose() {
    setResult(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="font-outfit flex items-center gap-2">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-jakarta">
            {description}
          </DialogDescription>
        </DialogHeader>

        {result?.success ? (
          <div className="py-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-green-400 font-jakarta font-medium mb-1">Email sent!</p>
            <p className="text-sm text-slate-400 font-jakarta">
              {isVerification ? 'Verification' : 'Magic sign-in'} link sent to <span className="text-white font-mono">{user.email}</span>
            </p>
            <Button onClick={handleClose} variant="ghost" className="mt-4 text-slate-400">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-sm text-slate-300 font-jakarta">
                {isVerification
                  ? `A verification link will be sent to `
                  : `A one-time sign-in link will be sent to `}
                <span className="text-white font-mono">{user.email}</span>.
                The link expires in {expiry}.
              </p>
            </div>

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
                onClick={handleSend}
                disabled={isPending}
                className={buttonColor}
              >
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Icon className="w-4 h-4 mr-2" />}
                Send {isVerification ? 'Verification' : 'Magic Link'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
