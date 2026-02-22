'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Database, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { connectDatabase } from '@/app/actions/auth-manager'

export function ConnectDatabaseDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success?: boolean; error?: string; databaseId?: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await connectDatabase(formData)
      setResult(res)
      if (res.success) {
        router.push(`/admin/auth?db=${res.databaseId}`)
        router.refresh()
      }
    })
  }

  function handleClose() {
    setResult(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-outfit flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Connect Turso Database
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-jakarta">
            Connect an external Turso database to manage its users.
          </DialogDescription>
        </DialogHeader>

        {result?.success ? (
          <div className="py-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-green-400 font-jakarta font-medium mb-1">Connected!</p>
            <p className="text-sm text-slate-400 font-jakarta">
              Database connected and schema auto-detected. Loading users...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-400 font-jakarta mb-1.5 block">Display Name</label>
                <Input
                  name="name"
                  placeholder="e.g. SimplShare Production"
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 font-jakarta mb-1.5 block">App Name</label>
                <Input
                  name="appName"
                  placeholder="e.g. SimplShare"
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 font-jakarta mb-1.5 block">Turso Database URL</label>
              <Input
                name="connectionUrl"
                placeholder="libsql://your-db.turso.io"
                className="bg-slate-800 border-slate-700 font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 font-jakarta mb-1.5 block">Auth Token</label>
              <Input
                name="authToken"
                type="password"
                placeholder="eyJhbG..."
                className="bg-slate-800 border-slate-700 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1 font-jakarta">
                Your Turso database auth token. Leave empty for local databases.
              </p>
            </div>

            <div>
              <label className="text-sm text-slate-400 font-jakarta mb-1.5 block">Users Table Name</label>
              <Input
                name="userTable"
                placeholder="users"
                defaultValue="users"
                className="bg-slate-800 border-slate-700 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1 font-jakarta">
                The table name that contains user records. Column mapping will be auto-detected.
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
                type="submit"
                disabled={isPending}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                Connect & Detect Schema
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
