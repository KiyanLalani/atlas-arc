'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LGCard from '@/components/LGCard'
import Icon from '@/components/Icon'

const ACCENT = 'var(--orange)'

interface WeatherStrip {
  city: string
  temp: number
  condition: string
  mini: { label: string; temp: number }[]
}

interface CalEvent { title: string; startTime: string; tag: string }

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const name = session?.user?.name?.split(' ')[0] || 'there'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,'

  const [weather, setWeather] = useState<WeatherStrip | null>(null)
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [events, setEvents] = useState<CalEvent[]>([])
  const [eventsLoaded, setEventsLoaded] = useState(false)

  // Weather — always fetch, no auth required
  useEffect(() => {
    fetch('/api/weather')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return
        const mini = (d.weekly ?? []).slice(1, 4).map((w: any) => ({ label: w.day, temp: w.hi }))
        setWeather({ city: d.city, temp: d.temp, condition: d.condition, mini })
      })
      .catch(() => {})
  }, [])

  // Atlas summary + events — only when signed in
  useEffect(() => {
    if (!session?.accessToken) return

    setSummaryLoading(true)
    fetch('/api/summary')
      .then((r) => r.json())
      .then((d) => { setSummary(d.summary ?? ''); setSummaryLoading(false) })
      .catch(() => setSummaryLoading(false))

    fetch('/api/calendar')
      .then((r) => r.json())
      .then((d) => { setEvents((d.events ?? []).slice(0, 3)); setEventsLoaded(true) })
      .catch(() => setEventsLoaded(true))
  }, [session?.accessToken])

  const eventColor = (i: number) => i % 2 === 0 ? 'var(--sage)' : ACCENT

  return (
    <div className="screen-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-soft)', fontWeight: 400 }}>{greeting}</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>{name}</div>
          </div>
          <button onClick={() => router.push('/settings')} className="tappable" style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--orange), oklch(68% 0.13 28))', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
            {session?.user?.image
              ? <img src={session.user.image} alt={name} style={{ width: 42, height: 42, objectFit: 'cover' }} />
              : <span style={{ color: 'white', fontSize: 17, fontWeight: 600 }}>{name.charAt(0).toUpperCase()}</span>}
          </button>
        </div>

        {/* Weather strip */}
        <LGCard onClick={() => router.push('/weather')} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>{weather?.city ?? '—'}</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 200, color: 'var(--text)', lineHeight: 1 }}>
                {weather ? `${weather.temp}°` : '—'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 5 }}>
                {weather?.condition ?? 'Loading…'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'oklch(63% 0.14 47 / 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="sun" size={24} color={ACCENT} />
            </div>
            {weather && (
              <div style={{ display: 'flex', gap: 10 }}>
                {weather.mini.map((d) => (
                  <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: 9, color: 'var(--text-soft)' }}>{d.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-mid)' }}>{d.temp}°</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </LGCard>

        {/* Atlas summary */}
        <LGCard style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, background: 'linear-gradient(135deg, var(--orange), oklch(68% 0.12 28))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="sparkle" size={14} color="white" sw={1.8} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Atlas Summary</span>
            {session?.accessToken && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-soft)' }}>AI-generated</span>}
          </div>
          {!session?.accessToken ? (
            <p style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.58 }}>
              Connect your Google account to get a personalised AI briefing of your day — emails, calendar, and more.{' '}
              <button onClick={() => router.push('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, fontSize: 13.5, fontWeight: 500, padding: 0, textDecoration: 'underline' }}>
                Connect Google →
              </button>
            </p>
          ) : summaryLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-soft)', fontSize: 13 }}>
              <Icon name="loader" size={14} color="var(--text-soft)" /> Generating your briefing…
            </div>
          ) : (
            <p style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.58 }}>{summary}</p>
          )}
        </LGCard>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: 'calendar' as const, label: 'Calendar',  color: 'var(--sage)',  bg: 'var(--sage-light)',              href: '/calendar' },
            { icon: 'mail'     as const, label: 'Email',     color: 'var(--slate)', bg: 'var(--slate-light)',             href: '/mail' },
            { icon: 'bell'     as const, label: 'Reminders', color: ACCENT,         bg: 'oklch(63% 0.14 47 / 0.09)',     href: '/reminders' },
            { icon: 'cloud'    as const, label: 'Weather',   color: 'var(--slate)', bg: 'var(--slate-light)',             href: '/weather' },
          ].map((a) => (
            <LGCard key={a.label} onClick={() => router.push(a.href)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={a.icon} size={17} color={a.color} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{a.label}</span>
            </LGCard>
          ))}
        </div>

        {/* Today's events */}
        <LGCard style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Today</span>
            <button onClick={() => router.push('/calendar')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, color: ACCENT, fontSize: 12, fontWeight: 500 }}>
              See all <Icon name="chevR" size={13} color={ACCENT} />
            </button>
          </div>
          {!session?.accessToken ? (
            <p style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.55 }}>
              <button onClick={() => router.push('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, fontSize: 13, fontWeight: 500, padding: 0 }}>
                Connect Google Calendar
              </button>{' '}to see your events here.
            </p>
          ) : !eventsLoaded ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-soft)', fontSize: 13 }}>
              <Icon name="loader" size={13} color="var(--text-soft)" /> Loading…
            </div>
          ) : events.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>Nothing scheduled for today.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {events.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 3, height: 38, borderRadius: 4, background: eventColor(i), flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{e.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>{e.startTime}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </LGCard>
      </div>
    </div>
  )
}
