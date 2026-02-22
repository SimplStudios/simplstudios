'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { createExternalUserAction } from '@/app/actions/auth-manager'
import type { SchemaMapping } from '@/lib/turso'

export function CreateUserDialog({
  databaseId,
  mapping,
  open,
  onClose,
}: {
  databaseId: string
  mapping: SchemaMapping
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success?: boolean; error?: string; userId?: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)

  function resetForm() {
    setEmail('')
    setName('')
    setUsername('')
    setPassword('')
    setRole('')
    setEmailVerified(false)
    setResult(null)
    setShowPassword(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)

    const formData = new FormData()
    formData.set('databaseId', databaseId)
    formData.set('email', email)
    if (name) formData.set('name', name)
    if (username) formData.set('username', username)
    if (password) formData.set('password', password)
    if (role) formData.set('role', role)
    formData.set('emailVerified', emailVerified ? 'true' : 'false')

    startTransition(async () => {
      const res = await createExternalUserAction(formData)
      setResult(res)
      if (res.success) {
        router.refresh()
      }
    })
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="font-outfit flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-400" />
            Create User
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-jakarta">
            Add a new user to the database
          </DialogDescription>
        </DialogHeader>

        {result?.success ? (
          <div className="py-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-green-400 font-jakarta font-medium mb-1">User created!</p>
            <p className="text-sm text-slate-400 font-jakarta">
              The user has been added to the database.
            </p>
            <Button onClick={handleClose} variant="ghost" className="mt-4 text-slate-400">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            {/* Email - always required */}
            <div>
              <label className="text-sm text-slate-400 font-jakarta mb-1.5 block">
                Email <span className="text-red-400">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>

            {/* Name - if mapped */}
            {mapping.nameColumn && (
              <div>
                <label className="text-sm text-slate-400 font-jakarta mb-1.5 block">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            )}

            {/* Username - if mapped */}
            {mapping.usernameColumn && (
              <div>
                <label className="text-sm text-slate-400 font-jakarta mb-1.5 block">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            )}

            {/* Password - if mapped */}
            {mapping.passwordColumn && (
              <div>
                <label className="text-sm text-slate-400 font-jakarta mb-1.5 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 chars)"
                    className="bg-slate-800 border-slate-700 pr-10"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-jakarta">Will be hashed before storage.</p>
              </div>
            )}

            {/* Role - if mapped */}
            {mapping.roleColumn && (
              <div>
                <label className="text-sm text-slate-400 font-jakarta mb-1.5 block">Role</label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. user, admin"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            )}

            {/* Email Verified - if mapped */}
            {mapping.emailVerifiedColumn && (
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={emailVerified}
                  onChange={(e) => setEmailVerified(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30"
                />
                <span className="text-sm text-slate-300 font-jakarta">Mark email as verified</span>
              </label>
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
                disabled={isPending || !email}
                className="bg-green-600 hover:bg-green-700"
              >
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Create User
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
