'use client'

import { CSSProperties, ReactNode } from 'react'

interface LGCardProps {
  children: ReactNode
  style?: CSSProperties
  className?: string
  onClick?: () => void
  radius?: string
}

export default function LGCard({
  children,
  style,
  className = '',
  onClick,
  radius = 'var(--r)',
}: LGCardProps) {
  return (
    <div
      onClick={onClick}
      className={`lg ${onClick ? 'tappable' : ''} ${className}`}
      style={{ borderRadius: radius, ...style }}
    >
      {children}
    </div>
  )
}
