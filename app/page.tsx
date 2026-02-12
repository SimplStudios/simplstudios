import { prisma } from '@/lib/db'
import { Hero } from '@/components/Hero'
import { AppCard } from '@/components/AppCard'
import { TestimonialCard } from '@/components/TestimonialCard'
import { UpdateCard } from '@/components/UpdateCard'
import { MessageBoard } from '@/components/MessageBoard'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Code2, Heart } from 'lucide-react'
import Link from 'next/link'
import { ReviewForm } from '@/components/ReviewForm'

async function getPosts() {
  const posts = await prisma.post.findMany({
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: {
      _count: {
        select: { comments: true, likes: true }
      }
    }
  })
  return posts
}

async function getApps() {
  const apps = await prisma.app.findMany({
    orderBy: [
      { pinned: 'desc' },
      { pinnedOrder: 'asc' },
      { createdAt: 'asc' },
    ],
  })
  return apps
}

// Revalidate every 60 seconds so new apps show up
export const revalidate = 60

async function getTestimonials() {
  const testimonials = await prisma.testimonial.findMany({
    where: { featured: true },
    take: 3,
  })
  return testimonials
}

async function getUpdates() {
  const updates = await prisma.update.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
  })
  return updates
}

export default async function HomePage() {
  const [apps, testimonials, updates, posts] = await Promise.all([
    getApps(),
    getTestimonials(),
    getUpdates(),
    getPosts(),
  ])

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <Hero />

      {/* Message Board Section */}
      <MessageBoard initialPosts={posts} />

      {/* Apps Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400 font-jakarta uppercase tracking-wide">
                Our Ecosystem
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-outfit text-white mb-6">
              Flagship Products
            </h2>
            <p className="text-lg md:text-xl text-slate-400 font-jakarta max-w-2xl mx-auto leading-relaxed">
              Simple tools designed to make your life easier. Each app is built with care, performance, and attention to detail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {apps.map((app, index) => (
              <AppCard key={app.id} app={app} index={index} />
            ))}
          </div>

          <div className="text-center mt-16">
            <Button asChild variant="outline" size="lg" className="rounded-xl border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-blue-400 hover:text-white px-8 h-12">
              <Link href="/apps">
                View All Apps
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-slate-900 relative border-y border-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-cyan-400 font-jakarta uppercase tracking-wide">
                  Why SimplStudios?
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-outfit text-white mb-6 leading-tight">
                Built Different
              </h2>
              <p className="text-lg text-slate-400 font-jakarta mb-10 leading-relaxed">
                We're not just another software company. We're students who understand your problems because we face them too.
              </p>
              <div className="space-y-8">
                <div className="flex gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-outfit text-white mb-2 group-hover:text-blue-400 transition-colors">
                      Made with Love
                    </h3>
                    <p className="text-slate-400 font-jakarta leading-relaxed">
                      Every feature is crafted with attention to detail and a genuine desire to help.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Code2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-outfit text-white mb-2 group-hover:text-violet-400 transition-colors">
                      Clean Code
                    </h3>
                    <p className="text-slate-400 font-jakarta leading-relaxed">
                      Modern tech stack, fast performance, and no bloated features you don't need.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-outfit text-white mb-2 group-hover:text-green-400 transition-colors">
                      Always Improving
                    </h3>
                    <p className="text-slate-400 font-jakarta leading-relaxed">
                      Constant updates based on real user feedback. Your voice matters here.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-[100px]" />
              <div className="relative grid grid-cols-2 gap-6 w-full max-w-lg">
                <div className="space-y-6 mt-12">
                  <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700 shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-500">
                    <div className="text-5xl font-bold font-rubik text-white mb-2">3</div>
                    <div className="text-slate-400 font-jakarta font-medium uppercase tracking-wider text-sm">Apps Live</div>
                  </div>
                  <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700 shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-500">
                    <div className="text-5xl font-bold font-rubik text-white mb-2">1K+</div>
                    <div className="text-slate-400 font-jakarta font-medium uppercase tracking-wider text-sm">Happy Users</div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700 shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-500">
                    <div className="text-5xl font-bold font-rubik text-white mb-2">4+</div>
                    <div className="text-slate-400 font-jakarta font-medium uppercase tracking-wider text-sm">Platforms</div>
                  </div>
                  <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700 shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-500">
                    <div className="text-5xl font-bold font-rubik text-white mb-2">∞</div>
                    <div className="text-slate-400 font-jakarta font-medium uppercase tracking-wider text-sm">Ideas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-32 bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold font-outfit text-white mb-6">
                What People Say
              </h2>
              <p className="text-lg text-slate-400 font-jakarta max-w-2xl mx-auto">
                Real feedback from real users. We're proud of the community we're building.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Updates Section */}
      {updates.length > 0 && (
        <section className="py-32 bg-slate-900 border-t border-slate-800">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold font-outfit text-white mb-4">
                  Latest Updates
                </h2>
                <p className="text-lg text-slate-400 font-jakarta max-w-xl">
                  Stay in the loop with our latest releases and improvements.
                </p>
              </div>
              <Button asChild variant="outline" className="border-slate-700 hover:border-blue-500 hover:text-blue-400">
                <Link href="/updates">
                  View All Updates
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="space-y-6">
              {updates.map((update, index) => (
                <UpdateCard key={update.id} update={update} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}



      {/* Reviews Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold font-outfit text-white mb-6">
                We value your <span className="text-blue-500">feedback</span>
              </h2>
              <p className="text-xl text-slate-400 font-jakarta leading-relaxed mb-8">
                Help us improve by sharing your experience. We read every review to make SimplStudios better.
              </p>
              <div className="flex -space-x-4 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-950 bg-slate-800" />
                ))}
                <div className="w-12 h-12 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-white font-bold font-jakarta text-sm">
                  +50
                </div>
              </div>
              <p className="text-sm text-slate-500 font-jakarta">Join our community of happy users</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full" />
              <ReviewForm />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5" />
        <div className="absolute -top-[500px] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold font-outfit text-white mb-8 tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-400 font-jakarta max-w-2xl mx-auto mb-12 leading-relaxed">
            Explore our apps and find the tools that work for you. No bloat, just simple, effective software.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button asChild size="lg" className="rounded-xl h-14 px-8 text-base bg-white text-slate-950 hover:bg-slate-200">
              <Link href="/apps">
                Explore Apps
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-xl h-14 px-8 text-base border-slate-700 hover:bg-slate-800">
              <Link href="/about">
                About Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
