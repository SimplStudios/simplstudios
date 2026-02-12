import { prisma } from '@/lib/db'
import { AppCard } from '@/components/AppCard'
import { Sparkles, Filter } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Apps',
  description: 'Explore all SimplStudios applications - SimplStudy, SimplStream Web, and SimplStream TV.',
}

async function getApps() {
  const apps = await prisma.app.findMany({
    orderBy: [
      { pinned: 'desc' },      // Pinned apps first
      { pinnedOrder: 'asc' },  // Then by pinned order
      { createdAt: 'asc' },    // Then by creation date
    ],
  })
  return apps
}

export default async function AppsPage() {
  const apps = await getApps()

  const liveApps = apps.filter((app) => app.status === 'live')
  const betaApps = apps.filter((app) => app.status === 'beta')
  const comingSoonApps = apps.filter((app) => app.status === 'coming-soon')

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400 font-jakarta uppercase tracking-wide">
              Our Products
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-outfit text-white mb-6 tracking-tight">
            All Applications
          </h1>
          <p className="text-xl text-slate-400 font-jakarta max-w-2xl mx-auto leading-relaxed">
            From study tools to streaming platforms, we build software that makes your life easier.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pb-32">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500/30 transition-colors">
            <div className="text-4xl font-bold font-rubik text-white mb-2">{apps.length}</div>
            <div className="text-sm font-medium text-slate-400 font-jakarta uppercase tracking-wider">Total Apps</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 text-center hover:border-green-500/30 transition-colors">
            <div className="text-4xl font-bold font-rubik text-green-400 mb-2">{liveApps.length}</div>
            <div className="text-sm font-medium text-slate-400 font-jakarta uppercase tracking-wider">Live</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 text-center hover:border-amber-500/30 transition-colors">
            <div className="text-4xl font-bold font-rubik text-amber-400 mb-2">{betaApps.length}</div>
            <div className="text-sm font-medium text-slate-400 font-jakarta uppercase tracking-wider">In Beta</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 text-center hover:border-violet-500/30 transition-colors">
            <div className="text-4xl font-bold font-rubik text-violet-400 mb-2">{comingSoonApps.length}</div>
            <div className="text-sm font-medium text-slate-400 font-jakarta uppercase tracking-wider">Coming Soon</div>
          </div>
        </div>

        {/* Live Apps */}
        {liveApps.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center gap-4 mb-10 pb-4 border-b border-slate-800">
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
              <h2 className="text-3xl font-bold font-outfit text-white">Live Apps</h2>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-sm font-jakarta font-medium">
                {liveApps.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {liveApps.map((app, index) => (
                <AppCard key={app.id} app={app} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Beta Apps */}
        {betaApps.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center gap-4 mb-10 pb-4 border-b border-slate-800">
              <div className="w-4 h-4 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
              <h2 className="text-3xl font-bold font-outfit text-white">In Beta</h2>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-sm font-jakarta font-medium">
                {betaApps.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {betaApps.map((app, index) => (
                <AppCard key={app.id} app={app} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Coming Soon Apps */}
        {comingSoonApps.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-10 pb-4 border-b border-slate-800">
              <div className="w-4 h-4 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50" />
              <h2 className="text-3xl font-bold font-outfit text-white">Coming Soon</h2>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-sm font-jakarta font-medium">
                {comingSoonApps.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {comingSoonApps.map((app, index) => (
                <AppCard key={app.id} app={app} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
