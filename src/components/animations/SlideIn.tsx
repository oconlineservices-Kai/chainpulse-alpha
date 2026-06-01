'use client'

import { ReactNode } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right'

interface SlideInProps {
  children: ReactNode
  direction?: Direction
  delay?: number
  duration?: number
  distance?: number
  className?: string
}

const getInitialPosition = (direction: Direction, distance: number) => {
  switch (direction) {
    case 'up':
      return { x: 0, y: distance }
    case 'down':
      return { x: 0, y: -distance }
    case 'left':
      return { x: distance, y: 0 }
    case 'right':
      return { x: -distance, y: 0 }
    default:
      return { x: 0, y: distance }
  }
}

export default function SlideIn({ 
  children, 
  direction = 'up',
  delay = 0, 
  duration = 0.5,
  distance = 30,
  className = '' 
}: SlideInProps) {
  const initialPos = getInitialPosition(direction, distance)
  
  return (
    <div
      className={className}
    >
      {children}
    </div>
  )
}