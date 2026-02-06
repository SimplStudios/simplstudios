import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { createUpdate } from '@/app/actions/updates'

async function getApps() {
    return await prisma.app.findMany({
        select: { slug: true, name: true, icon: true },
        orderBy: { name: 'asc' }
    })
}

export default async function NewUpdatePage() {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'true'

    if (!isAdmin) {
        redirect('/login')
    }

    const apps = await getApps()

    return (
        <div className="min-h-screen bg-slate-950 py-24">
            <div className="max-w-3xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" asChild>
                        <Link href="/admin/updates"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <h1 className="text-3xl font-bold font-outfit text-white">Create Update</h1>
                </div>

                <Card className="p-8 bg-slate-900 border-slate-800">
                    <form action={createUpdate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">App *</label>
                            <select
                                name="appSlug"
                                required
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">Select an app...</option>
                                {apps.map((app) => (
                                    <option key={app.slug} value={app.slug}>
                                        {app.icon} {app.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Title *</label>
                            <input
                                name="title"
                                required
                                placeholder="SimplStudy 2.0 is here!"
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Content *</label>
                            <textarea
                                name="content"
                                required
                                rows={5}
                                placeholder="Describe the update in detail..."
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Version</label>
                                <input
                                    name="version"
                                    placeholder="2.0.0"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Type</label>
                                <select
                                    name="type"
                                    defaultValue="update"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="release">🚀 Release</option>
                                    <option value="update">📦 Update</option>
                                    <option value="fix">🔧 Fix</option>
                                    <option value="feature">✨ Feature</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex justify-end gap-4">
                            <Button type="button" variant="ghost" asChild>
                                <Link href="/admin/updates">Cancel</Link>
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Update
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}
