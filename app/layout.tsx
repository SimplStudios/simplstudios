import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans, Rubik } from 'next/font/google'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ThemeProvider } from '@/components/theme-provider'
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
  metadataBase: new URL('https://simplstudios.vercel.app'),
  title: {
    default: 'SimplStudios - Building Apps That Matter',
    template: '%s | SimplStudios',
  },
  description: 'Student-built software designed to make life simpler. Explore our flagship apps: SimplStudy, SimplStream Web, and SimplStream TV.',
  keywords: ['SimplStudios', 'SimplStudy', 'SimplStream', 'student apps', 'streaming', 'study tools'],
  authors: [{ name: 'SimplStudios' }],
  creator: 'SimplStudios',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  verification: {
    google: 'LYhU1pYARLxsgcZu0rmJr2LeP4IFe-ZRMMl4cvaQKXc',
  },
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jakarta.variable} ${rubik.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 font-jakarta">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
