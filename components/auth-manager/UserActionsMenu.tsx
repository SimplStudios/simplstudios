'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Key, Mail, Link2, Ban, ShieldOff, LogOut, Trash2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BanUserDialog } from './BanUserDialog'
import { ResetPasswordDialog } from './ResetPasswordDialog'
import { SendEmailDialog } from './SendEmailDialog'
import { unbanUser, verifyUserEmail, forceLogout, deleteExternalUserAction } from '@/app/actions/auth-manager'
import type { ExternalUser } from '@/lib/turso'

interface UserWithBan extends ExternalUser {
  banStatus?: {
    reason: string
    type: string
    expiresAt: string | null
    isActive: boolean
  } | null
}

export function UserActionsMenu({
  user,
  databaseId,
}: {
  user: UserWithBan
  databaseId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showMenu, setShowMenu] = useState(false)
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState<'verification' | 'magic_link' | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isBanned = user.banStatus?.isActive

  async function handleUnban() {
    startTransition(async () => {
      await unbanUser(databaseId, user.id)
      setShowMenu(false)
      router.refresh()
    })
  }

  async function handleVerifyEmail() {
    startTransition(async () => {
      await verifyUserEmail(databaseId, user.id)
      setShowMenu(false)
      router.refresh()
    })
  }

  async function handleForceLogout() {
    startTransition(async () => {
      await forceLogout(databaseId, user.id)
      setShowMenu(false)
      router.refresh()
    })
  }

  async function handleDelete() {
    startTransition(async () => {
      await deleteExternalUserAction(databaseId, user.id)
      setShowMenu(false)
      setShowDeleteConfirm(false)
      router.refresh()
    })
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMenu(!showMenu)}
          className="text-slate-400 hover:text-white h-8 w-8 p-0"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
              {/* Reset Password */}
              <button
                onClick={() => { setShowResetDialog(true); setShowMenu(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-jakarta"
              >
                <Key className="w-4 h-4 text-blue-400" />
                Reset Password
              </button>

              {/* Verify Email */}
              <button
                onClick={handleVerifyEmail}
                disabled={isPending}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-jakarta disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
                Verify Email
              </button>

              {/* Send Verification Email */}
              <button
                onClick={() => { setShowEmailDialog('verification'); setShowMenu(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-jakarta"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                Send Verification Email
              </button>

              {/* Send Magic Link */}
              <button
                onClick={() => { setShowEmailDialog('magic_link'); setShowMenu(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-jakarta"
              >
                <Link2 className="w-4 h-4 text-violet-400" />
                Send Magic Link
              </button>

              <div className="my-1 border-t border-slate-800" />

              {/* Ban / Unban */}
              {isBanned ? (
                <button
                  onClick={handleUnban}
                  disabled={isPending}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-green-400 hover:bg-green-500/10 transition-colors font-jakarta disabled:opacity-50"
                >
                  <ShieldOff className="w-4 h-4" />
                  Unban User
                </button>
              ) : (
                <button
                  onClick={() => { setShowBanDialog(true); setShowMenu(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors font-jakarta"
                >
                  <Ban className="w-4 h-4" />
                  Ban User
                </button>
              )}

              {/* Force Logout */}
              <button
                onClick={handleForceLogout}
                disabled={isPending}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-jakarta disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 text-orange-400" />
                Force Logout
              </button>

              <div className="my-1 border-t border-slate-800" />

              {/* Delete */}
              {showDeleteConfirm ? (
                <div className="px-3 py-2">
                  <p className="text-xs text-red-400 mb-2 font-jakarta">Are you sure? This cannot be undone.</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isPending}
                      className="text-xs h-7"
                    >
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-xs h-7 text-slate-400"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-jakarta"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Dialogs */}
      <BanUserDialog
        user={user}
        databaseId={databaseId}
        open={showBanDialog}
        onClose={() => setShowBanDialog(false)}
      />
      <ResetPasswordDialog
        user={user}
        databaseId={databaseId}
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
      />
      {showEmailDialog && (
        <SendEmailDialog
          user={user}
          databaseId={databaseId}
          type={showEmailDialog}
          open={!!showEmailDialog}
          onClose={() => setShowEmailDialog(null)}
        />
      )}
    </>
  )
}
