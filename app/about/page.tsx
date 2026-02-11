import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Rocket, Code2, Users, Calendar, ArrowRight, Github, Twitter, Mail, DollarSign } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about SimplStudios - a student-driven software studio building apps that matter.',
}

const timeline = [
  {
    year: '2024',
    title: 'SimplStudy Born',
    description: 'Started as a personal project to help with studying. The AI flashcard feature came out of pure necessity.',
  },
  {
    year: '2024',
    title: 'SimplStream Web Launched',
    description: 'Frustrated with ad-heavy streaming sites, we built our own clean alternative.',
  },
  {
    year: '2025',
    title: 'SimplStream TV Released',
    description: 'Our biggest project yet - bringing the streaming experience to your living room.',
  },
  {
    year: '2026',
    title: 'SimplStudios Official',
    description: 'Unified all our projects under one brand. This is just the beginning.',
  },
]

const values = [
  {
    icon: Heart,
    title: 'User First',
    description: 'Every decision we make starts with the question: "Does this help the user?"',
    color: 'red',
  },
  {
    icon: Code2,
    title: 'Quality Code',
    description: 'Clean, maintainable, and fast. No bloated features, no technical debt.',
    color: 'blue',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Your feedback shapes our roadmap. We build what you need.',
    color: 'green',
  },
  {
    icon: Rocket,
    title: 'Always Shipping',
    description: 'Constant improvements and updates. We never stop making things better.',
    color: 'violet',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center pt-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
            <Heart className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400 font-jakarta uppercase tracking-wide">
              Our Story
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-outfit text-white mb-8 tracking-tight">
            About{' '}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              SimplStudios
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 font-jakarta max-w-3xl mx-auto leading-relaxed">
            We're students who got tired of using crappy software. So we built our own.
            Simple tools designed by people who actually use them.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-slate-900 border-y border-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-6">
                <Rocket className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-violet-400 font-jakarta uppercase tracking-wide">
                  Our Mission
                </span>
              </div>
              <h2 className="text-4xlmd:text-5xl font-bold font-outfit text-white mb-8 leading-tight">
                Building apps that <span className="text-blue-400">matter</span>
              </h2>
              <div className="space-y-6 text-lg text-slate-400 font-jakarta leading-relaxed">
                <p>
                  SimplStudios started with a simple idea: software should help you, not frustrate you.
                </p>
                <p>
                  As students, we faced the same problems everyone else did - study tools that were overly complicated, streaming sites drowning in ads, and apps that felt like they were designed by people who never used them.
                </p>
                <p>
                  Every product we build follows the same philosophy: <span className="text-white font-medium">keep it simple, make it work, and never stop improving.</span>
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl transform rotate-3" />
              <div className="relative p-10 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl">
                <div className="text-7xl mb-8">🎯</div>
                <h3 className="text-3xl font-bold font-outfit text-white mb-6">
                  The Simpl Philosophy
                </h3>
                <ul className="space-y-5 text-slate-300 font-jakarta text-lg">
                  <li className="flex items-center gap-4 group">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 group-hover:scale-125 transition-transform" />
                    <span className="group-hover:text-white transition-colors">If it's not useful, we don't build it</span>
                  </li>
                  <li className="flex items-center gap-4 group">
                    <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50 group-hover:scale-125 transition-transform" />
                    <span className="group-hover:text-white transition-colors">Clean design over cluttered features</span>
                  </li>
                  <li className="flex items-center gap-4 group">
                    <div className="w-3 h-3 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50 group-hover:scale-125 transition-transform" />
                    <span className="group-hover:text-white transition-colors">Fast performance is non-negotiable</span>
                  </li>
                  <li className="flex items-center gap-4 group">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50 group-hover:scale-125 transition-transform" />
                    <span className="group-hover:text-white transition-colors">User feedback drives everything</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold font-outfit text-white mb-6">
              What We Stand For
            </h2>
            <p className="text-lg text-slate-400 font-jakarta max-w-2xl mx-auto">
              These values guide every line of code we write and every feature we ship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => {
              const Icon = value.icon
              const colorConfig = {
                red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', shadow: 'shadow-red-500/10' },
                blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', shadow: 'shadow-blue-500/10' },
                green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', shadow: 'shadow-green-500/10' },
                violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', shadow: 'shadow-violet-500/10' },
              }
              const colors = colorConfig[value.color as keyof typeof colorConfig]

              return (
                <div key={value.title} className="p-8 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
                  <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center border ${colors.bg} ${colors.border} ${colors.text} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold font-outfit text-white mb-4 group-hover:text-blue-400 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-slate-400 font-jakarta leading-relaxed">
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-slate-900 border-t border-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-400 font-jakarta uppercase tracking-wide">
                Our Journey
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-outfit text-white mb-6">
              The Timeline
            </h2>
            <p className="text-lg text-slate-400 font-jakarta max-w-2xl mx-auto">
              From a side project to a full software studio. Here's how we got here.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative pl-8 md:pl-0">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-cyan-500 to-violet-500 hidden md:block" />

              <div className="space-y-16">
                {timeline.map((item, index) => (
                  <div key={index} className="relative flex flex-col md:flex-row gap-8 group">
                    {/* Year badge */}
                    <div className="md:w-32 md:text-right shrink-0">
                      <div className="inline-block px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-blue-400 font-bold font-rubik shadow-lg group-hover:scale-110 transition-transform">
                        {item.year}
                      </div>
                    </div>

                    {/* Dot */}
                    <div className="absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-950 border-4 border-blue-500 hidden md:block z-10" />

                    {/* Content */}
                    <div className="flex-1 p-8 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-blue-500/30 transition-all hover:shadow-lg">
                      <h3 className="text-xl font-bold font-outfit text-white mb-3 group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 font-jakarta text-lg leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5" />
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold font-outfit text-white mb-8">
            Let's Connect
          </h2>
          <p className="text-xl text-slate-400 font-jakarta max-w-2xl mx-auto mb-12">
            Got feedback, ideas, or just want to say hi? We'd love to hear from you.
          </p>

          <div className="flex flex-wrap gap-5 justify-center mb-16">
            <Button asChild variant="outline" size="lg" className="rounded-xl h-14 px-8 border-slate-700 hover:bg-slate-800 hover:text-white bg-slate-900/50 backdrop-blur-sm">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 w-5 h-5" />
                GitHub
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl h-14 px-8 border-slate-700 hover:bg-slate-800 hover:text-white bg-slate-900/50 backdrop-blur-sm">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter className="mr-2 w-5 h-5" />
                Twitter
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl h-14 px-8 border-slate-700 hover:bg-slate-800 hover:text-white bg-slate-900/50 backdrop-blur-sm">
              <a href="mailto:hello@simplstudios.com">
                <Mail className="mr-2 w-5 h-5" />
                Email Us
              </a>
            </Button>
            <Button asChild size="lg" className="rounded-xl h-14 px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25">
              <a href="https://cash.app/$simplstudiosofficial" target="_blank" rel="noopener noreferrer">
                <Heart className="mr-2 w-5 h-5" />
                Support Us
              </a>
            </Button>
          </div>

          <div className="pt-10 border-t border-slate-800/50">
            <Button asChild size="lg" className="rounded-xl h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25">
              <Link href="/apps">
                Explore Our Apps
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
