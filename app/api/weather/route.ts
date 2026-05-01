import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY
  const city = process.env.WEATHER_CITY || 'London'

  if (!apiKey) {
    return NextResponse.json({ error: 'No weather API key configured' }, { status: 404 })
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      { next: { revalidate: 600 } }
    )

    if (!res.ok) throw new Error('Weather API error')

    const data = await res.json()

    return NextResponse.json({
      city: `${data.name}, ${data.sys.country}`,
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6),
      uvIndex: 4,
    })
  } catch (err) {
    console.error('Weather route error:', err)
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 })
  }
}
