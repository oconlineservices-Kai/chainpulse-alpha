'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  ChevronDown,
  Zap,
  Clock,
  Filter,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

export default function Header() {
  const { data: session } = useSession()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const userEmail = session?.user?.email || 'user@example.com'
  const userInitials = userEmail.slice(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-30 bg-background-card/95 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Search */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search signals, tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-background-hover border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-text-muted hover:bg-primary-500 flex items-center justify-center transition-colors"
                onClick={() => setSearchQuery('')}
              >
                <span className="text-xs text-white">×</span>
              </motion.button>
            )}
          </div>
          
          <motion.button
            className="p-2 rounded-xl bg-background-hover border border-border hover:border-primary-500 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-4 h-4 text-text-muted" />
          </motion.button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-500/10 border border-success-500/20">
            <div className="relative">
              <div className="w-2 h-2 bg-success-400 rounded-full" />
              <motion.div
                className="absolute inset-0 bg-success-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-success-400 text-sm font-medium">Live</span>
          </div>

          {/* Last Update */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-text-muted">
            <Clock className="w-4 h-4" />
            <span>Updated 2m ago</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              className="p-2 rounded-xl bg-background-hover border border-border hover:border-primary-500 transition-all relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5 text-text-muted" />
              {/* Notification dot */}
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-warning-500 rounded-full border-2 border-background-card"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <motion.button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-2 rounded-xl bg-background-hover border border-border hover:border-primary-500 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold text-sm">
                {userInitials}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-text-primary truncate max-w-[120px]">{userEmail}</div>
                <div className="text-xs text-text-muted">Free</div>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-text-muted transition-transform",
                isProfileOpen && "rotate-180"
              )} />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsProfileOpen(false)}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-background-card border border-border rounded-xl shadow-xl z-20"
                  >
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                          {userInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-text-primary truncate max-w-[140px]">{userEmail}</div>
                          <div className="text-sm text-text-muted">Free Plan</div>
                        </div>
                      </div>
                      
                      {/* Plan Status */}
                      <div className="mt-3 p-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary-400" />
                            <span className="text-primary-400 font-medium text-sm">Premium</span>
                          </div>
                          <Badge variant="success" size="sm">Free</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <motion.button
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-hover transition-all text-sm"
                        whileHover={{ x: 2 }}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile Settings</span>
                      </motion.button>
                      
                      <motion.button
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-hover transition-all text-sm"
                        whileHover={{ x: 2 }}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Preferences</span>
                      </motion.button>
                      
                      <div className="my-2 h-px bg-border" />
                      
                      <motion.button
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-danger-400 hover:bg-danger-500/10 transition-all text-sm"
                        whileHover={{ x: 2 }}
                        onClick={() => signOut({ callbackUrl: '/' })}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}