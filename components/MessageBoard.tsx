'use client'

import { useState, useEffect } from 'react'
import { PostCard } from '@/components/PostCard'
import { CommentSection } from '@/components/CommentSection'
import { Megaphone, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Post } from '@/lib/types'

interface MessageBoardProps {
    initialPosts: (Post & { _count: { comments: number; likes: number } })[]
    userLikes?: string[] // post IDs the user has liked
}

export function MessageBoard({ initialPosts, userLikes = [] }: MessageBoardProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(userLikes))
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleToggleComments = (postId: string) => {
        setExpandedComments(prev => {
            const next = new Set(prev)
            if (next.has(postId)) {
                next.delete(postId)
            } else {
                next.add(postId)
            }
            return next
        })
    }

    const handleLike = (postId: string) => {
        setLikedPosts(prev => {
            const next = new Set(prev)
            if (next.has(postId)) {
                next.delete(postId)
            } else {
                next.add(postId)
            }
            return next
        })
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            const res = await fetch('/api/posts')
            const data = await res.json()
            setPosts(data)
        } catch (error) {
            console.error('Failed to refresh posts:', error)
        } finally {
            setIsRefreshing(false)
        }
    }

    if (posts.length === 0) {
        return (
            <section className="py-20 bg-slate-950">
                <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
                        <Megaphone className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold font-outfit text-white mb-3">Message Board</h2>
                    <p className="text-slate-400 font-jakarta">No posts yet. Check back soon for updates!</p>
                </div>
            </section>
        )
    }

    return (
        <section className="py-20 bg-slate-950">
            <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Megaphone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold font-outfit text-white">Message Board</h2>
                            <p className="text-slate-400 font-jakarta text-sm">Latest updates, announcements, and news</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="text-slate-400 hover:text-white"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {/* Posts */}
                <div className="space-y-6">
                    {posts.map((post) => (
                        <div key={post.id}>
                            <PostCard
                                post={post}
                                hasLiked={likedPosts.has(post.id)}
                                onLike={handleLike}
                                onToggleComments={handleToggleComments}
                                showComments={expandedComments.has(post.id)}
                            />
                            {expandedComments.has(post.id) && (
                                <div className="ml-0 sm:ml-6 -mt-1">
                                    <CommentSection postId={post.id} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
