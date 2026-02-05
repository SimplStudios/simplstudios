import { prisma } from '@/lib/db'
import { UpdateCard } from '@/components/UpdateCard'
import { Newspaper } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Updates',
  description: 'Stay up to date with the latest releases, features, and improvements across all SimplStudios apps.',
}

interface UpdatesPageProps {
  searchParams: { app?: string }
}

async function getUpdates(appSlug?: string) {
  const updates = await prisma.update.findMany({
    where: appSlug ? { appSlug } : undefined,
    orderBy: { createdAt: 'desc' },
  })
  return updates
}

async function getApps() {
  const apps = await prisma.app.findMany({
    select: { slug: true, name: true, icon: true },
    orderBy: { createdAt: 'asc' },
  })
  return apps
}

export default async function UpdatesPage({ searchParams }: UpdatesPageProps) {
  const [updates, apps] = await Promise.all([
    getUpdates(searchParams.app),
    getApps(),
  ])

  const selectedApp = apps.find((app) => app.slug === searchParams.app)

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-slate-950" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
            <Newspaper className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400 font-jakarta uppercase tracking-wide">
              Changelog
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-outfit text-white mb-6 tracking-tight">
            Latest Updates
          </h1>
          <p className="text-xl text-slate-400 font-jakarta max-w-2xl mx-auto leading-relaxed">
            Stay in the loop with our latest releases, features, and improvements.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pb-32">
        {/* Filter by App */}
        <div className="mb-16">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/updates">
              <div
                className={`flex items-center px-5 py-2.5 rounded-xl border transition-all duration-200 ${!searchParams.app
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
              >
                <span className="font-medium font-jakarta">All Apps</span>
              </div>
            </Link>
            {apps.map((app) => (
              <Link key={app.slug} href={`/updates?app=${app.slug}`}>
                <div
                  className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all duration-200 ${searchParams.app === app.slug
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                >
                  <span className="text-lg">{app.icon}</span>
                  <span className="font-medium font-jakarta">{app.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Selected App Info */}
        {selectedApp && (
          <div className="mb-12 text-center animate-fade-in">
            <p className="text-slate-400 font-jakarta text-lg">
              Showing updates for{' '}
              <span className="text-white font-semibold">{selectedApp.icon} {selectedApp.name}</span>
            </p>
          </div>
        )}

        {/* Updates List */}
        {updates.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="relative pl-8">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-800" />
              {updates.map((update, index) => (
                <div key={update.id} className="relative pl-8 mb-8 last:mb-0">
                  <div className="absolute left-0 top-8 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 border-4 border-blue-500 z-10" />
                  <UpdateCard update={update} index={index} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-900/50 rounded-3xl border border-slate-800">
            <div className="text-7xl mb-6">📭</div>
            <h3 className="text-2xl font-bold font-outfit text-white mb-3">
              No updates yet
            </h3>
            <p className="text-slate-400 font-jakarta text-lg">
              {selectedApp
                ? `No updates found for ${selectedApp.name}.`
                : 'Check back soon for updates!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
