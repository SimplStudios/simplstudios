'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Heart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />

      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400 font-jakarta tracking-wide uppercase">
              Student-built software
            </span>
          </motion.div>

          {/* Main heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold font-outfit tracking-tight leading-[1.1] mb-6">
            <span className="text-white block">Welcome to</span>
            <span className="bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 bg-clip-text text-transparent inline-block pb-2">
              SimplStudios
            </span>
          </h1>

          {/* Slogan */}
          <p className="mt-6 text-2xl md:text-3xl text-blue-400 font-outfit italic">
            "Life is hard, keep it Simpl."
          </p>

          {/* Subtitle */}
          <p className="mt-4 text-lg md:text-xl text-slate-400 font-jakarta max-w-2xl mx-auto leading-relaxed">
            Building apps that matter. We create simple, powerful tools designed by students, <span className="text-slate-300">for everyone.</span>
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center">
            <Button asChild size="lg" className="rounded-xl text-base px-8 h-14 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all hover:scale-105">
              <Link href="/apps">
                Explore Our Apps
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-xl text-base px-8 h-14 border-slate-700 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800 transition-all hover:scale-105">
              <Link href="/about">
                Learn More
              </Link>
            </Button>
            <Button asChild size="lg" className="rounded-xl text-base px-8 h-14 bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20 hover:shadow-green-600/40 transition-all hover:scale-105">
              <a href="https://cash.app/$simplstudiosofficial" target="_blank" rel="noopener noreferrer">
                <Heart className="mr-2 w-5 h-5" />
                Support Us
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-20 pt-10 border-t border-slate-800/50 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="group">
              <div className="text-4xl font-bold font-rubik text-white group-hover:text-blue-400 transition-colors">3</div>
              <div className="text-sm text-slate-500 font-jakarta mt-1 uppercase tracking-wider">Apps Built</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold font-rubik text-white group-hover:text-blue-400 transition-colors">1K+</div>
              <div className="text-sm text-slate-500 font-jakarta mt-1 uppercase tracking-wider">Users</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold font-rubik text-white group-hover:text-blue-400 transition-colors">4+</div>
              <div className="text-sm text-slate-500 font-jakarta mt-1 uppercase tracking-wider">Platforms</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
