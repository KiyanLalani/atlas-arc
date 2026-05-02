import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getEmails } from '@/lib/gmail'
import { getTodayEvents } from '@/lib/calendar'
import { getTasks } from '@/lib/tasks'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const FALLBACK_CONNECTED = ["What's my day like?", 'Summarise my inbox', 'What tasks are pending?']
const FALLBACK_GUEST = ["What can you do?", 'Give me a productivity tip', 'How does Atlas work?']

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return NextResponse.json({ suggestions: FALLBACK_GUEST })
  }

  try {
    const [emailsRes, eventsRes, tasksRes] = await Promise.allSettled([
      getEmails(session.accessToken),
      getTodayEvents(session.accessToken),
      getTasks(session.accessToken),
    ])

    const emails = emailsRes.status === 'fulfilled' ? emailsRes.value : []
    const events = eventsRes.status === 'fulfilled' ? eventsRes.value : []
    const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value.filter(t => !t.done) : []

    const lines: string[] = []
    if (emails.length > 0) {
      const unread = emails.filter(e => e.isUnread)
      lines.push(`Emails: ${unread.length} unread of ${emails.length}. Top senders: ${emails.slice(0, 4).map(e => e.fromName).join(', ')}. Subjects: ${emails.slice(0, 3).map(e => e.subject).join(' | ')}`)
    }
    if (events.length > 0) {
      lines.push(`Today's events: ${events.map(e => e.title).join(', ')}`)
    }
    if (tasks.length > 0) {
      lines.push(`Pending reminders: ${tasks.slice(0, 4).map(t => t.title).join(', ')}`)
    }

    if (lines.length === 0) {
      return NextResponse.json({ suggestions: FALLBACK_CONNECTED })
    }

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      system: 'Generate exactly 3 short, specific question prompts (max 7 words each) a user might tap to ask their AI assistant, based on their real data below. Be specific — reference actual names, events, or email senders where helpful. Output ONLY a JSON array of 3 strings, no markdown.',
      messages: [{ role: 'user', content: lines.join('\n') }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : '[]'
    const match = raw.match(/\[[\s\S]*\]/)
    const suggestions = JSON.parse(match ? match[0] : '[]')
    return NextResponse.json({
      suggestions: Array.isArray(suggestions) && suggestions.length === 3
        ? suggestions
        : FALLBACK_CONNECTED,
    })
  } catch (err) {
    console.error('Suggestions error:', err)
    return NextResponse.json({ suggestions: FALLBACK_CONNECTED })
  }
}
