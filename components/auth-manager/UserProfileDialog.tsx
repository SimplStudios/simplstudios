'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  User, Mail, Shield, Clock, Key, CheckCircle, Ban, LogOut,
  Link2, Loader2, Calendar, AtSign, Trash2
} from 'lucide-react'
import { verifyUserEmail, forceLogout, unbanUser, deleteExternalUserAction } from '@/app/actions/auth-manager'
import { BanUserDialog } from './BanUserDialog'
import { ResetPasswordDialog } from './ResetPasswordDialog'
import { SendEmailDialog } from './SendEmailDialog'
import type { ExternalUser } from '@/lib/turso'

function getAvatarSrc(avatar: unknown): string | null {
  if (!avatar || typeof avatar !== 'string') return null
  if (avatar.startsWith('http') || avatar.startsWith('/') || avatar.startsWith('data:')) return avatar
  if (avatar.startsWith('iVBOR')) return `data:image/png;base64,${avatar}`
  if (avatar.startsWith('/9j/')) return `data:image/jpeg;base64,${avatar}`
  if (avatar.length > 100) return `data:image/png;base64,${avatar}`
  return avatar
}

interface UserWithBan extends ExternalUser {
  banStatus?: {
    reason: string
    type: string
    expiresAt: string | null
    isActive: boolean
  } | null
}

export function UserProfileDialog({
  user,
  databaseId,
  open,
  onClose,
}: {
  user: UserWithBan
  databaseId: string
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState<'verification' | 'magic_link' | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isBanned = user.banStatus?.isActive
  const displayName = user.name || user.username || user.email || 'Unknown User'

  async function handleVerifyEmail() {
    startTransition(async () => {
      await verifyUserEmail(databaseId, user.id)
      router.refresh()
    })
  }

  async function handleForceLogout() {
    startTransition(async () => {
      await forceLogout(databaseId, user.id)
      router.refresh()
    })
  }

  async function handleUnban() {
    startTransition(async () => {
      await unbanUser(databaseId, user.id)
      router.refresh()
    })
  }

  async function handleDelete() {
    startTransition(async () => {
      await deleteExternalUserAction(databaseId, user.id)
      setShowDeleteConfirm(false)
      onClose()
      router.refresh()
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-outfit flex items-center gap-3">
              {getAvatarSrc(user.avatar) ? (
                <img src={getAvatarSrc(user.avatar)!} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg font-bold text-white">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-lg">{displayName}</div>
                {user.username && user.name && (
                  <div className="text-sm text-slate-400 font-normal">@{user.username}</div>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {isBanned ? (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/20">Banned</Badge>
            ) : (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/20">Active</Badge>
            )}
            {user.role && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">{String(user.role)}</Badge>
            )}
            {(user.emailVerified === true || String(user.emailVerified) === '1' || user.emailVerified === '1') ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20">Email Verified</Badge>
            ) : user.emailVerified !== undefined && user.emailVerified !== null ? (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/20">Unverified</Badge>
            ) : null}
          </div>

          {/* Ban Info */}
          {isBanned && user.banStatus && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-3">
              <div className="text-sm font-medium text-red-400 font-jakarta mb-1">Ban Reason</div>
              <p className="text-sm text-slate-300 font-jakarta">{user.banStatus.reason}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span>Type: {user.banStatus.type}</span>
                {user.banStatus.expiresAt && (
                  <span>Expires: {new Date(user.banStatus.expiresAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          )}

          {/* User Details */}
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <DetailItem icon={User} label="ID" value={user.id} mono />
              <DetailItem icon={Mail} label="Email" value={user.email as string} mono />
              {user.username && <DetailItem icon={AtSign} label="Username" value={user.username as string} />}
              {user.role && <DetailItem icon={Shield} label="Role" value={user.role as string} />}
              {user.createdAt && (
                <DetailItem
                  icon={Calendar}
                  label="Joined"
                  value={new Date(user.createdAt as string).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                />
              )}
              {user.lastLogin && (
                <DetailItem
                  icon={Clock}
                  label="Last Login"
                  value={new Date(user.lastLogin as string).toLocaleString()}
                />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-500 uppercase tracking-wide font-jakarta mb-3">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowResetDialog(true)}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 justify-start"
              >
                <Key className="w-4 h-4 mr-2" />
                Reset Password
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleVerifyEmail}
                disabled={isPending}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 justify-start"
              >
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Verify Email
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEmailDialog('verification')}
                className="border-green-500/30 text-green-400 hover:bg-green-500/10 justify-start"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Verification
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEmailDialog('magic_link')}
                className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 justify-start"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Send Magic Link
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleForceLogout}
                disabled={isPending}
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Force Logout
              </Button>
              {isBanned ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUnban}
                  disabled={isPending}
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10 justify-start"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Unban User
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowBanDialog(true)}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 justify-start"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Ban User
                </Button>
              )}

              {/* Delete User */}
              {showDeleteConfirm ? (
                <div className="col-span-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm text-red-400 font-jakarta mb-2">
                    Are you sure you want to delete this user? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleDelete}
                      disabled={isPending}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                      Confirm Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-slate-400"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="col-span-2 border-red-500/30 text-red-400 hover:bg-red-500/10 justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <BanUserDialog user={user} databaseId={databaseId} open={showBanDialog} onClose={() => setShowBanDialog(false)} />
      <ResetPasswordDialog user={user} databaseId={databaseId} open={showResetDialog} onClose={() => setShowResetDialog(false)} />
      {showEmailDialog && (
        <SendEmailDialog user={user} databaseId={databaseId} type={showEmailDialog} open={!!showEmailDialog} onClose={() => setShowEmailDialog(null)} />
      )}
    </>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: any
  label: string
  value?: string
  mono?: boolean
}) {
  if (!value) return null
  return (
    <div className="bg-slate-800/50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-jakarta">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className={`text-sm text-slate-200 truncate ${mono ? 'font-mono' : 'font-jakarta'}`}>
        {value}
      </div>
    </div>
  )
}
