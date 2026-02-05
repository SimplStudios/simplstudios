import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { deleteUpdate } from '@/app/actions/updates'

async function getUpdates() {
    return await prisma.update.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

async function getApps() {
    return await prisma.app.findMany({
        select: { slug: true, name: true }
    })
}

export default async function UpdatesAdminPage() {
    const cookieStore = cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'true'

    if (!isAdmin) {
        redirect('/login')
    }

    const [updates, apps] = await Promise.all([getUpdates(), getApps()])

    const appMap = Object.fromEntries(apps.map(a => [a.slug, a.name]))

    const typeColors: Record<string, string> = {
        release: 'bg-green-500/20 text-green-400 border-green-500/30',
        update: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        fix: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        feature: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    }

    return (
        <div className="min-h-screen bg-slate-950 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin"><ArrowLeft className="w-4 h-4" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold font-outfit text-white">Updates & Changelog</h1>
                            <p className="text-slate-400 font-jakarta mt-1">Manage app updates and release notes</p>
                        </div>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/admin/updates/new">
                            <Plus className="w-4 h-4 mr-2" />
                            New Update
                        </Link>
                    </Button>
                </div>

                {updates.length === 0 ? (
                    <Card className="p-12 bg-slate-900/50 border-slate-800 text-center">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-xl font-bold font-outfit text-white mb-2">No updates yet</h3>
                        <p className="text-slate-400 font-jakarta mb-6">Create your first update or changelog entry</p>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                            <Link href="/admin/updates/new">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Update
                            </Link>
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {updates.map((update) => (
                            <Card key={update.id} className="p-6 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold font-outfit text-white truncate">{update.title}</h3>
                                            <Badge className={typeColors[update.type] || typeColors.update}>
                                                {update.type}
                                            </Badge>
                                            {update.version && (
                                                <span className="text-xs text-slate-500 font-mono">v{update.version}</span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 font-jakarta text-sm line-clamp-2 mb-3">{update.content}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-jakarta">
                                            <span>App: {appMap[update.appSlug] || update.appSlug}</span>
                                            <span>{new Date(update.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-800" asChild>
                                            <Link href={`/admin/updates/${update.id}/edit`}>
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        <form action={async () => {
                                            'use server'
                                            await deleteUpdate(update.id)
                                        }}>
                                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
