"use client"

import { motion } from "framer-motion"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-slate-800 rounded-lg ${className}`}
    />
  )
}

export function SignalCardSkeleton() {
  return (
    <div className="bg-[#12121a] border border-slate-800 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-24 h-4" />
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      
      {/* Scores */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
        <div className="space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-16 h-3 mx-auto" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-16 h-3 mx-auto" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-16 h-3 mx-auto" />
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-4" />
      </div>
    </div>
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-[#12121a] border border-slate-800 rounded-xl p-6 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="w-24 h-4" />
      </div>
      <Skeleton className="w-20 h-8" />
      <Skeleton className="w-32 h-3" />
    </div>
  )
}

export function FilterSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="w-20 h-10 rounded-lg" />
      <Skeleton className="w-24 h-10 rounded-lg" />
      <Skeleton className="w-20 h-10 rounded-lg" />
      <Skeleton className="w-28 h-10 rounded-lg" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <FilterSkeleton />
        <Skeleton className="w-64 h-10 rounded-lg" />
      </div>
      
      {/* Signal Cards */}
      <div className="grid gap-4">
        <SignalCardSkeleton />
        <SignalCardSkeleton />
        <SignalCardSkeleton />
        <SignalCardSkeleton />
        <SignalCardSkeleton />
      </div>
    </div>
  )
}

export default Skeleton
