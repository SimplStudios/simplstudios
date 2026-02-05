import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center px-4">
        <div className="text-9xl font-bold font-outfit text-slate-800 mb-4">
          404
        </div>
        <h1 className="text-4xl font-bold font-outfit text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-slate-400 font-jakarta mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 w-4 h-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/apps">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Browse Apps
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
