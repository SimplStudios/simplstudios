'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Apps', href: '/apps' },
  { name: 'Updates', href: '/updates' },
  { name: 'About', href: '/about' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800" />

      <nav className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8" aria-label="Global">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-1">
            <span className="text-2xl font-bold font-outfit tracking-tight">
              <span className="text-blue-500 group-hover:text-blue-400 transition-colors">Simpl</span>
              <span className="text-white">Studios</span>
            </span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center gap-x-8 justify-center flex-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium font-jakarta transition-all hover:text-white',
                  pathname === item.href
                    ? 'text-white'
                    : 'text-slate-400'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side - Theme Toggle */}
          <div className="hidden md:flex items-center justify-end flex-1 gap-4">
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
            <div className="flex flex-col p-4 gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'text-base font-medium font-jakarta px-4 py-3 rounded-xl transition-colors',
                    pathname === item.href
                      ? 'bg-blue-600/10 text-blue-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
