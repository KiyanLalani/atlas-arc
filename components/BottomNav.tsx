'use client'

import { useState } from 'react'
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

const ANGLES_DEG = [82, 63, 46, 30, 16]
const RADIUS = 94

export default function BottomNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const fabBottom = 'max(28px, calc(22px + env(safe-area-inset-bottom, 0px)))'

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 98,
            background: 'rgba(0,0,0,0.06)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
      )}

      {NAV.map((n, i) => {
        const rad = ANGLES_DEG[i] * (Math.PI / 180)
        const tx = Math.cos(rad) * RADIUS
        const ty = Math.sin(rad) * RADIUS
        const isActive = pathname === n.href
        const labelRight = ANGLES_DEG[i] > 45

        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className="tappable"
            style={{
              position: 'fixed',
              bottom: fabBottom,
              left: 24,
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: isActive ? 'oklch(63% 0.14 47)' : 'rgba(252,248,244,0.96)',
              border: '1px solid rgba(255,255,255,0.92)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99,
              textDecoration: 'none',
              transform: open
                ? `translate(${tx}px, -${ty}px)`
                : 'translate(0,0) scale(0.5)',
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transition: open
                ? `transform 0.38s cubic-bezier(0.34,1.56,0.64,1) ${i * 40}ms, opacity 0.18s ease ${i * 28}ms`
                : `transform 0.22s cubic-bezier(0.55,0,1,0.45) ${(NAV.length - 1 - i) * 28}ms, opacity 0.14s ease ${(NAV.length - 1 - i) * 18}ms`,
            }}
          >
            <Icon
              name={n.icon}
              size={20}
              color={isActive ? 'white' : 'var(--text-soft)'}
              sw={isActive ? 2.1 : 1.6}
            />
            <span
              style={{
                position: 'absolute',
                ...(labelRight
                  ? { left: 56, top: '50%', transform: 'translateY(-50%)' }
                  : { bottom: 56, left: '50%', transform: 'translateX(-50%)' }),
                fontSize: 11,
                fontWeight: 600,
                color: isActive ? 'oklch(63% 0.14 47)' : 'var(--text)',
                whiteSpace: 'nowrap',
                background: 'rgba(252,248,244,0.94)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.8)',
                padding: '3px 9px',
                borderRadius: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                pointerEvents: 'none',
              }}
            >
              {n.label}
            </span>
          </Link>
        )
      })}

      <button
        onClick={() => setOpen(!open)}
        className="tappable"
        style={{
          position: 'fixed',
          bottom: fabBottom,
          left: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: open ? 'oklch(63% 0.14 47)' : 'rgba(252,248,244,0.92)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.96)',
          boxShadow: open
            ? '0 8px 32px rgba(200,100,40,0.25), 0 2px 8px rgba(0,0,0,0.1)'
            : '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          cursor: 'default',
          transition: 'background 0.25s ease, box-shadow 0.25s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          <Icon
            name="plus"
            size={22}
            color={open ? 'white' : 'var(--text)'}
            sw={open ? 2.2 : 1.8}
          />
        </div>
      </button>
    </>
  )
}
