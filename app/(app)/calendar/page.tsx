'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LGCard from '@/components/LGCard'
import Icon from '@/components/Icon'

interface CalEvent {
  id: string
  title: string
  start: string
  end: string
}

const ACCENT = 'var(--orange)'
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

// Format in the browser so it uses the user's local timezone, not the server's UTC
const fmtTime = (iso: string) => {
  if (!iso || !iso.includes('T')) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function CalendarPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [eventsByDay, setEventsByDay] = useState<Record<number, CalEvent[]>>({})
  const [loading, setLoading] = useState(false)

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  useEffect(() => {
    if (!session?.accessToken) return
    setLoading(true)
    setEventsByDay({})
    fetch(`/api/calendar/month?year=${currentYear}&month=${currentMonth}`)
      .then((r) => r.json())
      .then((d) => {
        const grouped: Record<number, CalEvent[]> = {}
        for (const e of (d.events ?? [])) {
          const date = new Date(e.start)
          if (isNaN(date.getTime())) continue
          const day = date.getDate()
          if (!grouped[day]) grouped[day] = []
          grouped[day].push(e)
        }
        setEventsByDay(grouped)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session?.accessToken, currentMonth, currentYear])

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
    setSelectedDay(1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
    setSelectedDay(1)
  }

  const eventsForDay = (day: number) => eventsByDay[day] ?? []
  const hasEvents = (day: number) => eventsForDay(day).length > 0
  const displayEvents = eventsForDay(selectedDay)

  const eventColor = (i: number) => i % 2 === 0 ? 'var(--sage)' : ACCENT

  if (!session?.accessToken) {
    return (
      <div className="screen-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="calendar" size={28} color="var(--sage)" />
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Your calendar, at a glance</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.6 }}>Atlas reads your Google Calendar and shows your events. Connect your account to get started.</div>
        </div>
        <button onClick={() => router.push('/settings')} className="tappable" style={{ padding: '12px 28px', borderRadius: 'var(--r-full)', background: ACCENT, border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Connect Google
        </button>
      </div>
    )
  }

  return (
    <div className="screen-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['chevL', 'chevR'] as const).map((ic, idx) => (
              <button
                key={ic}
                onClick={idx === 0 ? prevMonth : nextMonth}
                className="tappable"
                style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon name={ic} size={15} color="var(--text-mid)" />
              </button>
            ))}
          </div>
        </div>

        {/* Day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-soft)', paddingBottom: 4 }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <LGCard style={{ padding: '10px 8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isSelected = day === selectedDay
              const dot = hasEvents(day)
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className="tappable"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    padding: '5px 0', borderRadius: 12,
                    background: isSelected ? ACCENT : isToday ? 'oklch(63% 0.14 47 / 0.12)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: isSelected || isToday ? 600 : 400, color: isSelected ? 'white' : 'var(--text)' }}>{day}</span>
                  {dot && <div style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.6)' : ACCENT }} />}
                </div>
              )
            })}
          </div>
        </LGCard>

        {/* Selected day heading */}
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-mid)' }}>
          {MONTH_NAMES[currentMonth]} {selectedDay}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-soft)', fontSize: 13, padding: '8px 0' }}>
            <Icon name="loader" size={14} color="var(--text-soft)" /> Loading events…
          </div>
        ) : displayEvents.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-soft)', padding: '8px 0' }}>No events on this day.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {displayEvents.map((e, i) => (
              <LGCard key={e.id} style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 3, height: 44, borderRadius: 4, background: eventColor(i), flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 2 }}>{fmtTime(e.start)}{fmtTime(e.end) ? `–${fmtTime(e.end)}` : ''}</div>
                </div>
              </LGCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
