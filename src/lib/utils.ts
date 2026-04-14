import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B'
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M'
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function truncateAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-success-400 bg-success-500/20'
  if (score >= 80) return 'text-primary-400 bg-primary-500/20'
  if (score >= 70) return 'text-warning-400 bg-warning-500/20'
  return 'text-danger-400 bg-danger-500/20'
}

export function getRecommendationStyle(recommendation: 'Buy' | 'Sell' | 'Skip'): string {
  switch (recommendation) {
    case 'Buy':
      return 'text-success-400 bg-success-500/20 border-success-500/30'
    case 'Sell':
      return 'text-danger-400 bg-danger-500/20 border-danger-500/30'
    case 'Skip':
      return 'text-warning-400 bg-warning-500/20 border-warning-500/30'
    default:
      return 'text-text-muted bg-background-muted border-border'
  }
}

export function getTimeAgo(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return then.toLocaleDateString()
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}