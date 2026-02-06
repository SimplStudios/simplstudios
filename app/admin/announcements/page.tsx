import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, ArrowLeft, Power } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { deleteAnnouncement, toggleAnnouncement } from '@/app/actions/announcements'

async function getAnnouncements() {
    return await prisma.announcement.findMany({
        orderBy: [{ active: 'desc' }, { priority: 'desc' }, { createdAt: 'desc' }]
    })
}

export default async function AnnouncementsAdminPage() {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'true'

    if (!isAdmin) {
        redirect('/login')
    }

    const announcements = await getAnnouncements()

    const typeConfig: Record<string, { color: string; label: string }> = {
        info: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: '📘 Info' },
        warning: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: '⚠️ Warning' },
        success: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: '✅ Success' },
        release: { color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', label: '🚀 Release' },
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
                            <h1 className="text-3xl font-bold font-outfit text-white">Announcements</h1>
                            <p className="text-slate-400 font-jakarta mt-1">Manage homepage banner announcements</p>
                        </div>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/admin/announcements/new">
                            <Plus className="w-4 h-4 mr-2" />
                            New Announcement
                        </Link>
                    </Button>
                </div>

                {announcements.length === 0 ? (
                    <Card className="p-12 bg-slate-900/50 border-slate-800 text-center">
                        <div className="text-4xl mb-4">📢</div>
                        <h3 className="text-xl font-bold font-outfit text-white mb-2">No announcements yet</h3>
                        <p className="text-slate-400 font-jakarta mb-6">Create your first homepage announcement</p>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                            <Link href="/admin/announcements/new">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Announcement
                            </Link>
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <Card key={announcement.id} className={`p-6 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors ${!announcement.active ? 'opacity-60' : ''}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <h3 className="text-lg font-bold font-outfit text-white">{announcement.title}</h3>
                                            <Badge className={typeConfig[announcement.type]?.color || typeConfig.info.color}>
                                                {typeConfig[announcement.type]?.label || announcement.type}
                                            </Badge>
                                            {announcement.active ? (
                                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                                            ) : (
                                                <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Inactive</Badge>
                                            )}
                                            <span className="text-xs text-slate-500 font-mono">Priority: {announcement.priority}</span>
                                        </div>
                                        <p className="text-slate-400 font-jakarta text-sm line-clamp-2 mb-3">{announcement.content}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-jakarta">
                                            <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                                            {announcement.expiresAt && (
                                                <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <form action={async () => {
                                            'use server'
                                            await toggleAnnouncement(announcement.id)
                                        }}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className={`border-slate-700 ${announcement.active ? 'hover:bg-green-500/10 hover:border-green-500/30' : 'hover:bg-slate-800'}`}
                                                title={announcement.active ? 'Deactivate' : 'Activate'}
                                            >
                                                <Power className={`w-4 h-4 ${announcement.active ? 'text-green-400' : 'text-slate-400'}`} />
                                            </Button>
                                        </form>
                                        <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-800" asChild>
                                            <Link href={`/admin/announcements/${announcement.id}/edit`}>
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        <form action={async () => {
                                            'use server'
                                            await deleteAnnouncement(announcement.id)
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
