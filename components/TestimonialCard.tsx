'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Star, Quote } from 'lucide-react'
import type { Testimonial } from '@/lib/types'

interface TestimonialCardProps {
  testimonial: Testimonial
  index?: number
}

export function TestimonialCard({ testimonial, index = 0 }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="p-8 h-full relative bg-slate-900 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 group">
        {/* Quote icon */}
        <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-500/20 group-hover:text-blue-500/40 transition-colors" />

        {/* Stars */}
        <div className="flex gap-1 mb-6">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-blue-500 text-blue-500" />
          ))}
        </div>

        {/* Content */}
        <p className="text-slate-300 font-jakarta mb-8 leading-relaxed text-lg">
          "{testimonial.content}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-4 mt-auto">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold font-outfit text-lg shadow-inner">
            {testimonial.author.charAt(0)}
          </div>
          <div>
            <div className="text-white font-bold font-outfit text-lg">
              {testimonial.author}
            </div>
            {testimonial.role && (
              <div className="text-sm text-blue-400 font-jakarta font-medium">
                {testimonial.role}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
