'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RatingStars } from '@/components/RatingStars'
import { Star, Send, User, MessageSquare } from 'lucide-react'
import type { Review } from '@/lib/types'

interface AppRatingSectionProps {
    appSlug: string
    appName: string
    reviews: Review[]
    averageRating: number
    totalReviews: number
    ratingBreakdown: Record<number, number>
}

export function AppRatingSection({
    appSlug,
    appName,
    reviews,
    averageRating,
    totalReviews,
    ratingBreakdown
}: AppRatingSectionProps) {
    const [rating, setRating] = useState(5)
    const [author, setAuthor] = useState('')
    const [email, setEmail] = useState('')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!author.trim() || !content.trim() || isSubmitting) return

        setIsSubmitting(true)

        try {
            const res = await fetch(`/api/apps/${appSlug}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author: author.trim(),
                    email: email.trim() || null,
                    content: content.trim(),
                    rating
                })
            })

            if (res.ok) {
                setSubmitted(true)
                setAuthor('')
                setEmail('')
                setContent('')
                setRating(5)
            }
        } catch (error) {
            console.error('Failed to submit review:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Format date only on client to prevent hydration mismatch
    const formatDate = (date: Date | string) => {
        if (!mounted) return ''
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date))
    }

    return (
        <section id="reviews" className="py-20 bg-slate-900">
            <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                <h2 className="text-3xl font-bold font-outfit text-white mb-12">
                    Ratings & Reviews
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Rating Summary */}
                    <Card className="p-6 bg-slate-950 border-slate-800">
                        <div className="text-center mb-6">
                            <div className="text-5xl font-bold font-rubik text-white mb-2">
                                {averageRating.toFixed(1)}
                            </div>
                            <RatingStars rating={averageRating} size="lg" className="justify-center mb-2" />
                            <p className="text-slate-400 font-jakarta text-sm">
                                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                            </p>
                        </div>

                        {/* Rating Breakdown */}
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((stars) => {
                                const count = ratingBreakdown[stars] || 0
                                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

                                return (
                                    <div key={stars} className="flex items-center gap-2">
                                        <span className="text-sm text-slate-400 font-jakarta w-3">{stars}</span>
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500 font-jakarta w-8">{count}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>

                    {/* Review Form */}
                    <Card className="p-6 bg-slate-950 border-slate-800">
                        <h3 className="text-lg font-bold font-outfit text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-400" />
                            Rate {appName}
                        </h3>

                        {submitted ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Star className="w-6 h-6 text-green-400" />
                                </div>
                                <p className="text-white font-medium font-jakarta mb-2">Thank you for your review!</p>
                                <p className="text-slate-400 font-jakarta text-sm">It will appear after approval.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">
                                        Your Rating
                                    </label>
                                    <RatingStars
                                        rating={rating}
                                        interactive
                                        onChange={setRating}
                                        size="lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        placeholder="Your name"
                                        required
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">
                                        Email (optional)
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 font-jakarta">
                                        Review *
                                    </label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Share your experience..."
                                        rows={3}
                                        required
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!author.trim() || !content.trim() || isSubmitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                </Button>
                            </form>
                        )}
                    </Card>

                    {/* Reviews List */}
                    <Card className="p-6 bg-slate-950 border-slate-800 lg:row-span-1">
                        <h3 className="text-lg font-bold font-outfit text-white mb-4">
                            User Reviews
                        </h3>

                        {reviews.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-400 font-jakarta text-sm">
                                    No reviews yet. Be the first to review!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-4 rounded-lg bg-slate-900/50">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                                <User className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="font-medium text-white font-jakarta text-sm">{review.author}</span>
                                                    <RatingStars rating={review.rating} size="sm" />
                                                </div>
                                                <p className="text-slate-300 font-jakarta text-sm mb-2">{review.content}</p>
                                                {mounted && (
                                                    <span className="text-xs text-slate-500">{formatDate(review.createdAt)}</span>
                                                )}

                                                {review.adminResponse && (
                                                    <div className="mt-3 p-3 rounded-lg bg-slate-800/50 border-l-2 border-blue-500">
                                                        <p className="text-xs text-blue-400 font-medium mb-1">SimplStudios Response:</p>
                                                        <p className="text-slate-400 font-jakarta text-sm">{review.adminResponse}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </section>
    )
}
