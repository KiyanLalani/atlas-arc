'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import LGCard from '@/components/LGCard'
import Icon from '@/components/Icon'

interface CalEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  tag: string
  color: string
}

const ACCENT = 'var(--orange)'

const MOCK_EVENTS: Record<number, CalEvent[]> = {
  30: [
    { id: '1', title: 'Team Standup',  startTime: '10:00', endTime: '10:45', tag: 'Work',     color: 'var(--sage)' },
    { id: '2', title: 'Lunch — James', startTime: '12:30', endTime: '14:00', tag: 'Personal', color: ACCENT },
    { id: '3', title: 'Design Review', startTime: '15:00', endTime: '16:30', tag: 'Work',     color: 'var(--sage)' },
  ],
}

export default function CalendarPage() {
  const { data: session } = useSession()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [googleEvents, setGoogleEvents] = useState<CalEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

  useEffect(() => {
    if (!session?.accessToken) return
    setLoadingEvents(true)
    fetch('/api/calendar')
      .then((r) => r.json())
      .then((d) => {
        const events: CalEvent[] = (d.events || []).map((e: any, i: number) => ({
          id: e.id || String(i),
          title: e.title,
          startTime: e.startTime,
          endTime: e.endTime,
          tag: 'Work',
          color: i % 2 === 0 ? 'var(--sage)' : ACCENT,
        }))
        setGoogleEvents(events)
        setLoadingEvents(false)
      })
      .catch(() => setLoadingEvents(false))
  }, [session?.accessToken])

  const eventsForDay = (day: number): CalEvent[] => {
    if (session?.accessToken && googleEvents.length > 0) {
      if (day === today.getDate() && currentMonth === today.getMonth()) return googleEvents
      return []
    }
    return MOCK_EVENTS[day] || (day % 7 === 3 ? [{ id: '0', title: 'Quick Sync', startTime: '11:00', endTime: '11:30', tag: 'Work', color: 'var(--sage)' }] : [])
  }

  const hasEvents = (day: number) => eventsForDay(day).length > 0

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const displayEvents = eventsForDay(selectedDay)

  return (
    <div className="screen-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            {monthNames[currentMonth]} {currentYear}
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

        {/* Selected day events */}
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-mid)' }}>
          {monthNames[currentMonth]} {selectedDay}
        </div>

        {loadingEvents ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-soft)', fontSize: 13, padding: '8px 0' }}>
            <Icon name="loader" size={14} color="var(--text-soft)" /> Loading events…
          </div>
        ) : displayEvents.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-soft)', padding: '8px 0' }}>No events on this day.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {displayEvents.map((e) => (
              <LGCard key={e.id} style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 3, height: 44, borderRadius: 4, background: e.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 2 }}>{e.startTime}–{e.endTime} · {e.tag}</div>
                </div>
              </LGCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
