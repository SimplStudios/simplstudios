import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle, Settings, Power } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { updateSiteStatus } from '@/app/actions/messages'

async function getSiteStatus() {
    // @ts-ignore - Prisma types available after migration
    return await prisma.siteStatus.findFirst()
}

export default async function AdminStatusPage() {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'true'

    if (!isAdmin) {
        notFound()
    }

    const status = await getSiteStatus()

    return (
        <div className="min-h-screen bg-slate-950 py-24">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" asChild>
                        <Link href="/admin"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-white">Site Status</h1>
                        <p className="text-slate-400 font-jakarta mt-1">Manage error pages and maintenance mode</p>
                    </div>
                </div>

                {/* Current Status */}
                <Card className={`p-6 mb-8 ${status?.isActive ? 'bg-red-900/20 border-red-800' : 'bg-slate-900/50 border-slate-800'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status?.isActive ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                            {status?.isActive ? (
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            ) : (
                                <Power className="w-6 h-6 text-green-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold font-outfit text-white">
                                {status?.isActive ? 'Status Page Active' : 'Site Running Normally'}
                            </h2>
                            <p className="text-slate-400 font-jakarta">
                                {status?.isActive 
                                    ? 'Users are seeing the status page instead of the normal site'
                                    : 'Users can access the site normally'
                                }
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Status Configuration */}
                <Card className="p-8 bg-slate-900/50 border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <Settings className="w-5 h-5 text-slate-400" />
                        <h2 className="text-xl font-semibold font-outfit text-white">Status Page Configuration</h2>
                    </div>

                    <form action={updateSiteStatus} className="space-y-6">
                        {/* Activation Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                            <div>
                                <h3 className="font-medium text-white font-jakarta">Enable Status Page</h3>
                                <p className="text-sm text-slate-400">When enabled, users will see the status page</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    value="true"
                                    defaultChecked={status?.isActive ?? false}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>

                        {/* Status Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Status Type</label>
                            <select
                                name="type"
                                defaultValue={status?.type ?? 'maintenance'}
                                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                            >
                                <option value="maintenance">🔧 Maintenance</option>
                                <option value="error">❌ Error / Outage</option>
                                <option value="update">🚀 Update in Progress</option>
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Page Title</label>
                            <input
                                name="title"
                                defaultValue={status?.title ?? "We'll be right back"}
                                placeholder="We'll be right back"
                                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Message</label>
                            <textarea
                                name="message"
                                rows={4}
                                defaultValue={status?.message ?? "We're experiencing some technical difficulties. Please check back soon."}
                                placeholder="Explain what's happening..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none resize-none"
                            />
                        </div>

                        {/* Estimated Fix */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">Estimated Fix Time (Optional)</label>
                            <input
                                name="estimatedFix"
                                defaultValue={status?.estimatedFix ?? ''}
                                placeholder="e.g., 30 minutes, 2 hours, End of day"
                                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12">
                            Save Configuration
                        </Button>
                    </form>
                </Card>

                {/* Preview */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold font-outfit text-white mb-4">Preview</h3>
                    <Card className="p-8 bg-slate-900 border-slate-800 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-full mb-6">
                            <AlertTriangle className="w-8 h-8 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-bold font-outfit text-white mb-4">
                            {status?.title || "We'll be right back"}
                        </h2>
                        <p className="text-slate-400 font-jakarta max-w-md mx-auto">
                            {status?.message || "We're experiencing some technical difficulties. Please check back soon."}
                        </p>
                        {status?.estimatedFix && (
                            <p className="text-sm text-slate-500 mt-4 font-jakarta">
                                Estimated time: {status.estimatedFix}
                            </p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}
