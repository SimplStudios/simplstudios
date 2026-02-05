import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.testimonial.deleteMany()
  await prisma.update.deleteMany()
  await prisma.app.deleteMany()

  // Create Apps
  const simplstudy = await prisma.app.create({
    data: {
      name: 'SimplStudy',
      slug: 'simplstudy',
      tagline: 'Your AI-powered study companion',
      description: 'SimplStudy is the ultimate study tool designed by students, for students. Generate flashcards, summarize notes, quiz yourself, and master any subject with the power of AI. Built to make studying less painful and more effective.',
      icon: '📚',
      color: 'blue',
      screenshots: [
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200',
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200',
        'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200',
      ],
      features: [
        'AI-powered flashcard generation',
        'Smart note summarization',
        'Interactive quizzes',
        'Progress tracking',
        'Dark mode support',
        'Export to PDF',
      ],
      status: 'live',
      url: 'https://simplstudy.vercel.app',
      platforms: ['web'],
    },
  })

  const simplstreamWeb = await prisma.app.create({
    data: {
      name: 'SimplStream Web',
      slug: 'simplstream-web',
      tagline: 'Stream anything, anywhere',
      description: 'SimplStream Web brings entertainment to your browser. A clean, fast, and ad-free streaming experience. Watch your favorite content without the bloat of traditional streaming platforms.',
      icon: '🌐',
      color: 'violet',
      screenshots: [
        'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200',
        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200',
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      ],
      features: [
        'Zero ads experience',
        'HD streaming quality',
        'Watchlist & favorites',
        'Continue watching',
        'Multiple sources',
        'Fast search',
      ],
      status: 'live',
      url: 'https://simplstream.vercel.app',
      platforms: ['web'],
    },
  })

  const simplstreamTV = await prisma.app.create({
    data: {
      name: 'SimplStream TV',
      slug: 'simplstream-tv',
      tagline: 'The ultimate living room experience',
      description: 'SimplStream TV is our biggest project yet. A full-featured streaming application designed for your TV. Navigate with your remote, enjoy a beautiful 10-foot UI, and access all your content from the comfort of your couch. This is streaming, simplified.',
      icon: '📺',
      color: 'cyan',
      screenshots: [
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200',
        'https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=1200',
        'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=1200',
      ],
      features: [
        '10-foot TV interface',
        'Remote control navigation',
        'Voice search support',
        '4K streaming',
        'Profile switching',
        'Parental controls',
        'Chromecast support',
        'Auto-play next episode',
      ],
      status: 'live',
      url: null,
      platforms: ['tv', 'android-tv', 'fire-tv', 'web'],
    },
  })

  console.log('✅ Created apps:', { simplstudy, simplstreamWeb, simplstreamTV })

  // Create Updates
  const updates = await prisma.update.createMany({
    data: [
      {
        appSlug: 'simplstudy',
        title: 'SimplStudy 2.0 is here!',
        content: 'We completely redesigned SimplStudy from the ground up. New AI models, faster performance, and a beautiful new interface. Your study sessions just got a major upgrade.',
        version: '2.0.0',
        type: 'release',
      },
      {
        appSlug: 'simplstudy',
        title: 'New: Export to PDF',
        content: 'You can now export your flashcards and notes directly to PDF. Perfect for printing or sharing with classmates.',
        version: '2.1.0',
        type: 'update',
      },
      {
        appSlug: 'simplstream-web',
        title: 'SimplStream Web Launch',
        content: "We're excited to announce the launch of SimplStream Web! Stream your favorite content directly in your browser with zero ads.",
        version: '1.0.0',
        type: 'release',
      },
      {
        appSlug: 'simplstream-web',
        title: 'New streaming sources added',
        content: "We've added multiple new streaming sources for better availability and faster loading times.",
        version: '1.2.0',
        type: 'update',
      },
      {
        appSlug: 'simplstream-tv',
        title: 'SimplStream TV Beta',
        content: 'Our biggest project yet is now in beta! SimplStream TV brings the ultimate streaming experience to your living room.',
        version: '0.9.0',
        type: 'release',
      },
      {
        appSlug: 'simplstream-tv',
        title: 'Voice search is here',
        content: 'Search for movies and shows using just your voice. Compatible with Android TV and Fire TV remotes.',
        version: '1.0.0',
        type: 'release',
      },
      {
        appSlug: 'simplstream-tv',
        title: '4K streaming support',
        content: 'SimplStream TV now supports 4K streaming on compatible devices. Experience your content in stunning detail.',
        version: '1.1.0',
        type: 'update',
      },
    ],
  })

  console.log('✅ Created updates:', updates)

  // Create Testimonials
  const testimonials = await prisma.testimonial.createMany({
    data: [
      {
        appSlug: 'simplstudy',
        author: 'Alex Chen',
        role: 'Computer Science Student',
        content: "SimplStudy literally saved my GPA. The AI flashcards are insanely good at picking out what's important.",
        rating: 5,
        featured: true,
      },
      {
        appSlug: 'simplstudy',
        author: 'Maria Garcia',
        role: 'Medical Student',
        content: 'I use this every single day. The summarization feature helps me get through massive textbooks in half the time.',
        rating: 5,
        featured: true,
      },
      {
        appSlug: 'simplstream-web',
        author: 'Jake Thompson',
        role: 'Movie Enthusiast',
        content: "Finally, a streaming site that doesn't assault me with ads. Clean, fast, and actually works.",
        rating: 5,
        featured: false,
      },
      {
        appSlug: 'simplstream-tv',
        author: 'Sarah Kim',
        role: 'Parent',
        content: 'Set this up on our living room TV and the kids love it. The parental controls give me peace of mind.',
        rating: 5,
        featured: true,
      },
      {
        appSlug: 'simplstream-tv',
        author: 'David Park',
        role: 'Tech Reviewer',
        content: "The best alternative TV streaming app I've tested. The 10-foot UI is beautifully designed.",
        rating: 5,
        featured: true,
      },
      {
        appSlug: null,
        author: 'Jordan Lee',
        role: 'Software Developer',
        content: 'SimplStudios builds quality apps. You can tell these are made by people who actually use what they build.',
        rating: 5,
        featured: true,
      },
    ],
  })

  console.log('✅ Created testimonials:', testimonials)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
