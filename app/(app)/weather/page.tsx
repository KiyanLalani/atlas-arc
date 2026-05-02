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
  hourly: Array<{ t: string; temp: number; icon: 'sun' | 'cloud' | 'drop' }>
  weekly: Array<{ day: string; hi: number; lo: number; icon: 'sun' | 'cloud' | 'drop'; summary: string }>
  atlasSuggestion: string
}

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/weather')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(true); return }
        setWeather(d)
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="screen-in" style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-soft)', fontSize: 14 }}>
        <Icon name="loader" size={16} color="var(--text-soft)" /> Loading weather…
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="screen-in" style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center' }}>
        <Icon name="cloud" size={40} color="var(--text-soft)" />
        <p style={{ fontSize: 14, color: 'var(--text-mid)' }}>Weather unavailable. Add <strong>OPENWEATHER_API_KEY</strong> in Vercel to enable live weather.</p>
      </div>
    )
  }

  return (
    <div className="screen-in scroll-view" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
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
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <Icon name={s.icon} size={17} color="var(--text-mid)" />
                <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </LGCard>

        {/* Hourly */}
        {weather.hourly.length > 0 && (
          <LGCard style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Hourly</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
              {weather.hourly.map((h, i) => (
                <div key={i} className="lg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, padding: '8px 12px', borderRadius: 16, border: i === 0 ? `1.5px solid oklch(63% 0.14 47 / 0.27)` : undefined, background: i === 0 ? 'oklch(63% 0.14 47 / 0.07)' : undefined }}>
                  <span style={{ fontSize: 10, color: i === 0 ? ACCENT : 'var(--text-soft)', fontWeight: i === 0 ? 600 : 400 }}>{h.t}</span>
                  <Icon name={h.icon} size={18} color={i === 0 ? ACCENT : 'var(--text-mid)'} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: i === 0 ? ACCENT : 'var(--text)' }}>{h.temp}°</span>
                </div>
              ))}
            </div>
          </LGCard>
        )}

        {/* 5-Day forecast */}
        {weather.weekly.length > 0 && (
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
        )}

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
