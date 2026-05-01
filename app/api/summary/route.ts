import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getEmails } from '@/lib/gmail'
import { getTodayEvents } from '@/lib/calendar'
import { generateDailySummary } from '@/lib/anthropic'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const name = session.user?.name?.split(' ')[0] || 'Kiyan'

  try {
    const [emailsResult, eventsResult] = await Promise.allSettled([
      getEmails(session.accessToken),
      getTodayEvents(session.accessToken),
    ])

    const emails =
      emailsResult.status === 'fulfilled'
        ? emailsResult.value.slice(0, 5).map((e) => ({ from: e.fromName, subject: e.subject }))
        : []

    const events =
      eventsResult.status === 'fulfilled'
        ? eventsResult.value.map((e) => ({ title: e.title, startTime: e.startTime }))
        : []

    const summary = await generateDailySummary({ name, events, emails })
    return NextResponse.json({ summary })
  } catch (err) {
    console.error('Summary route error:', err)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
