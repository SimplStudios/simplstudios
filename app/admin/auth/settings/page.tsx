import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail } from 'lucide-react'
import { getEmailSettings, runAuthManagerMigration } from '@/app/actions/auth-manager'
import { EmailSettingsForm } from '@/components/auth-manager/EmailSettingsForm'

export default async function AuthSettingsPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('admin_session')?.value === 'true'
  if (!isAdmin) notFound()

  await runAuthManagerMigration()

  const settings = await getEmailSettings()

  return (
    <div className="min-h-screen bg-slate-950 py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/auth">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-outfit text-white">Email Settings</h1>
              <p className="text-slate-400 font-jakarta mt-0.5">Configure Resend for password resets, verification & magic links</p>
            </div>
          </div>
        </div>

        <EmailSettingsForm currentSettings={settings} />
      </div>
    </div>
  )
}
