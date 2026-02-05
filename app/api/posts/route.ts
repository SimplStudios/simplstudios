import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET - List all posts with counts
export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
            include: {
                _count: {
                    select: { comments: true, likes: true }
                }
            }
        })
        return NextResponse.json(posts)
    } catch (error) {
        console.error('Failed to fetch posts:', error)
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }
}

// POST - Create a new post (should be admin-only in production)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, content, type = 'announcement', pinned = false } = body

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
        }

        const post = await prisma.post.create({
            data: { title, content, type, pinned },
            include: {
                _count: {
                    select: { comments: true, likes: true }
                }
            }
        })

        return NextResponse.json(post)
    } catch (error) {
        console.error('Failed to create post:', error)
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }
}
