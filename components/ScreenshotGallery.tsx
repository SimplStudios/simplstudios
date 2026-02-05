'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScreenshotGalleryProps {
  screenshots: string[]
  appName: string
}

export function ScreenshotGallery({ screenshots, appName }: ScreenshotGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (screenshots.length === 0) {
    return null
  }

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % screenshots.length)
  }

  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length)
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800">
        <Image
          src={screenshots[activeIndex]}
          alt={`${appName} screenshot ${activeIndex + 1}`}
          fill
          className="object-cover"
        />

        {/* Navigation arrows */}
        {screenshots.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {screenshots.length > 1 && (
        <div className="flex gap-3 justify-center">
          {screenshots.map((screenshot, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative w-20 h-12 rounded-lg overflow-hidden transition-all',
                activeIndex === index
                  ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950'
                  : 'opacity-60 hover:opacity-100'
              )}
            >
              <Image
                src={screenshot}
                alt={`${appName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
