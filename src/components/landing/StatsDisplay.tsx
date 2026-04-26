'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Zap, Shield, Users } from 'lucide-react'

interface PublicStats {
  totalUsers: number
  totalPayments: number
  totalSignals: number
  waitlistCount: number
}

export function useLiveStats() {
  const [stats, setStats] = useState<PublicStats | null>(null)

  useEffect(() => {
    fetch('/api/public/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {/* silently fail — fallback to null */})
  }, [])

  return stats
}

export default function StatsDisplay() {
  const stats = useLiveStats()

  const items = [
    {
      icon: Users,
      value: stats ? `${stats.totalUsers}+` : '40+',
      label: 'Crypto Traders',
      color: 'text-primary-400',
    },
    {
      icon: Zap,
      value: '85%',
      label: 'Diamond Signal Accuracy',
      color: 'text-warning-400',
    },
    {
      icon: Shield,
      value: '24/7',
      label: 'AI Monitoring',
      color: 'text-success-400',
    },
  ]

  return { items, stats }
}
