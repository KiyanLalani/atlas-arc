'use client'

import { useEffect, useState } from 'react'
import LGCard from '@/components/LGCard'
import Icon from '@/components/Icon'

const ACCENT = 'var(--orange)'

interface WeatherData {
  city: string
  temp: number
  condition: string
  humidity: number
  wind: number
  uvIndex: number
  hourly: Array<{ t: string; temp: number; icon: 'sun' | 'cloud' | 'drop' }>
  weekly: Array<{ day: string; hi: number; lo: number; icon: 'sun' | 'cloud' | 'drop'; summary: string }>
  atlasSuggestion: string
}

const MOCK: WeatherData = {
  city: 'London, United Kingdom',
  temp: 18,
  condition: 'Partly Cloudy',
  humidity: 62,
  wind: 12,
  uvIndex: 4,
  hourly: [
    { t: 'Now', temp: 18, icon: 'sun' },
    { t: '1pm', temp: 20, icon: 'sun' },
    { t: '2pm', temp: 21, icon: 'sun' },
    { t: '3pm', temp: 20, icon: 'cloud' },
    { t: '4pm', temp: 19, icon: 'cloud' },
    { t: '5pm', temp: 17, icon: 'cloud' },
  ],
  weekly: [
    { day: 'Today', hi: 21, lo: 13, icon: 'sun',   summary: 'Sunny' },
    { day: 'Thu',   hi: 19, lo: 11, icon: 'cloud', summary: 'Cloudy' },
    { day: 'Fri',   hi: 16, lo: 10, icon: 'drop',  summary: 'Rainy' },
    { day: 'Sat',   hi: 18, lo: 12, icon: 'cloud', summary: 'Overcast' },
    { day: 'Sun',   hi: 23, lo: 14, icon: 'sun',   summary: 'Sunny' },
  ],
  atlasSuggestion: 'Rain expected Friday — your outdoor meeting has been flagged. Consider rescheduling or moving it indoors.',
}

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData>(MOCK)

  useEffect(() => {
    fetch('/api/weather')
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setWeather({ ...MOCK, ...d }) })
      .catch(() => {})
  }, [])

  return (
    <div className="screen-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 13 }}>

        {/* Hero */}
        <LGCard style={{ padding: '26px 22px', textAlign: 'center', background: 'linear-gradient(160deg, oklch(63% 0.14 47 / 0.12) 0%, oklch(90% 0.04 200 / 0.3) 100%)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 4 }}>{weather.city}</div>
          <div style={{ fontSize: 80, fontWeight: 200, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1 }}>{weather.temp}°</div>
          <div style={{ fontSize: 16, color: 'var(--text-mid)', marginTop: 6, fontWeight: 400 }}>{weather.condition}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 18 }}>
            {[
              { icon: 'drop'  as const, label: `${weather.humidity}% humidity` },
              { icon: 'wind'  as const, label: `${weather.wind} km/h` },
              { icon: 'sun'   as const, label: `UV index ${weather.uvIndex}` },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <Icon name={s.icon} size={17} color="var(--text-mid)" />
                <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </LGCard>

        {/* Hourly */}
        <LGCard style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Hourly</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {weather.hourly.map((h, i) => (
              <div
                key={i}
                className="lg"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, padding: '8px 12px', borderRadius: 16, border: i === 0 ? `1.5px solid oklch(63% 0.14 47 / 0.27)` : undefined, background: i === 0 ? 'oklch(63% 0.14 47 / 0.07)' : undefined }}
              >
                <span style={{ fontSize: 10, color: i === 0 ? ACCENT : 'var(--text-soft)', fontWeight: i === 0 ? 600 : 400 }}>{h.t}</span>
                <Icon name={h.icon} size={18} color={i === 0 ? ACCENT : 'var(--text-mid)'} />
                <span style={{ fontSize: 13, fontWeight: 500, color: i === 0 ? ACCENT : 'var(--text)' }}>{h.temp}°</span>
              </div>
            ))}
          </div>
        </LGCard>

        {/* 5-Day */}
        <LGCard style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>5-Day Forecast</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {weather.weekly.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--text-mid)', width: 46, fontWeight: i === 0 ? 600 : 400 }}>{w.day}</span>
                <Icon name={w.icon} size={17} color="var(--text-mid)" />
                <span style={{ fontSize: 12, color: 'var(--text-soft)', flex: 1 }}>{w.summary}</span>
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{w.hi}°</span>
                <span style={{ fontSize: 13, color: 'var(--text-soft)' }}>{w.lo}°</span>
              </div>
            ))}
          </div>
        </LGCard>

        {/* Atlas suggestion */}
        <LGCard style={{ padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 32, height: 32, borderRadius: 11, background: 'oklch(63% 0.14 47 / 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="sparkle" size={15} color={ACCENT} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT, marginBottom: 4 }}>Atlas Suggests</div>
            <div style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.55 }}>{weather.atlasSuggestion}</div>
          </div>
        </LGCard>
      </div>
    </div>
  )
}
