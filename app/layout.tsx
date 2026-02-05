import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans, Rubik } from 'next/font/google'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ThemeProvider } from '@/components/theme-provider'
import { cookies } from 'next/headers'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const rubik = Rubik({
  subsets: ['latin'],
  variable: '--font-rubik',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SimplStudios - Building Apps That Matter',
    template: '%s | SimplStudios',
  },
  description: 'Student-built software designed to make life simpler. Explore our flagship apps: SimplStudy, SimplStream Web, and SimplStream TV.',
  keywords: ['SimplStudios', 'SimplStudy', 'SimplStream', 'student apps', 'streaming', 'study tools'],
  authors: [{ name: 'SimplStudios' }],
  creator: 'SimplStudios',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplstudios.vercel.app',
    siteName: 'SimplStudios',
    title: 'SimplStudios - Building Apps That Matter',
    description: 'Student-built software designed to make life simpler.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SimplStudios',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SimplStudios - Building Apps That Matter',
    description: 'Student-built software designed to make life simpler.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const isAdmin = cookieStore.get('admin_session')?.value === 'true'

  return (
    <html lang="en" className={`${outfit.variable} ${jakarta.variable} ${rubik.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 font-jakarta">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar isAdmin={isAdmin} />
          <main className="pt-16">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
