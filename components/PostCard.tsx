'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Pin, Calendar, Image as ImageIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Post } from '@/lib/types'

interface PostCardProps {
    post: Post & {
        _count: {
            comments: number
            likes: number
        }
    }
    onLike?: (postId: string) => void
    onToggleComments?: (postId: string) => void
    showComments?: boolean
}

const typeConfig: Record<string, { color: string; label: string }> = {
    announcement: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: '📢 Announcement' },
    update: { color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', label: '📦 Update' },
    release: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: '🚀 Release' },
    news: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: '📰 News' },
}

// Get/set likes from localStorage
function getLikedPosts(): Set<string> {
    if (typeof window === 'undefined') return new Set()
    try {
        const stored = localStorage.getItem('liked_posts')
        return new Set(stored ? JSON.parse(stored) : [])
    } catch {
        return new Set()
    }
}

function setLikedPost(postId: string, liked: boolean) {
    if (typeof window === 'undefined') return
    try {
        const likedPosts = getLikedPosts()
        if (liked) {
            likedPosts.add(postId)
        } else {
            likedPosts.delete(postId)
        }
        localStorage.setItem('liked_posts', JSON.stringify(Array.from(likedPosts)))
    } catch { }
}

export function PostCard({ post, onLike, onToggleComments, showComments = false }: PostCardProps) {
    const [isLiking, setIsLiking] = useState(false)
    const [hasLiked, setHasLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(post._count.likes)
    const [mounted, setMounted] = useState(false)

    // Check localStorage on mount
    useEffect(() => {
        setMounted(true)
        const likedPosts = getLikedPosts()
        setHasLiked(likedPosts.has(post.id))
    }, [post.id])

    const handleLike = async () => {
        if (isLiking) return
        setIsLiking(true)

        const wasLiked = hasLiked
        const newLiked = !wasLiked

        // Optimistic update
        setHasLiked(newLiked)
        setLikesCount(prev => newLiked ? prev + 1 : prev - 1)
        setLikedPost(post.id, newLiked)

        try {
            const res = await fetch(`/api/posts/${post.id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: newLiked ? 'like' : 'unlike' })
            })

            if (!res.ok) throw new Error('Failed')

            onLike?.(post.id)
        } catch (error) {
            // Revert on error
            setHasLiked(wasLiked)
            setLikesCount(prev => wasLiked ? prev + 1 : prev - 1)
            setLikedPost(post.id, wasLiked)
        } finally {
            setIsLiking(false)
        }
    }

    const formatDate = (date: Date | string) => {
        if (!mounted) return ''
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(new Date(date))
    }

    const config = typeConfig[post.type] || typeConfig.announcement

    return (
        <Card className={`p-6 bg-slate-900/80 backdrop-blur-sm border-slate-800 hover:border-slate-700 transition-all ${post.pinned ? 'ring-2 ring-amber-500/30' : ''}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={config.color}>{config.label}</Badge>
                    {post.pinned && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            <Pin className="w-3 h-3 mr-1" />
                            Pinned
                        </Badge>
                    )}
                </div>
                {mounted && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-jakarta shrink-0">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.createdAt)}
                    </div>
                )}
            </div>

            {/* Image (if attached) */}
            {post.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-auto max-h-80 object-cover"
                    />
                </div>
            )}

            {/* Content */}
            <h3 className="text-xl font-bold font-outfit text-white mb-3">{post.title}</h3>
            <div className="text-slate-300 font-jakarta leading-relaxed mb-6 prose prose-invert prose-sm max-w-none prose-headings:text-white prose-a:text-blue-400 prose-strong:text-white prose-code:text-blue-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    disabled={isLiking || !mounted}
                    className={`gap-2 transition-colors ${hasLiked ? 'text-rose-400 hover:text-rose-300' : 'text-slate-400 hover:text-rose-400'}`}
                >
                    <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                    <span className="font-medium">{likesCount}</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleComments?.(post.id)}
                    className={`gap-2 text-slate-400 hover:text-blue-400 ${showComments ? 'text-blue-400' : ''}`}
                >
                    <MessageCircle className={`w-4 h-4 ${showComments ? 'fill-blue-400/20' : ''}`} />
                    <span className="font-medium">{post._count.comments}</span>
                    <span className="hidden sm:inline">Comments</span>
                </Button>
            </div>
        </Card>
    )
}
