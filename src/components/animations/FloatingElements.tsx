'use client'

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-500/20 rounded-full blur-xl"
      />
      
      <div
        className="absolute top-3/4 right-1/4 w-24 h-24 bg-secondary-500/20 rounded-full blur-xl"
      />
      
      <div
        className="absolute bottom-1/4 left-3/4 w-20 h-20 bg-primary-400/15 rounded-full blur-xl"
      />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:64px_64px] opacity-[0.015]" />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10" />
      <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-background to-transparent" />
    </div>
  )
}

export function FloatingIcon({ 
  children, 
  delay = 0,
  duration = 3 
}: { 
  children: React.ReactNode
  delay?: number 
  duration?: number
}) {
  return (
    <div
    >
      {children}
    </div>
  )
}

export function PulsingDot({ 
  className = '', 
  size = 'w-2 h-2' 
}: { 
  className?: string
  size?: string 
}) {
  return (
    <div
      className={`${size} rounded-full bg-primary-500 ${className}`}
    />
  )
}