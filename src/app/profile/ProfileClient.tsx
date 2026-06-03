'use client';

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
interface UserProfile {
  id: string
  email: string
  name: string
  premiumStatus: 'free' | 'premium' | 'pay_per_alpha'
  credits: number
  createdAt: string
  lastLogin: string
  emailNotifications: boolean
  pushNotifications: boolean
  twoFactorEnabled: boolean
}

type TabType = 'account' | 'subscription' | 'notifications' | 'security'

export default function ProfileClient() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<TabType>('account')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login'
    }
  }, [status])

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      const userData = data.user || data
      setProfile(userData)
      setNewName(userData.name || '')
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty' })
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Server error: ${response.status}`)
      }
      
      const result = await response.json()
      setProfile(result.user)
      setEditingName(false)
      setMessage({ type: 'success', text: 'Name updated successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update name' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      setPasswordMessage({ type: 'error', text: 'Enter your current password' })
      return
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters' })
      return
    }

    try {
      setChangingPassword(true)
      setPasswordMessage(null)
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to update password' })
        return
      }

      setPasswordMessage({ type: 'success', text: 'Password updated successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setTimeout(() => setPasswordMessage(null), 5000)
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleNotificationToggle = async (type: 'emailNotifications' | 'pushNotifications') => {
    try {
      setSaving(true)
      const newValue = !profile?.[type]
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [type]: newValue }),
      })

      if (!response.ok) throw new Error('Failed to update preferences')
      
      setProfile(prev => prev ? { ...prev, [type]: newValue } : null)
      setMessage({ type: 'success', text: 'Preferences updated' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update preferences' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-700/60 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ⚡ ChainPulse
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Profile</span>
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Header Card */}
        <div
          className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/60 rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
              <p className="text-slate-400">
                {profile?.email}
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-700/50 rounded-xl border border-slate-600/60">
              <span className="text-sm text-slate-300">Status:</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                profile?.premiumStatus === 'premium'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                  : profile?.premiumStatus === 'pay_per_alpha'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-600/30 text-slate-300 border border-slate-500/30'
              }`}>
                {profile?.premiumStatus === 'premium' ? '👑 Premium' : profile?.premiumStatus === 'pay_per_alpha' ? '💎 Alpha Pass' : '🔓 Free'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex gap-2 mb-8 border-b border-slate-700/60 flex-wrap">
          {(['account', 'subscription', 'notifications', 'security'] as TabType[]).map((tab) => (
            <button
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-all border-b-2 ${
                activeTab === tab
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              {tab === 'account' && '👤 Account'}
              {tab === 'subscription' && '💳 Subscription'}
              {tab === 'notifications' && '🔔 Notifications'}
              {tab === 'security' && '🔒 Security'}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div
        >
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Name Setting */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Display Name</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {editingName ? (
                    <>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your name"
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingName(false)
                          setNewName(profile?.name || '')
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="text-slate-400 text-sm mb-1">Current name</p>
                        <p className="text-white text-lg">{profile?.name || 'Not set'}</p>
                      </div>
                      <button
                        onClick={() => setEditingName(true)}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Email Setting */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Email Address</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Primary email</p>
                    <p className="text-white text-lg">{profile?.email}</p>
                  </div>
                  <button className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition">
                    Change Email
                  </button>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Member since</span>
                    <span className="text-white">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last login</span>
                    <span className="text-white">
                      {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-red-300">Danger Zone</h3>
                <p className="text-slate-400 text-sm mb-4">Deleting your account is permanent and cannot be undone.</p>
                <button className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 hover:text-red-200 px-6 py-2 rounded-lg font-medium transition">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Plan Type</p>
                    <p className="text-2xl font-bold text-white capitalize">
                      {profile?.premiumStatus === 'premium' ? 'Pro Plan' : profile?.premiumStatus === 'pay_per_alpha' ? 'Alpha Pass' : 'Free Plan'}
                    </p>
                  </div>
                  {profile?.premiumStatus === 'pay_per_alpha' && (
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Credits Available</p>
                      <p className="text-2xl font-bold text-amber-400">{profile?.credits}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Plan Comparison */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Plan Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={profile?.premiumStatus === 'free' ? '❌' : '✅'}>Signal Access</span>
                    <span className="text-slate-400">
                      {profile?.premiumStatus === 'free' ? '5 daily signals (24hr delay)' : 'All signals (real-time)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={profile?.premiumStatus === 'free' ? '❌' : '✅'}>Performance Analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={profile?.premiumStatus === 'free' ? '❌' : '✅'}>Diamond Signals Priority</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={profile?.premiumStatus !== 'premium' ? '❌' : '✅'}>Priority Support</span>
                  </div>
                </div>
              </div>

              {/* Upgrade CTA */}
              {profile?.premiumStatus === 'free' && (
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
                  <p className="text-slate-300 mb-4">Get unlimited signals, real-time alerts, and performance analytics for $49/month.</p>
                  <Link href="/pricing" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition">
                    View Plans
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
                
                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Email Notifications</p>
                      <p className="text-sm text-slate-400">Receive signal alerts via email</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle('emailNotifications')}
                      disabled={saving}
                      className={`relative w-14 h-8 rounded-full transition ${
                        profile?.emailNotifications ? 'bg-blue-600' : 'bg-slate-600'
                      }`}
                      role="switch"
                      aria-checked={profile?.emailNotifications}
                    >
                      <div
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition transform ${
                          profile?.emailNotifications ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Push Notifications</p>
                      <p className="text-sm text-slate-400">Receive real-time push notifications (requires app permission)</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle('pushNotifications')}
                      disabled={saving}
                      className={`relative w-14 h-8 rounded-full transition ${
                        profile?.pushNotifications ? 'bg-blue-600' : 'bg-slate-600'
                      }`}
                      role="switch"
                      aria-checked={profile?.pushNotifications}
                    >
                      <div
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition transform ${
                          profile?.pushNotifications ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Signal Type Preferences</h3>
                <p className="text-slate-400 text-sm mb-4">Customize which signal types you want to receive notifications for.</p>
                <div className="space-y-3">
                  {['Whale Signals', 'Sentiment Signals', 'Diamond Signals'].map((type) => (
                    <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-700/20 rounded-lg transition">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-white">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Password</h3>
                
                {/* Password change form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition"
                    >
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                    {passwordMessage && (
                      <span className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {passwordMessage.text}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="font-medium text-white">2FA Status</p>
                    <p className="text-sm text-slate-400">
                      {profile?.twoFactorEnabled ? 'Enabled - Your account is secured' : 'Disabled - Enable for extra security'}
                    </p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition">
                    {profile?.twoFactorEnabled ? 'Manage' : 'Enable'}
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// ── Telegram removed — notifications handled in-app only
