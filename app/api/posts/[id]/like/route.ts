import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST - Like or unlike a post (using action in body)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await params
        const body = await request.json()
        const action = body.action // 'like' or 'unlike'

        if (action === 'like') {
            // Increment like count (we track in localStorage client-side)
            // Just add a record - we don't track by session anymore
            await prisma.postLike.create({
                data: {
                    postId,
                    sessionId: `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`
                }
            })
            return NextResponse.json({ liked: true })
        } else if (action === 'unlike') {
            // Find and delete one like from this post
            const existingLike = await prisma.postLike.findFirst({
                where: { postId }
            })
            if (existingLike) {
                await prisma.postLike.delete({
                    where: { id: existingLike.id }
                })
            }
            return NextResponse.json({ liked: false })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        console.error('Failed to toggle like:', error)
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
    }
}
