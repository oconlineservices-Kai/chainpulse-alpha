'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Users, Shield, Search, Crown, ChevronLeft, Mail, Calendar, CreditCard, ChevronRight, ChevronLeft as ChevronLeftIcon, Download, UserX, Star, StarOff, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'

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

interface UsersResponse {
  users: User[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(20)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data: UsersResponse = await res.json()
        setUsers(data.users)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } else {
        setError('Failed to load users')
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Network error — check server logs')
    } finally {
      setLoading(false)
    }
  }, [page, search, pageSize])

  useEffect(() => {
    if (status === 'authenticated') fetchUsers()
  }, [status, fetchUsers])

  const performAction = async (userId: string, action: string, value?: string) => {
    setActionLoading(`${userId}-${action}`)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, value }),
      })
      if (res.ok) {
        await fetchUsers()
      } else {
        const data = await res.json()
        setError(data.error || 'Action failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return
    setActionLoading(`${userId}-delete`)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        await fetchUsers()
      } else {
        const data = await res.json()
        setError(data.error || 'Delete failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setActionLoading(null)
    }
  }

  const exportCSV = () => {
    const headers = ['Email', 'Status', 'Credits', 'Role', 'Joined', 'Premium Expires']
    const rows = users.map((u) => [
      u.email,
      u.premiumStatus || 'free',
      String(u.credits ?? 0),
      u.isAdmin ? 'Admin' : 'User',
      u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
      u.premiumExpiresAt ? new Date(u.premiumExpiresAt).toISOString().split('T')[0] : '',
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chainpulse-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const ActionButton = ({ userId, action, value, icon: Icon, label, color }: {
    userId: string; action: string; value?: string; icon: any; label: string; color?: string
  }) => {
    const key = `${userId}-${action}`
    const isLoading = actionLoading === key
    return (
      <button
        onClick={() => performAction(userId, action, value)}
        disabled={isLoading}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
          color || 'bg-primary-500/10 text-primary-400 hover:bg-primary-500/20'
        } disabled:opacity-50`}
        title={label}
      >
        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
        <span className="hidden sm:inline">{label}</span>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16 lg:pt-20">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-danger-900/30 border border-danger-500 rounded-xl">
            <p className="text-sm text-danger-300">{error}</p>
          </div>
        )}

        {/* Search & Actions */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 bg-background-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-background-card border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-primary-500 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <div className="text-sm text-text-muted">
            {loading ? 'Loading...' : `${total} user${total !== 1 ? 's' : ''}`}
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
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-text-muted">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-text-muted">
                      {search ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-background/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-text-muted shrink-0" />
                          <span className="font-mono text-xs break-all">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.premiumStatus === 'premium'
                            ? 'bg-warning-900/40 text-warning-300'
                            : user.premiumStatus === 'cancelled'
                            ? 'bg-danger-900/40 text-danger-300'
                            : user.premiumStatus === 'admin'
                            ? 'bg-danger-900/40 text-danger-300'
                            : 'bg-background text-text-muted'
                        }`}>
                          {user.premiumStatus === 'premium' && <Crown className="w-3 h-3" />}
                          {user.premiumStatus === 'admin' && <Shield className="w-3 h-3" />}
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
                          <Calendar className="w-3 h-3 shrink-0" />
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.premiumStatus !== 'premium' && user.premiumStatus !== 'admin' ? (
                            <ActionButton userId={user.id} action="grantPremium" icon={Crown} label="Premium" color="bg-warning-500/10 text-warning-400 hover:bg-warning-500/20" />
                          ) : (
                            <ActionButton userId={user.id} action="removePremium" icon={StarOff} label="Rm Premium" color="bg-danger-500/10 text-danger-400 hover:bg-danger-500/20" />
                          )}
                          {!user.isAdmin ? (
                            <ActionButton userId={user.id} action="promoteAdmin" icon={Shield} label="Promote" />
                          ) : (
                            <ActionButton userId={user.id} action="demoteAdmin" icon={Star} label="Demote" color="bg-text-muted/10 text-text-muted hover:bg-text-muted/20" />
                          )}
                          <ActionButton userId={user.id} action="addCredits" value="50" icon={Plus} label="+50" color="bg-success-500/10 text-success-400 hover:bg-success-500/20" />
                          <button
                            onClick={() => deleteUser(user.id)}
                            disabled={actionLoading === `${user.id}-delete`}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-danger-500/10 text-danger-400 hover:bg-danger-500/20 disabled:opacity-50"
                            title="Delete user"
                          >
                            {actionLoading === `${user.id}-delete` ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <UserX className="w-3 h-3" />
                            )}
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-text-muted">
              Page {page} of {totalPages} ({total} total)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg bg-background-card border border-border text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg bg-background-card border border-border text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-text-muted">
          Uses dedicated <code>/api/admin/users</code> endpoint with pagination and search.
        </p>
      </main>
    </div>
  )
}
