import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getEmails } from '@/lib/gmail'
import { summariseEmails } from '@/lib/anthropic'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const emails = await getEmails(session.accessToken)

    const summaries = await summariseEmails(
      emails.map((e) => ({ from: e.fromName, subject: e.subject, snippet: e.snippet }))
    )

    return NextResponse.json({ emails, summaries })
  } catch (err) {
    console.error('Gmail route error:', err)
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 })
  }
}
