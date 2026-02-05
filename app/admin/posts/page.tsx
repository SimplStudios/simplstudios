import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Pin, MessageCircle, Heart, Megaphone } from 'lucide-react'
import { deletePost, togglePinPost } from '@/app/actions/posts'

export default async function AdminPostsPage() {
    const cookieStore = cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'true'

    if (!isAdmin) {
        redirect('/login')
    }

    const posts = await prisma.post.findMany({
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        include: {
            _count: {
                select: { comments: true, likes: true }
            }
        }
    })

    const typeColors: Record<string, string> = {
        announcement: 'bg-blue-500/20 text-blue-400',
        update: 'bg-violet-500/20 text-violet-400',
        release: 'bg-green-500/20 text-green-400',
        news: 'bg-amber-500/20 text-amber-400',
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(new Date(date))
    }

    return (
        <div className="min-h-screen bg-slate-950 py-24">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" asChild>
                        <Link href="/admin"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold font-outfit text-white">Message Board Posts</h1>
                        <p className="text-slate-400 font-jakarta text-sm">Manage homepage announcements and updates</p>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/admin/posts/new">
                            <Plus className="w-4 h-4 mr-2" />
                            New Post
                        </Link>
                    </Button>
                </div>

                {posts.length === 0 ? (
                    <Card className="p-12 bg-slate-900 border-slate-800 text-center">
                        <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 font-jakarta">No posts yet. Create your first post!</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <Card key={post.id} className={`p-6 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors ${post.pinned ? 'ring-2 ring-amber-500/30' : ''}`}>
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <Badge className={typeColors[post.type] || typeColors.announcement}>
                                                {post.type}
                                            </Badge>
                                            {post.pinned && (
                                                <Badge className="bg-amber-500/20 text-amber-400">
                                                    <Pin className="w-3 h-3 mr-1" />
                                                    Pinned
                                                </Badge>
                                            )}
                                            <span className="text-xs text-slate-500 font-jakarta">
                                                {formatDate(post.createdAt)}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold font-outfit text-white mb-2">{post.title}</h3>
                                        <p className="text-slate-400 font-jakarta text-sm line-clamp-2">{post.content}</p>
                                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Heart className="w-4 h-4" />
                                                {post._count.likes}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="w-4 h-4" />
                                                {post._count.comments}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <form action={async () => { 'use server'; await togglePinPost(post.id) }}>
                                            <Button size="sm" variant="outline" className={`border-slate-700 hover:bg-slate-800 ${post.pinned ? 'text-amber-400' : ''}`}>
                                                <Pin className="w-4 h-4" />
                                            </Button>
                                        </form>
                                        <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-800" asChild>
                                            <Link href={`/admin/posts/${post.id}/edit`}>
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        <form action={async () => { 'use server'; await deletePost(post.id) }}>
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
