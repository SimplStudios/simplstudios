import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST - Submit a new review (from public form)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { author, content, rating, appSlug, email } = body

        if (!author || !content) {
            return NextResponse.json(
                { error: 'Author and content are required' },
                { status: 400 }
            )
        }

        const review = await prisma.review.create({
            data: {
                author,
                content,
                rating: rating || 5,
                appSlug: appSlug || null,
                email: email || null,
                approved: false,
                featured: false,
            }
        })

        return NextResponse.json({ success: true, id: review.id })
    } catch (error) {
        console.error('Failed to create review:', error)
        return NextResponse.json(
            { error: 'Failed to submit review' },
            { status: 500 }
        )
    }
}

// GET - List reviews (for admin, could add auth check)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const approved = searchParams.get('approved')
        const featured = searchParams.get('featured')
        const appSlug = searchParams.get('appSlug')

        const where: any = {}
        if (approved !== null) where.approved = approved === 'true'
        if (featured !== null) where.featured = featured === 'true'
        if (appSlug) where.appSlug = appSlug

        const reviews = await prisma.review.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(reviews)
    } catch (error) {
        console.error('Failed to fetch reviews:', error)
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        )
    }
}
