import { prisma } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, X, Star, Trash2, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { approveReview, rejectReview, toggleFeatureReview, deleteReview, respondToReview } from '@/app/actions/reviews'

async function getReviews() {
    return await prisma.review.findMany({
        orderBy: [{ approved: 'asc' }, { createdAt: 'desc' }]
    })
}

async function getApps() {
    return await prisma.app.findMany({
        select: { slug: true, name: true }
    })
}

export default async function ReviewsAdminPage() {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'true'

    if (!isAdmin) {
        notFound()
    }

    const [reviews, apps] = await Promise.all([getReviews(), getApps()])
    const appMap = Object.fromEntries(apps.map(a => [a.slug, a.name]))

    const pendingReviews = reviews.filter(r => !r.approved)
    const approvedReviews = reviews.filter(r => r.approved)

    return (
        <div className="min-h-screen bg-slate-950 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin"><ArrowLeft className="w-4 h-4" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold font-outfit text-white">Reviews</h1>
                            <p className="text-slate-400 font-jakarta mt-1">Manage user reviews and responses</p>
                        </div>
                    </div>
                </div>

                {/* Pending Reviews */}
                {pendingReviews.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-bold font-outfit text-white mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
                            Pending Approval ({pendingReviews.length})
                        </h2>
                        <div className="space-y-4">
                            {pendingReviews.map((review) => (
                                <ReviewCard key={review.id} review={review} appMap={appMap} isPending />
                            ))}
                        </div>
                    </div>
                )}

                {/* Approved Reviews */}
                <div>
                    <h2 className="text-xl font-bold font-outfit text-white mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        Approved Reviews ({approvedReviews.length})
                    </h2>
                    {approvedReviews.length === 0 ? (
                        <Card className="p-12 bg-slate-900/50 border-slate-800 text-center">
                            <div className="text-4xl mb-4">⭐</div>
                            <h3 className="text-xl font-bold font-outfit text-white mb-2">No reviews yet</h3>
                            <p className="text-slate-400 font-jakarta">Approved reviews will appear here</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {approvedReviews.map((review) => (
                                <ReviewCard key={review.id} review={review} appMap={appMap} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function ReviewCard({ review, appMap, isPending = false }: { review: any; appMap: Record<string, string>; isPending?: boolean }) {
    return (
        <Card className={`p-6 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors ${isPending ? 'border-l-4 border-l-amber-500' : ''}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold font-outfit text-white">{review.author}</h3>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                                />
                            ))}
                        </div>
                        {review.featured && (
                            <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">Featured</Badge>
                        )}
                        {review.appSlug && (
                            <span className="text-xs text-slate-500 font-jakarta">
                                App: {appMap[review.appSlug] || review.appSlug}
                            </span>
                        )}
                    </div>
                    <p className="text-slate-300 font-jakarta text-sm mb-3">"{review.content}"</p>

                    {review.adminResponse && (
                        <div className="bg-slate-800/50 rounded-lg p-3 mt-3 border-l-2 border-blue-500">
                            <p className="text-xs text-blue-400 font-medium mb-1">Admin Response:</p>
                            <p className="text-slate-400 font-jakarta text-sm">{review.adminResponse}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-jakarta mt-3">
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        {review.email && <span>{review.email}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {isPending && (
                        <>
                            <form action={async () => {
                                'use server'
                                await approveReview(review.id)
                            }}>
                                <Button size="sm" variant="outline" className="border-green-500/30 hover:bg-green-500/10 text-green-400" title="Approve">
                                    <Check className="w-4 h-4" />
                                </Button>
                            </form>
                            <form action={async () => {
                                'use server'
                                await rejectReview(review.id)
                            }}>
                                <Button size="sm" variant="outline" className="border-red-500/30 hover:bg-red-500/10 text-red-400" title="Reject">
                                    <X className="w-4 h-4" />
                                </Button>
                            </form>
                        </>
                    )}

                    {!isPending && (
                        <form action={async () => {
                            'use server'
                            await toggleFeatureReview(review.id)
                        }}>
                            <Button
                                size="sm"
                                variant="outline"
                                className={`border-slate-700 ${review.featured ? 'bg-violet-500/10 border-violet-500/30' : 'hover:bg-slate-800'}`}
                                title={review.featured ? 'Remove from featured' : 'Add to featured'}
                            >
                                <Star className={`w-4 h-4 ${review.featured ? 'fill-violet-400 text-violet-400' : 'text-slate-400'}`} />
                            </Button>
                        </form>
                    )}

                    <form action={async () => {
                        'use server'
                        await deleteReview(review.id)
                    }}>
                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" title="Delete">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </Card>
    )
}
