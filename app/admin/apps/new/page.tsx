import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { createApp } from '@/app/actions/apps'

export default async function NewAppPage() {
    const cookieStore = cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'true'

    if (!isAdmin) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-slate-950 py-24">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" asChild>
                        <Link href="/admin"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <h1 className="text-3xl font-bold font-outfit text-white">Create New App</h1>
                </div>

                <Card className="p-8 bg-slate-900 border-slate-800">
                    <form action={createApp} className="space-y-8">
                        {/* Basic Info Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold font-outfit text-white border-b border-slate-800 pb-2">Basic Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">App Name *</label>
                                    <input
                                        name="name"
                                        required
                                        placeholder="SimplStudy"
                                        className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Icon (Emoji) *</label>
                                    <input
                                        name="icon"
                                        required
                                        placeholder="📚"
                                        className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none text-2xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Tagline *</label>
                                <input
                                    name="tagline"
                                    required
                                    placeholder="Your AI-powered study companion"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Description *</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    placeholder="A detailed description of your app..."
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
                                        defaultValue="blue"
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
                                        defaultValue="coming-soon"
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
                                    placeholder="https://example.com/screenshot1.png&#10;https://example.com/screenshot2.png"
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
                                    placeholder="AI-powered flashcard generation&#10;Smart note summarization&#10;Interactive quizzes&#10;Progress tracking"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">
                                    Platforms (comma-separated)
                                </label>
                                <input
                                    name="platforms"
                                    placeholder="web, ios, android, tv"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                />
                                <p className="text-xs text-slate-500 mt-1 font-jakarta">Options: web, ios, android, tv, android-tv, fire-tv</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">App URL</label>
                                <input
                                    name="url"
                                    type="url"
                                    placeholder="https://yourapp.vercel.app"
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
                                <Plus className="w-4 h-4 mr-2" />
                                Create App
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}
