'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

type Tab = 'alpha-feed' | 'whale-pulse' | 'analytics' | 'settings'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeTab, setActiveTab] = useState<Tab>('alpha-feed')

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <Header />
          
          <main className="p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}