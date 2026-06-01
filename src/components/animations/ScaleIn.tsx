'use client'

import { ReactNode } from 'react'

interface ScaleInProps {
  children: ReactNode
  delay?: number
  duration?: number
  scale?: number
  className?: string
}

export default function ScaleIn({ 
  children, 
  delay = 0, 
  duration = 0.3,
  scale = 0.95,
  className = '' 
}: ScaleInProps) {
  return (
    <div
      className={className}
    >
      {children}
    </div>
  )
}

export function HoverScale({ 
  children, 
  scale = 1.02, 
  duration = 0.2,
  className = '' 
}: {
  children: ReactNode
  scale?: number
  duration?: number
  className?: string
}) {
  return (
    <div
      className={className}
    >
      {children}
    </div>
  )
}