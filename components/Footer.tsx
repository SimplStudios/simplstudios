import Link from 'next/link'
import { Github, Twitter, Mail } from 'lucide-react'
import { CareersModal } from '@/components/CareersModal'

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block group">
              <span className="text-2xl font-bold font-outfit tracking-tight">
                <span className="text-blue-500 group-hover:text-blue-400 transition-colors">Simpl</span>
                <span className="text-white">Studios</span>
              </span>
            </Link>
            <p className="mt-6 text-slate-400 font-jakarta max-w-sm leading-relaxed">
              Building apps that matter. Student-built software designed to make life simpler, more productive, and enjoyable.
            </p>
            <div className="mt-8 flex gap-5">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors hover:scale-110 transform duration-200"
              >
                <Github className="h-6 w-6" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors hover:scale-110 transform duration-200"
              >
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="mailto:hello@simplstudios.com"
                className="text-slate-400 hover:text-white transition-colors hover:scale-110 transform duration-200"
              >
                <Mail className="h-6 w-6" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold font-outfit text-white mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/apps" className="text-slate-400 hover:text-blue-400 font-jakarta transition-colors">
                  All Apps
                </Link>
              </li>
              <li>
                <Link href="/updates" className="text-slate-400 hover:text-blue-400 font-jakarta transition-colors">
                  Updates
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-blue-400 font-jakarta transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Apps */}
          <div>
            <h3 className="text-lg font-bold font-outfit text-white mb-6">Our Apps</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/apps/simplstudy" className="text-slate-400 hover:text-blue-400 font-jakarta transition-colors">
                  SimplStudy
                </Link>
              </li>
              <li>
                <Link href="/apps/simplstream-web" className="text-slate-400 hover:text-blue-400 font-jakarta transition-colors">
                  SimplStream Web
                </Link>
              </li>
              <li>
                <Link href="/apps/simplstream-tv" className="text-slate-400 hover:text-blue-400 font-jakarta transition-colors">
                  SimplStream TV
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm font-jakarta text-center md:text-left">
            © {new Date().getFullYear()} SimplStudios. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <CareersModal />
            <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
