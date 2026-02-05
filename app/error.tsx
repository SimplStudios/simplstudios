'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center px-4">
        <div className="text-8xl mb-6">💥</div>
        <h1 className="text-4xl font-bold font-outfit text-white mb-4">
          Something went wrong
        </h1>
        <p className="text-lg text-slate-400 font-jakarta mb-8 max-w-md mx-auto">
          Don't worry, it's not you - it's us. We're working on fixing it.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={reset}>
            <RefreshCw className="mr-2 w-4 h-4" />
            Try Again
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">
              <Home className="mr-2 w-4 h-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
