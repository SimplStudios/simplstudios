import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: 'live' | 'beta' | 'coming-soon' | 'platform' | 'default'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    live: 'bg-green-500/20 text-green-400',
    beta: 'bg-amber-500/20 text-amber-400',
    'coming-soon': 'bg-violet-500/20 text-violet-400',
    platform: 'bg-slate-700 text-slate-300',
    default: 'bg-slate-700 text-slate-300',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-rubik',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
