import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTodayEvents } from '@/lib/calendar'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const events = await getTodayEvents(session.accessToken)
    return NextResponse.json({ events })
  } catch (err) {
    console.error('Calendar route error:', err)
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
  }
}
