'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Users, Shield, Search, Crown, ChevronLeft, Mail, Calendar, CreditCard } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  premiumStatus: string
  credits: number
  isAdmin: boolean
  createdAt: string
  updatedAt: string
  premiumExpiresAt?: string | null
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Auth guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    if (status === 'authenticated' && !(session?.user as { isAdmin?: boolean })?.isAdmin) {
      router.push('/dashboard')
      return
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated') fetchUsers()
  }, [status])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/enhanced-stats')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users ?? [])
      } else {
        setError('Failed to load users')
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Network error — check server logs')
    } finally {
      setLoading(false)
    }
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background pt-16 lg:pt-20">
      {/* Header */}
      <header className="border-b border-border bg-background-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-text-muted hover:text-text-primary mr-2">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg">User Management</h1>
              <p className="text-xs text-text-muted">ChainPulse Alpha Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-sm text-text-secondary hover:text-text-primary">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-danger-900/30 border border-danger-500 rounded-xl">
            <p className="text-sm text-danger-300">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="text-sm text-text-muted">
            {loading ? 'Loading...' : `${filtered.length} user${filtered.length !== 1 ? 's' : ''}`}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-background-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted border-b border-border bg-background/50">
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Credits</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Premium Expires</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-text-muted">
                      Loading users...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-text-muted">
                      {search ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(user => (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-background/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-text-muted shrink-0" />
                          <span className="font-mono text-xs">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.premiumStatus === 'premium'
                            ? 'bg-warning-900/40 text-warning-300'
                            : user.premiumStatus === 'cancelled'
                            ? 'bg-danger-900/40 text-danger-300'
                            : 'bg-background text-text-muted'
                        }`}>
                          {user.premiumStatus === 'premium' && <Crown className="w-3 h-3" />}
                          {user.premiumStatus ?? 'free'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 text-text-secondary">
                          <CreditCard className="w-3 h-3" />
                          {user.credits ?? 0}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {user.isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-danger-900/40 text-danger-300">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="text-text-muted text-xs">User</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-text-muted text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-text-muted text-xs">
                        {user.premiumExpiresAt
                          ? new Date(user.premiumExpiresAt).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info note */}
        <p className="mt-4 text-xs text-text-muted">
          User list is pulled from <code>/api/admin/enhanced-stats</code>. 
          Requires admin session to access.
        </p>
      </main>
    </div>
  )
}
