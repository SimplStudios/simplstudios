'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
    rating: number
    maxRating?: number
    size?: 'sm' | 'md' | 'lg'
    interactive?: boolean
    onChange?: (rating: number) => void
    className?: string
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
}

export function RatingStars({
    rating,
    maxRating = 5,
    size = 'md',
    interactive = false,
    onChange,
    className
}: RatingStarsProps) {
    const [hoverRating, setHoverRating] = useState(0)

    const handleClick = (value: number) => {
        if (interactive && onChange) {
            onChange(value)
        }
    }

    const handleMouseEnter = (value: number) => {
        if (interactive) {
            setHoverRating(value)
        }
    }

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0)
        }
    }

    const displayRating = hoverRating || rating

    return (
        <div className={cn('flex items-center gap-0.5', className)}>
            {Array.from({ length: maxRating }, (_, i) => i + 1).map((value) => {
                const isFilled = value <= displayRating
                const isPartial = !isFilled && value - 0.5 <= displayRating

                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => handleClick(value)}
                        onMouseEnter={() => handleMouseEnter(value)}
                        onMouseLeave={handleMouseLeave}
                        disabled={!interactive}
                        className={cn(
                            'transition-colors',
                            interactive && 'cursor-pointer hover:scale-110',
                            !interactive && 'cursor-default'
                        )}
                    >
                        <Star
                            className={cn(
                                sizeClasses[size],
                                isFilled
                                    ? 'fill-amber-400 text-amber-400'
                                    : isPartial
                                        ? 'fill-amber-400/50 text-amber-400'
                                        : 'fill-slate-700 text-slate-600'
                            )}
                        />
                    </button>
                )
            })}
        </div>
    )
}
