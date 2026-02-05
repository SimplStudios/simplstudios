import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { updateApp, deleteApp } from '@/app/actions/apps'
import { revalidatePath } from 'next/cache'

export default async function EditAppPage({ params }: { params: { slug: string } }) {
    const cookieStore = cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'true'

    if (!isAdmin) {
        redirect('/login')
    }

    const app = await prisma.app.findUnique({
        where: { slug: params.slug }
    })

    if (!app) return <div className="min-h-screen bg-slate-950 py-24 flex items-center justify-center text-white">App not found</div>

    return (
        <div className="min-h-screen bg-slate-950 py-24">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild>
                            <Link href="/admin"><ArrowLeft className="w-4 h-4" /></Link>
                        </Button>
                        <h1 className="text-3xl font-bold font-outfit text-white">Edit {app.name}</h1>
                    </div>
                    <form action={async () => {
                        'use server'
                        await deleteApp(app.id)
                    }}>
                        <Button type="submit" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete App
                        </Button>
                    </form>
                </div>

                <Card className="p-8 bg-slate-900 border-slate-800">
                    <form action={updateApp} className="space-y-8">
                        <input type="hidden" name="id" value={app.id} />

                        {/* Basic Info Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold font-outfit text-white border-b border-slate-800 pb-2">Basic Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">App Name *</label>
                                    <input
                                        name="name"
                                        required
                                        defaultValue={app.name}
                                        className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Icon (Emoji) *</label>
                                    <input
                                        name="icon"
                                        required
                                        defaultValue={app.icon}
                                        className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none text-2xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Tagline *</label>
                                <input
                                    name="tagline"
                                    required
                                    defaultValue={app.tagline}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Description *</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    defaultValue={app.description}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Visual & Branding Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold font-outfit text-white border-b border-slate-800 pb-2">Visual & Branding</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Theme Color</label>
                                    <select
                                        name="color"
                                        defaultValue={app.color}
                                        className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="blue">Blue</option>
                                        <option value="violet">Violet</option>
                                        <option value="cyan">Cyan</option>
                                        <option value="green">Green</option>
                                        <option value="amber">Amber</option>
                                        <option value="rose">Rose</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Status</label>
                                    <select
                                        name="status"
                                        defaultValue={app.status}
                                        className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="live">Live</option>
                                        <option value="beta">Beta</option>
                                        <option value="coming-soon">Coming Soon</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">
                                    Screenshots (one URL per line)
                                </label>
                                <textarea
                                    name="screenshots"
                                    rows={3}
                                    defaultValue={app.screenshots.join('\n')}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                                />
                            </div>
                        </div>

                        {/* Features & Details Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold font-outfit text-white border-b border-slate-800 pb-2">Features & Details</h2>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">
                                    Features (one per line)
                                </label>
                                <textarea
                                    name="features"
                                    rows={5}
                                    defaultValue={app.features.join('\n')}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">
                                    Platforms (comma-separated)
                                </label>
                                <input
                                    name="platforms"
                                    defaultValue={app.platforms.join(', ')}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                />
                                <p className="text-xs text-slate-500 mt-1 font-jakarta">Options: web, ios, android, tv, android-tv, fire-tv</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">App URL</label>
                                <input
                                    name="url"
                                    type="url"
                                    defaultValue={app.url || ''}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
                            <Button type="button" variant="ghost" asChild>
                                <Link href="/admin">Cancel</Link>
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}
