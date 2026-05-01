import { NextResponse } from 'next/server'

type IconName = 'sun' | 'cloud' | 'drop'

const ICON_MAP: Record<string, IconName> = {
  '01': 'sun',
  '02': 'cloud',
  '03': 'cloud',
  '04': 'cloud',
  '09': 'drop',
  '10': 'drop',
  '11': 'drop',
  '13': 'drop',
  '50': 'cloud',
}

function getIcon(iconCode: string): IconName {
  return ICON_MAP[iconCode.slice(0, 2)] ?? 'cloud'
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

function dayLabel(offsetFromToday: number): string {
  if (offsetFromToday === 0) return 'Today'
  const d = new Date()
  d.setDate(d.getDate() + offsetFromToday)
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

export const revalidate = 600

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY
  const city = process.env.WEATHER_CITY || 'London'

  if (!apiKey) {
    return NextResponse.json({ error: 'No API key' }, { status: 404 })
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&cnt=40`),
    ])

    if (!currentRes.ok) throw new Error(`Weather API ${currentRes.status}`)

    const current = await currentRes.json()
    const forecast = forecastRes.ok ? await forecastRes.json() : null

    // ── Hourly: next 6 slots (3-hour intervals) ──
    const hourly = (forecast?.list ?? []).slice(0, 6).map((item: any, i: number) => {
      const date = new Date(item.dt * 1000)
      const label =
        i === 0
          ? 'Now'
          : date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).replace(' ', '')
      return { t: label, temp: Math.round(item.main.temp), icon: getIcon(item.weather[0].icon) }
    })

    // ── Daily: group forecast items by calendar day ──
    const dayBuckets = new Map<string, { temps: number[]; icons: string[]; desc: string[] }>()
    for (const item of forecast?.list ?? []) {
      const d = new Date(item.dt * 1000)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!dayBuckets.has(key)) dayBuckets.set(key, { temps: [], icons: [], desc: [] })
      const b = dayBuckets.get(key)!
      b.temps.push(item.main.temp)
      b.icons.push(item.weather[0].icon)
      b.desc.push(item.weather[0].description)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekly = Array.from(dayBuckets.entries())
      .slice(0, 5)
      .map(([key, b], i) => {
        const [y, m, d] = key.split('-').map(Number)
        const date = new Date(y, m, d)
        date.setHours(0, 0, 0, 0)
        const offsetDays = Math.round((date.getTime() - today.getTime()) / 86400000)
        const iconCounts = b.icons.reduce<Record<string, number>>((acc, ic) => {
          acc[ic] = (acc[ic] ?? 0) + 1
          return acc
        }, {})
        const mainIcon = Object.entries(iconCounts).sort((a, b) => b[1] - a[1])[0][0]
        return {
          day: dayLabel(offsetDays),
          hi: Math.round(Math.max(...b.temps)),
          lo: Math.round(Math.min(...b.temps)),
          icon: getIcon(mainIcon),
          summary: titleCase(b.desc[0] ?? ''),
        }
      })

    const firstRainDay = weekly.find((d) => d.icon === 'drop')
    const atlasSuggestion = firstRainDay
      ? `Rain expected ${firstRainDay.day} — worth planning around it.`
      : 'Clear skies for the next few days — great for outdoor plans.'

    return NextResponse.json({
      city: `${current.name}, ${current.sys.country}`,
      temp: Math.round(current.main.temp),
      condition: titleCase(current.weather[0].description),
      humidity: current.main.humidity,
      wind: Math.round(current.wind.speed * 3.6),
      hourly,
      weekly,
      atlasSuggestion,
    })
  } catch (err) {
    console.error('Weather error:', err)
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 })
  }
}
