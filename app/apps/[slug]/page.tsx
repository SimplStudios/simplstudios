import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ScreenshotGallery } from '@/components/ScreenshotGallery'
import { TestimonialCard } from '@/components/TestimonialCard'
import { UpdateCard } from '@/components/UpdateCard'
import { AppRatingSection } from '@/components/AppRatingSection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowLeft, ExternalLink, Check, ArrowRight, Heart } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Review } from '@/lib/types'

interface AppPageProps {
  params: Promise<{ slug: string }>
}

async function getApp(slug: string) {
  const app = await prisma.app.findUnique({
    where: { slug },
  })
  return app
}

async function getAppUpdates(slug: string) {
  const updates = await prisma.update.findMany({
    where: { appSlug: slug },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
  return updates
}

async function getAppTestimonials(slug: string) {
  const testimonials = await prisma.testimonial.findMany({
    where: { appSlug: slug },
    take: 3,
  })
  return testimonials
}

async function getAppReviews(slug: string) {
  const reviews = await prisma.review.findMany({
    where: { appSlug: slug, approved: true },
    orderBy: { createdAt: 'desc' }
  })

  const totalReviews = reviews.length
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / totalReviews
    : 0

  const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach((r: Review) => {
    ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1
  })

  return { reviews, totalReviews, averageRating, ratingBreakdown }
}

export async function generateMetadata({ params }: AppPageProps): Promise<Metadata> {
  const { slug } = await params
  const app = await getApp(slug)
  if (!app) return { title: 'App Not Found' }

  return {
    title: app.name,
    description: app.tagline,
    openGraph: {
      title: `${app.name} | SimplStudios`,
      description: app.tagline,
    },
  }
}

export default async function AppPage({ params }: AppPageProps) {
  const { slug } = await params
  const [app, updates, testimonials, reviewsData] = await Promise.all([
    getApp(slug),
    getAppUpdates(slug),
    getAppTestimonials(slug),
    getAppReviews(slug),
  ])

  if (!app) {
    notFound()
  }

  const { reviews, totalReviews, averageRating, ratingBreakdown } = reviewsData

  const statusVariant = app.status === 'live' ? 'live' : app.status === 'beta' ? 'beta' : 'coming-soon'

  const gradientClass = cn(
    'from-blue-600 to-blue-400',
    app.color === 'violet' && 'from-violet-600 to-violet-400',
    app.color === 'cyan' && 'from-cyan-600 to-cyan-400',
  )

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={cn(
        'relative py-32 overflow-hidden',
        'bg-gradient-to-b from-slate-900 to-slate-950'
      )}>
        {/* Background gradient */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-20',
          gradientClass
        )} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          {/* Back button */}
          <Link
            href="/apps"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-jakarta mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Apps</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* App Info */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-7xl">{app.icon}</span>
                <Badge variant={statusVariant} className="text-sm px-4 py-1">
                  {app.status === 'live' ? 'Live' : app.status === 'beta' ? 'Beta' : 'Coming Soon'}
                </Badge>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold font-outfit text-white mb-4">
                {app.name}
              </h1>
              <p className="text-xl text-slate-300 font-jakarta mb-6">
                {app.tagline}
              </p>

              {/* Platforms */}
              <div className="flex flex-wrap gap-2 mb-8">
                {app.platforms.map((platform) => (
                  <Badge key={platform} variant="platform" className="capitalize">
                    {platform.replace('-', ' ')}
                  </Badge>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                {app.url && (
                  <Button asChild size="lg">
                    <a href={app.url} target="_blank" rel="noopener noreferrer">
                      Launch App
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="lg" asChild>
                  <Link href="#features">
                    View Features
                  </Link>
                </Button>
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/25">
                  <a href="https://cash.app/$simplstudiosofficial" target="_blank" rel="noopener noreferrer">
                    <Heart className="mr-2 w-4 h-4" />
                    Donate
                  </a>
                </Button>
              </div>
            </div>

            {/* Screenshot Preview */}
            {app.screenshots.length > 0 && (
              <div className="relative">
                <div className={cn(
                  'absolute -inset-4 bg-gradient-to-r rounded-3xl blur-2xl opacity-30',
                  gradientClass
                )} />
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                  <img
                    src={app.screenshots[0]}
                    alt={`${app.name} preview`}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold font-outfit text-white mb-6">
              About {app.name}
            </h2>
            <p className="text-lg text-slate-300 font-jakarta leading-relaxed">
              {app.description}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-outfit text-white mb-12">
            Key Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {app.features.map((feature, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    app.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                    app.color === 'violet' && 'bg-violet-500/20 text-violet-400',
                    app.color === 'cyan' && 'bg-cyan-500/20 text-cyan-400',
                  )}>
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium font-jakarta">
                      {feature}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Gallery */}
      {app.screenshots.length > 1 && (
        <section className="py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <h2 className="text-3xl font-bold font-outfit text-white mb-12">
              Screenshots
            </h2>
            <ScreenshotGallery screenshots={app.screenshots} appName={app.name} />
          </div>
        </section>
      )}

      {/* Updates Section */}
      {updates.length > 0 && (
        <section className="py-20 bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold font-outfit text-white mb-2">
                  Recent Updates
                </h2>
                <p className="text-slate-400 font-jakarta">
                  Latest changes and improvements
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/updates?app=${app.slug}`}>
                  View All
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {updates.map((update, index) => (
                <UpdateCard key={update.id} update={update} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ratings & Reviews Section */}
      <AppRatingSection
        appSlug={app.slug}
        appName={app.name}
        reviews={reviews}
        averageRating={averageRating}
        totalReviews={totalReviews}
        ratingBreakdown={ratingBreakdown}
      />

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <h2 className="text-3xl font-bold font-outfit text-white mb-12">
              What Users Say
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial: any, index: number) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600/10 via-slate-900 to-cyan-600/10">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold font-outfit text-white mb-6">
            Ready to try {app.name}?
          </h2>
          <p className="text-lg text-slate-400 font-jakarta max-w-xl mx-auto mb-8">
            {app.tagline}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {app.url && (
              <Button asChild size="lg">
                <a href={app.url} target="_blank" rel="noopener noreferrer">
                  Launch {app.name}
                  <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </Button>
            )}
            <Button variant="outline" size="lg" asChild>
              <Link href="/apps">
                Explore Other Apps
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
