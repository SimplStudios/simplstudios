import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Plus, ExternalLink, Trash2, BarChart3, Star, MessageSquare, Megaphone, FileText } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

async function getApps() {
    return await prisma.app.findMany({ orderBy: { createdAt: 'desc' } })
}

async function getStats() {
    const [appsCount, updatesCount, reviewsCount, postsCount] = await Promise.all([
        prisma.app.count(),
        prisma.update.count(),
        prisma.review.count(),
        prisma.post.count(),
    ])
    return { appsCount, updatesCount, reviewsCount, postsCount }
}

export default async function AdminDashboard() {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'true'

    if (!isAdmin) {
        redirect('/login')
    }

    const [apps, stats] = await Promise.all([getApps(), getStats()])

    return (
        <div className="min-h-screen bg-slate-950 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-white">Admin Dashboard</h1>
                        <p className="text-slate-400 font-jakarta mt-1">Manage your apps, content, and reviews</p>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/admin/apps/new">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New App
                        </Link>
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <Card className="p-5 bg-slate-900/50 border-slate-800 hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold font-rubik text-white">{stats.appsCount}</div>
                                <div className="text-xs text-slate-400 font-jakarta uppercase tracking-wide">Apps</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-5 bg-slate-900/50 border-slate-800 hover:border-violet-500/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold font-rubik text-white">{stats.updatesCount}</div>
                                <div className="text-xs text-slate-400 font-jakarta uppercase tracking-wide">Updates</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-5 bg-slate-900/50 border-slate-800 hover:border-amber-500/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <Star className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold font-rubik text-white">{stats.reviewsCount}</div>
                                <div className="text-xs text-slate-400 font-jakarta uppercase tracking-wide">Reviews</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-5 bg-slate-900/50 border-slate-800 hover:border-green-500/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <Megaphone className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold font-rubik text-white">{stats.postsCount}</div>
                                <div className="text-xs text-slate-400 font-jakarta uppercase tracking-wide">Posts</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <Link href="/admin/updates" className="group">
                        <Card className="p-4 bg-slate-900/50 border-slate-800 hover:border-violet-500/50 transition-all group-hover:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-violet-400" />
                                <span className="font-medium text-white font-jakarta group-hover:text-violet-400 transition-colors">Manage Updates</span>
                            </div>
                        </Card>
                    </Link>
                    <Link href="/admin/reviews" className="group">
                        <Card className="p-4 bg-slate-900/50 border-slate-800 hover:border-amber-500/50 transition-all group-hover:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-amber-400" />
                                <span className="font-medium text-white font-jakarta group-hover:text-amber-400 transition-colors">Manage Reviews</span>
                            </div>
                        </Card>
                    </Link>
                    <Link href="/admin/posts" className="group">
                        <Card className="p-4 bg-slate-900/50 border-slate-800 hover:border-green-500/50 transition-all group-hover:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <Megaphone className="w-5 h-5 text-green-400" />
                                <span className="font-medium text-white font-jakarta group-hover:text-green-400 transition-colors">Message Board</span>
                            </div>
                        </Card>
                    </Link>
                </div>

                {/* Apps Section Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold font-outfit text-white">Your Apps</h2>
                </div>

                {/* Apps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps.map((app) => (
                        <Card key={app.id} className="p-6 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-4xl">{app.icon}</div>
                                <Badge variant={app.status as 'live' | 'beta' | 'coming-soon'}>
                                    {app.status}
                                </Badge>
                            </div>
                            <h3 className="text-xl font-bold font-outfit text-white mb-2">{app.name}</h3>
                            <p className="text-slate-400 font-jakarta text-sm mb-6 line-clamp-2">
                                {app.description}
                            </p>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-300" asChild>
                                    <Link href={`/admin/apps/${app.slug}`}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Link>
                                </Button>
                                <Button size="sm" variant="ghost" className="w-full text-slate-400 hover:text-white" asChild>
                                    <Link href={`/apps/${app.slug}`} target="_blank">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Preview
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
