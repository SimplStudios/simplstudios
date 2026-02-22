'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Mail, Key, Globe, Loader2, CheckCircle, AlertCircle,
  Send, Eye, EyeOff
} from 'lucide-react'
import { saveEmailSettings, testEmailConnection } from '@/app/actions/auth-manager'

export function EmailSettingsForm({
  currentSettings,
}: {
  currentSettings: {
    resendApiKey: string | null
    fromEmail: string
    appUrl: string
    configured: boolean
  }
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showKey, setShowKey] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [saveResult, setSaveResult] = useState<{ success?: boolean; error?: string } | null>(null)
  const [testResult, setTestResult] = useState<{ success?: boolean; error?: string } | null>(null)

  function maskKey(key: string | null): string {
    if (!key) return ''
    if (key.length <= 10) return key
    return key.slice(0, 6) + '••••••••••••' + key.slice(-4)
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaveResult(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await saveEmailSettings(formData) as { success?: boolean; error?: string }
      setSaveResult(res)
      if (res.success) {
        router.refresh()
      }
    })
  }

  async function handleTest() {
    if (!testEmail) return
    setTestResult(null)

    const formData = new FormData()
    formData.set('testEmail', testEmail)

    startTransition(async () => {
      const res = await testEmailConnection(formData) as { success?: boolean; error?: string }
      setTestResult(res)
    })
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      <Card className={`p-4 border ${currentSettings.configured ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
        <div className="flex items-center gap-3">
          {currentSettings.configured ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-sm font-medium text-green-400 font-jakarta">Resend Configured</div>
                <div className="text-xs text-slate-400 font-jakarta">
                  Sending from <span className="text-white font-mono">{currentSettings.fromEmail}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-sm font-medium text-amber-400 font-jakarta">Not Configured</div>
                <div className="text-xs text-slate-400 font-jakarta">
                  Add your Resend API key to enable email features.
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Settings Form */}
      <Card className="bg-slate-900/50 border-slate-800 p-6">
        <h3 className="font-outfit font-semibold text-white mb-6 flex items-center gap-2">
          <Key className="w-5 h-5 text-cyan-400" />
          Email Configuration
        </h3>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-sm text-slate-400 font-jakarta mb-1.5 block">Resend API Key</label>
            <div className="relative">
              <Input
                name="resendApiKey"
                type={showKey ? 'text' : 'password'}
                defaultValue={currentSettings.resendApiKey || ''}
                placeholder="re_xxxxxxxxxxxx"
                className="bg-slate-800 border-slate-700 font-mono text-sm pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-jakarta">
              Get your API key from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">resend.com/api-keys</a>
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-400 font-jakarta mb-1.5 block">From Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                name="fromEmail"
                type="email"
                defaultValue={currentSettings.fromEmail}
                placeholder="noreply@yourdomain.com"
                className="bg-slate-800 border-slate-700 text-sm pl-10"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 font-jakarta">
              Use <span className="font-mono text-slate-400">onboarding@resend.dev</span> for testing, or verify your own domain in Resend.
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-400 font-jakarta mb-1.5 block">App URL</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                name="appUrl"
                type="url"
                defaultValue={currentSettings.appUrl}
                placeholder="https://yourapp.com"
                className="bg-slate-800 border-slate-700 text-sm pl-10"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 font-jakarta">
              Base URL used for password reset and verification links.
            </p>
          </div>

          {saveResult?.error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-jakarta">{saveResult.error}</span>
            </div>
          )}

          {saveResult?.success && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="font-jakarta">Settings saved successfully!</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="bg-cyan-600 hover:bg-cyan-700 w-full"
          >
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
            Save Settings
          </Button>
        </form>
      </Card>

      {/* Test Email */}
      <Card className="bg-slate-900/50 border-slate-800 p-6">
        <h3 className="font-outfit font-semibold text-white mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-violet-400" />
          Test Email
        </h3>
        <p className="text-sm text-slate-400 font-jakarta mb-4">
          Send a test email to verify your Resend configuration is working.
        </p>

        <div className="flex gap-2">
          <Input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your@email.com"
            className="bg-slate-800 border-slate-700 text-sm"
          />
          <Button
            onClick={handleTest}
            disabled={isPending || !testEmail || !currentSettings.configured}
            variant="outline"
            className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 shrink-0"
          >
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send Test
          </Button>
        </div>

        {!currentSettings.configured && (
          <p className="text-xs text-amber-400 mt-2 font-jakarta">
            Save your API key first before testing.
          </p>
        )}

        {testResult?.error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg mt-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-jakarta">{testResult.error}</span>
          </div>
        )}

        {testResult?.success && (
          <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 p-3 rounded-lg mt-3">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="font-jakarta">Test email sent! Check your inbox.</span>
          </div>
        )}
      </Card>
    </div>
  )
}
