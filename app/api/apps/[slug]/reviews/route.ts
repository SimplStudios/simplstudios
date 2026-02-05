import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get approved reviews for an app with stats
export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const reviews = await prisma.review.findMany({
            where: { appSlug: params.slug, approved: true },
            orderBy: { createdAt: 'desc' }
        })

        // Calculate stats
        const totalReviews = reviews.length
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0

        // Rating breakdown
        const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        reviews.forEach((r) => {
            ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1
        })

        return NextResponse.json({
            reviews,
            totalReviews,
            averageRating,
            ratingBreakdown
        })
    } catch (error) {
        console.error('Failed to fetch reviews:', error)
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }
}

// POST - Submit a new review for an app
export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const body = await request.json()
        const { author, email, content, rating = 5 } = body

        if (!author || !content) {
            return NextResponse.json({ error: 'Author and content are required' }, { status: 400 })
        }

        // Validate rating
        const validRating = Math.min(5, Math.max(1, Math.round(rating)))

        const review = await prisma.review.create({
            data: {
                appSlug: params.slug,
                author,
                email: email || null,
                content,
                rating: validRating,
                approved: false, // Requires admin approval
                featured: false
            }
        })

        return NextResponse.json({ success: true, id: review.id })
    } catch (error) {
        console.error('Failed to create review:', error)
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
    }
}
