import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Plus, Image, Info } from 'lucide-react'
import { createPost } from '@/app/actions/posts'

export default async function NewPostPage() {
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
                        <Link href="/admin/posts"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <h1 className="text-3xl font-bold font-outfit text-white">Create Post</h1>
                </div>

                <Card className="p-8 bg-slate-900 border-slate-800">
                    <form action={createPost} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Title *</label>
                            <input
                                name="title"
                                required
                                placeholder="Post title"
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">
                                Content * <span className="text-blue-400">(Markdown supported)</span>
                            </label>
                            <textarea
                                name="content"
                                required
                                rows={8}
                                placeholder="Write your post content... Supports **bold**, *italic*, [links](url), and more!"
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                            />
                            <p className="text-xs text-slate-500 mt-2 font-jakarta">
                                <Info className="w-3 h-3 inline mr-1" />
                                Supports GitHub-flavored markdown: **bold**, *italic*, `code`, [links](url), lists, etc.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta flex items-center gap-2">
                                <Image className="w-4 h-4" />
                                Image URL (optional)
                            </label>
                            <input
                                name="imageUrl"
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-2 font-jakarta">
                                Attach an image to display at the top of your post
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Type</label>
                                <select
                                    name="type"
                                    defaultValue="announcement"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="announcement">📢 Announcement</option>
                                    <option value="update">📦 Update</option>
                                    <option value="release">🚀 Release</option>
                                    <option value="news">📰 News</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Pin Post</label>
                                <div className="flex items-center gap-2 h-[42px]">
                                    <input
                                        type="checkbox"
                                        name="pinned"
                                        id="pinned"
                                        className="w-5 h-5 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="pinned" className="text-slate-400 font-jakarta">Pin to top</label>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex justify-end gap-4">
                            <Button type="button" variant="ghost" asChild>
                                <Link href="/admin/posts">Cancel</Link>
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Post
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}
