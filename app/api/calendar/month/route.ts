import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getEventsForMonth } from '@/lib/calendar'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth()))

  try {
    const events = await getEventsForMonth(session.accessToken, year, month)
    return NextResponse.json({ events })
  } catch (err) {
    console.error('Calendar month error:', err)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
