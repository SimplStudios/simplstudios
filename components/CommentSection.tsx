'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, User, AlertCircle } from 'lucide-react'
import type { Comment } from '@/lib/types'

interface CommentSectionProps {
    postId: string
    initialComments?: Comment[]
}

// Spam prevention constants
const COMMENT_COOLDOWN_MS = 30000 // 30 seconds between comments
const MAX_COMMENTS_PER_POST = 3 // Max comments per user per post

// Get comment history from localStorage
function getCommentHistory(): { lastCommentTime: number; postComments: Record<string, number> } {
    if (typeof window === 'undefined') return { lastCommentTime: 0, postComments: {} }
    try {
        const stored = localStorage.getItem('comment_history')
        return stored ? JSON.parse(stored) : { lastCommentTime: 0, postComments: {} }
    } catch {
        return { lastCommentTime: 0, postComments: {} }
    }
}

function updateCommentHistory(postId: string) {
    if (typeof window === 'undefined') return
    try {
        const history = getCommentHistory()
        history.lastCommentTime = Date.now()
        history.postComments[postId] = (history.postComments[postId] || 0) + 1
        localStorage.setItem('comment_history', JSON.stringify(history))
    } catch { }
}

function canComment(postId: string): { allowed: boolean; reason?: string; cooldownRemaining?: number } {
    if (typeof window === 'undefined') return { allowed: true }
    const history = getCommentHistory()

    // Check cooldown
    const timeSinceLastComment = Date.now() - history.lastCommentTime
    if (timeSinceLastComment < COMMENT_COOLDOWN_MS) {
        const remaining = Math.ceil((COMMENT_COOLDOWN_MS - timeSinceLastComment) / 1000)
        return { allowed: false, reason: `Please wait ${remaining}s before commenting again`, cooldownRemaining: remaining }
    }

    // Check max comments per post
    if ((history.postComments[postId] || 0) >= MAX_COMMENTS_PER_POST) {
        return { allowed: false, reason: 'You have reached the comment limit for this post' }
    }

    return { allowed: true }
}

export function CommentSection({ postId, initialComments = [] }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [isLoading, setIsLoading] = useState(!initialComments.length)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [author, setAuthor] = useState('')
    const [content, setContent] = useState('')
    const [error, setError] = useState('')
    const [mounted, setMounted] = useState(false)
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        setMounted(true)

        // Load saved author name
        const savedAuthor = localStorage.getItem('comment_author')
        if (savedAuthor) setAuthor(savedAuthor)

        if (!initialComments.length) {
            fetchComments()
        }
    }, [postId])

    // Cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return
        const timer = setInterval(() => {
            setCooldown(prev => Math.max(0, prev - 1))
        }, 1000)
        return () => clearInterval(timer)
    }, [cooldown])

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/posts/${postId}/comments`)
            const data = await res.json()
            setComments(data)
        } catch (error) {
            console.error('Failed to fetch comments:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!author.trim() || !content.trim() || isSubmitting) return

        // Check spam prevention
        const canCommentResult = canComment(postId)
        if (!canCommentResult.allowed) {
            setError(canCommentResult.reason || 'Cannot comment at this time')
            if (canCommentResult.cooldownRemaining) {
                setCooldown(canCommentResult.cooldownRemaining)
            }
            return
        }

        // Check if author name is already used recently by someone else
        const recentComment = comments.find(c =>
            c.author.toLowerCase() === author.trim().toLowerCase() &&
            (Date.now() - new Date(c.createdAt).getTime()) < 60000 // Within last minute
        )

        if (recentComment) {
            // It's fine if it's the same tracked user
            const savedAuthor = localStorage.getItem('comment_author')
            if (savedAuthor?.toLowerCase() !== author.trim().toLowerCase()) {
                setError('This name was used recently. Please use a different name.')
                return
            }
        }

        setIsSubmitting(true)

        // Save author name for future
        localStorage.setItem('comment_author', author.trim())

        // Optimistic add
        const tempComment: Comment = {
            id: `temp-${Date.now()}`,
            postId,
            author: author.trim(),
            content: content.trim(),
            createdAt: new Date(),
        }
        setComments(prev => [tempComment, ...prev])
        setContent('')

        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author: author.trim(), content: content.trim() }),
            })

            if (!res.ok) {
                throw new Error('Failed to post comment')
            }

            const newComment = await res.json()
            updateCommentHistory(postId)

            // Replace temp comment with real one
            setComments(prev => prev.map(c => c.id === tempComment.id ? newComment : c))
        } catch (error) {
            // Remove temp comment on error
            setComments(prev => prev.filter(c => c.id !== tempComment.id))
            setContent(tempComment.content)
            setError('Failed to post comment. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatDate = (date: Date | string) => {
        if (!mounted) return ''
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(new Date(date))
    }

    return (
        <div className="mt-4 pt-4 border-t border-slate-800 animate-fade-in">
            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex gap-3 mb-2 flex-wrap sm:flex-nowrap">
                    <input
                        type="text"
                        placeholder="Your name"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full sm:w-32 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-blue-500 focus:outline-none font-jakarta"
                    />
                    <input
                        type="text"
                        placeholder="Write a comment..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-blue-500 focus:outline-none font-jakarta"
                    />
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!author.trim() || !content.trim() || isSubmitting || cooldown > 0}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {cooldown > 0 ? `${cooldown}s` : <Send className="w-4 h-4" />}
                    </Button>
                </div>
                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs font-jakarta">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                    </div>
                )}
            </form>

            {/* Comments List with better scrolling */}
            {isLoading ? (
                <div className="text-center py-6 text-slate-500 font-jakarta text-sm">Loading comments...</div>
            ) : comments.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-jakarta text-sm">No comments yet. Be the first!</div>
            ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-slate-950/50">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="font-medium text-white font-jakarta text-sm">{comment.author}</span>
                                    {mounted && <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>}
                                </div>
                                <p className="text-slate-300 font-jakarta text-sm break-words">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
