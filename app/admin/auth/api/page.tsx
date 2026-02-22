import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Code2 } from 'lucide-react'
import { getEmailSettings } from '@/app/actions/auth-manager'
import { ApiDocsContent } from '@/components/auth-manager/ApiDocsContent'

export default async function AuthApiDocsPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('admin_session')?.value === 'true'
  if (!isAdmin) notFound()

  const settings = await getEmailSettings()
  const baseUrl = settings.appUrl || 'https://simplstudios.vercel.app'

  return (
    <div className="min-h-screen bg-slate-950 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/auth">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-outfit text-white">API Documentation</h1>
              <p className="text-slate-400 font-jakarta mt-0.5">Integrate Auth Manager into your SimplStudios apps</p>
            </div>
          </div>
        </div>

        <ApiDocsContent baseUrl={baseUrl} />
      </div>
    </div>
  )
}
