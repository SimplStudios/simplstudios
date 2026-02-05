import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'live':
      return 'bg-green-500/20 text-green-400'
    case 'beta':
      return 'bg-amber-500/20 text-amber-400'
    case 'coming-soon':
      return 'bg-violet-500/20 text-violet-400'
    default:
      return 'bg-slate-500/20 text-slate-400'
  }
}

export function getAppColor(color: string): string {
  switch (color) {
    case 'blue':
      return 'from-blue-600 to-blue-400'
    case 'violet':
      return 'from-violet-600 to-violet-400'
    case 'cyan':
      return 'from-cyan-600 to-cyan-400'
    case 'green':
      return 'from-green-600 to-green-400'
    default:
      return 'from-blue-600 to-blue-400'
  }
}

export function getAppBorderColor(color: string): string {
  switch (color) {
    case 'blue':
      return 'hover:border-blue-500/50'
    case 'violet':
      return 'hover:border-violet-500/50'
    case 'cyan':
      return 'hover:border-cyan-500/50'
    case 'green':
      return 'hover:border-green-500/50'
    default:
      return 'hover:border-blue-500/50'
  }
}
