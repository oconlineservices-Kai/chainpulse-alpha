'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  Wallet, 
  Settings, 
  TrendingUp, 
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Diamond,
  BarChart3
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

type Tab = 'alpha-feed' | 'whale-pulse' | 'analytics' | 'settings'

interface SidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const navigation = [
  {
    id: 'alpha-feed' as Tab,
    name: 'Alpha Feed',
    icon: Activity,
    description: 'Latest signals'
  },
  {
    id: 'whale-pulse' as Tab,
    name: 'Whale Pulse',
    icon: Wallet,
    description: 'Whale movements'
  },
  {
    id: 'analytics' as Tab,
    name: 'Analytics',
    icon: BarChart3,
    description: 'Performance data'
  },
  {
    id: 'settings' as Tab,
    name: 'Settings',
    icon: Settings,
    description: 'Preferences'
  }
]

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-background-card border border-border flex items-center justify-center"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ 
          x: isMobileOpen ? 0 : -280,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className={cn(
          "fixed lg:relative lg:translate-x-0 top-0 left-0 h-screen w-70 bg-background-card/95 backdrop-blur-xl border-r border-border z-40 flex flex-col",
          "lg:w-64"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Diamond className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">ChainPulse</h1>
              <p className="text-text-muted text-xs">Alpha Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = activeTab === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id)
                  setIsMobileOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                  isActive
                    ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-background-hover"
                )}
                whileHover={{ x: isActive ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-primary-400" : "text-text-muted"
                )} />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-text-muted">{item.description}</div>
                </div>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="w-2 h-2 rounded-full bg-primary-400"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          {/* Subscription Status */}
          <div className="mb-4 p-3 rounded-xl bg-success-500/10 border border-success-500/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-success-400" />
              <span className="text-success-400 text-sm font-medium">Premium Active</span>
            </div>
            <p className="text-xs text-text-muted">
              29 days remaining
            </p>
          </div>

          {/* User Menu */}
          <div className="space-y-2">
            <motion.button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-hover transition-all text-sm"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </motion.button>

            <motion.button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-danger-400 hover:bg-danger-500/10 transition-all text-sm"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}