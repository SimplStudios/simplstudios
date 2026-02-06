import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get comments for a post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const comments = await prisma.comment.findMany({
            where: { postId: id },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(comments)
    } catch (error) {
        console.error('Failed to fetch comments:', error)
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }
}

// POST - Add a comment to a post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { author, content } = body

        if (!author || !content) {
            return NextResponse.json({ error: 'Author and content are required' }, { status: 400 })
        }

        const comment = await prisma.comment.create({
            data: {
                postId: id,
                author,
                content
            }
        })

        return NextResponse.json(comment)
    } catch (error) {
        console.error('Failed to create comment:', error)
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }
}
