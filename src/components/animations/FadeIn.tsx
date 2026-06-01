'use client'

import { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  once?: boolean
}

export default function FadeIn({ 
  children, 
  className = '',
}: FadeInProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function FadeInStagger({ 
  children, 
  className = '' 
}: {
  children: ReactNode[]
  stagger?: number
  delay?: number
  className?: string
}) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
