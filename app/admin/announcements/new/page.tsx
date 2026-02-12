import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { createAnnouncement } from '@/app/actions/announcements'

export default async function NewAnnouncementPage() {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'true'

    if (!isAdmin) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-slate-950 py-24">
            <div className="max-w-3xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" asChild>
                        <Link href="/admin/announcements"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <h1 className="text-3xl font-bold font-outfit text-white">Create Announcement</h1>
                </div>

                <Card className="p-8 bg-slate-900 border-slate-800">
                    <form action={createAnnouncement} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Title *</label>
                            <input
                                name="title"
                                required
                                placeholder="🎉 SimplStudy 2.0 is now live!"
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Content *</label>
                            <textarea
                                name="content"
                                required
                                rows={3}
                                placeholder="A brief message for the announcement banner..."
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Type</label>
                                <select
                                    name="type"
                                    defaultValue="info"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="info">📘 Info</option>
                                    <option value="warning">⚠️ Warning</option>
                                    <option value="success">✅ Success</option>
                                    <option value="release">🚀 Release</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Priority</label>
                                <input
                                    name="priority"
                                    type="number"
                                    defaultValue="0"
                                    placeholder="0"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                />
                                <p className="text-xs text-slate-500 mt-1 font-jakarta">Higher = shows first</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Active</label>
                                <select
                                    name="active"
                                    defaultValue="true"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="true">Yes - Show on homepage</option>
                                    <option value="false">No - Hidden</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Expires At</label>
                                <input
                                    name="expiresAt"
                                    type="datetime-local"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                />
                                <p className="text-xs text-slate-500 mt-1 font-jakarta">Leave empty for no expiry</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex justify-end gap-4">
                            <Button type="button" variant="ghost" asChild>
                                <Link href="/admin/announcements">Cancel</Link>
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Announcement
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}
