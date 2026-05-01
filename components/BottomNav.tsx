'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from './Icon'

const NAV = [
  { href: '/',          icon: 'home'     as const, label: 'Home' },
  { href: '/calendar',  icon: 'calendar' as const, label: 'Calendar' },
  { href: '/chat',      icon: 'chat'     as const, label: 'Atlas' },
  { href: '/mail',      icon: 'mail'     as const, label: 'Mail' },
  { href: '/reminders', icon: 'bell'     as const, label: 'Remind' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--bottom-nav-space)',
        borderRadius: '0 0 0 0',
        borderTop: '1px solid rgba(255,255,255,0.9)',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 'calc(16px + var(--safe-bottom))',
        zIndex: 100,
        backdropFilter: 'blur(40px) saturate(180%) brightness(1.04)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%) brightness(1.04)',
      }}
    >
      {NAV.map((n) => {
        const isActive = pathname === n.href
        return (
          <Link
            key={n.href}
            href={n.href}
            className="tappable"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              textDecoration: 'none',
              padding: '4px 10px',
            }}
          >
            <div
              style={{
                width: 44,
                height: 30,
                borderRadius: 'var(--r-sm)',
                background: isActive ? 'oklch(63% 0.14 47 / 0.13)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease',
              }}
            >
              <Icon
                name={n.icon}
                size={19}
                color={isActive ? 'var(--orange)' : 'var(--text-soft)'}
                sw={isActive ? 2 : 1.6}
              />
            </div>
            <span
              style={{
                fontSize: 10,
                color: isActive ? 'var(--orange)' : 'var(--text-soft)',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.01em',
                transition: 'color 0.2s',
              }}
            >
              {n.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
