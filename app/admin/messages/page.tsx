import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Check, Trash2, MessageSquare, Reply, Bug, AlertTriangle, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { markMessageRead, resolveMessage, deleteMessage, replyToMessage } from '@/app/actions/messages'

// Type for user messages (matches Prisma schema)
interface UserMessage {
    id: string
    name: string
    email: string
    subject: string
    message: string
    type: string
    status: string
    adminReply: string | null
    repliedAt: Date | null
    createdAt: Date
    updatedAt: Date
}

async function getMessages(): Promise<UserMessage[]> {
    // @ts-ignore - Prisma types will be available after migration
    return await prisma.userMessage.findMany({
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
    })
}

const typeIcons: Record<string, any> = {
    feedback: MessageSquare,
    bug: Bug,
    error: AlertTriangle,
    question: HelpCircle,
}

const typeColors: Record<string, string> = {
    feedback: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    bug: 'bg-red-500/10 text-red-400 border-red-500/20',
    error: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    question: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

const statusColors: Record<string, string> = {
    unread: 'bg-red-500/10 text-red-400 border-red-500/20',
    read: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    replied: 'bg-green-500/10 text-green-400 border-green-500/20',
    resolved: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

export default async function AdminMessagesPage() {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'true'

    if (!isAdmin) {
        notFound()
    }

    const messages = await getMessages()

    const unreadCount = messages.filter((m: UserMessage) => m.status === 'unread').length

    return (
        <div className="min-h-screen bg-slate-950 py-24">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild>
                            <Link href="/admin"><ArrowLeft className="w-4 h-4" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold font-outfit text-white">User Messages</h1>
                            <p className="text-slate-400 font-jakarta mt-1">
                                {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages List */}
                {messages.length === 0 ? (
                    <Card className="p-12 bg-slate-900/50 border-slate-800 text-center">
                        <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold font-outfit text-white mb-2">No Messages Yet</h3>
                        <p className="text-slate-400 font-jakarta">User feedback will appear here when they contact you.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message: UserMessage) => {
                            const TypeIcon = typeIcons[message.type] || MessageSquare
                            return (
                                <Card key={message.id} className={`p-6 bg-slate-900/50 border-slate-800 ${message.status === 'unread' ? 'ring-1 ring-blue-500/30' : ''}`}>
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[message.type]}`}>
                                                <TypeIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold font-outfit text-white">{message.subject}</h3>
                                                <p className="text-sm text-slate-400 font-jakarta">
                                                    From: {message.name} ({message.email})
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={`${typeColors[message.type]} capitalize`}>
                                                {message.type}
                                            </Badge>
                                            <Badge className={`${statusColors[message.status]} capitalize`}>
                                                {message.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/50 rounded-xl p-4 mb-4">
                                        <p className="text-slate-300 font-jakarta whitespace-pre-wrap">{message.message}</p>
                                    </div>

                                    {message.adminReply && (
                                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-4">
                                            <p className="text-xs text-blue-400 font-jakarta mb-2 uppercase tracking-wide">Your Reply:</p>
                                            <p className="text-slate-300 font-jakarta whitespace-pre-wrap">{message.adminReply}</p>
                                            {message.repliedAt && (
                                                <p className="text-xs text-slate-500 mt-2">
                                                    Replied on {new Date(message.repliedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-500 font-jakarta">
                                            Received {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString()}
                                        </p>
                                        
                                        <div className="flex items-center gap-2">
                                            {message.status === 'unread' && (
                                                <form action={async () => {
                                                    'use server'
                                                    await markMessageRead(message.id)
                                                }}>
                                                    <Button type="submit" variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                                        <Check className="w-4 h-4 mr-1" />
                                                        Mark Read
                                                    </Button>
                                                </form>
                                            )}

                                            {message.status !== 'resolved' && (
                                                <form action={async () => {
                                                    'use server'
                                                    await resolveMessage(message.id)
                                                }}>
                                                    <Button type="submit" variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                                                        <Check className="w-4 h-4 mr-1" />
                                                        Resolve
                                                    </Button>
                                                </form>
                                            )}

                                            <form action={async () => {
                                                'use server'
                                                await deleteMessage(message.id)
                                            }}>
                                                <Button type="submit" variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </div>

                                    {/* Reply Form */}
                                    {message.status !== 'resolved' && !message.adminReply && (
                                        <form action={replyToMessage} className="mt-4 pt-4 border-t border-slate-800">
                                            <input type="hidden" name="id" value={message.id} />
                                            <div className="flex gap-3">
                                                <textarea
                                                    name="reply"
                                                    required
                                                    placeholder="Write your reply..."
                                                    rows={2}
                                                    className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-jakarta resize-none"
                                                />
                                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 self-end">
                                                    <Reply className="w-4 h-4 mr-1" />
                                                    Reply
                                                </Button>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2 font-jakarta">
                                                Reply will be sent to {message.email}
                                            </p>
                                        </form>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
