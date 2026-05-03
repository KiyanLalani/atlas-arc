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
      style={{
        position: 'fixed',
        bottom: 'max(20px, calc(14px + env(safe-area-inset-bottom, 0px)))',
        left: 16,
        right: 16,
        height: 64,
        borderRadius: 36,
        background: 'rgba(252, 248, 244, 0.88)',
        backdropFilter: 'blur(48px) saturate(200%) brightness(1.06)',
        WebkitBackdropFilter: 'blur(48px) saturate(200%) brightness(1.06)',
        border: '1px solid rgba(255, 255, 255, 0.95)',
        boxShadow:
          '0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        paddingTop: 8,
        paddingLeft: 6,
        paddingRight: 6,
        zIndex: 100,
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
              gap: 4,
              textDecoration: 'none',
              padding: '4px 12px',
              flex: 1,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: isActive ? 'oklch(63% 0.14 47 / 0.14)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.18s ease, transform 0.18s cubic-bezier(0.34,1.4,0.64,1)',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              <Icon
                name={n.icon}
                size={20}
                color={isActive ? 'var(--orange)' : 'var(--text-soft)'}
                sw={isActive ? 2.1 : 1.6}
              />
            </div>
            <span
              style={{
                fontSize: 10,
                color: isActive ? 'var(--orange)' : 'var(--text-soft)',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.02em',
                transition: 'color 0.18s ease',
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
