'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

async function submitReview(formData: FormData) {
    // We'll implement the server action logic here or import it
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000))
}

export function ReviewForm() {
    const [rating, setRating] = useState(5)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const content = formData.get('content')
        const author = formData.get('author')

        try {
            await fetch('/api/reviews', {
                method: 'POST',
                body: JSON.stringify({
                    author,
                    content,
                    rating
                })
            })
            setSubmitted(true)
        } catch (error) {
            console.error('Failed to submit review', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <Card className="p-8 text-center bg-slate-900/50 backdrop-blur-xl border-slate-800 animate-fade-in">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold font-outfit text-white mb-2">Thanks for your feedback!</h3>
                <p className="text-slate-400 font-jakarta">Your review helps us build better apps.</p>
                <Button
                    variant="ghost"
                    className="mt-6 text-blue-400 hover:text-white"
                    onClick={() => setSubmitted(false)}
                >
                    Write another review
                </Button>
            </Card>
        )
    }

    return (
        <Card className="p-8 bg-slate-900/50 backdrop-blur-xl border-slate-800">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 font-jakarta">
                        Rate your experience
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-8 h-8 transition-colors ${star <= (hoveredRating || rating)
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-slate-600'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="author" className="block text-sm font-medium text-slate-300 mb-2 font-jakarta">
                        Your Name
                    </label>
                    <input
                        type="text"
                        id="author"
                        name="author"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-jakarta"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-2 font-jakarta">
                        Your Review
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        required
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-jakarta resize-none"
                        placeholder="Tell us what you think..."
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02]"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </form>
        </Card>
    )
}
