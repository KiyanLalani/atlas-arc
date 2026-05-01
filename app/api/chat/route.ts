import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { streamChat, type ChatMessage } from '@/lib/anthropic'
import { getEmails } from '@/lib/gmail'
import { getTodayEvents } from '@/lib/calendar'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  const { messages, hasGoogleAccess } = await req.json() as {
    messages: ChatMessage[]
    hasGoogleAccess: boolean
  }

  let contextBlock = ''

  if (hasGoogleAccess && session?.accessToken) {
    try {
      const [emails, events] = await Promise.allSettled([
        getEmails(session.accessToken),
        getTodayEvents(session.accessToken),
      ])

      if (emails.status === 'fulfilled' && emails.value.length > 0) {
        const emailSummary = emails.value
          .slice(0, 5)
          .map((e) => `- From ${e.fromName}: "${e.subject}"`)
          .join('\n')
        contextBlock += `\nRecent emails:\n${emailSummary}`
      }

      if (events.status === 'fulfilled' && events.value.length > 0) {
        const eventSummary = events.value
          .map((e) => `- ${e.startTime}: ${e.title}`)
          .join('\n')
        contextBlock += `\n\nToday's calendar:\n${eventSummary}`
      }
    } catch {
    }
  }

  const userName = session?.user?.name?.split(' ')[0] || 'Kiyan'
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const systemPrompt = `You are Atlas, a warm and intelligent AI assistant for ${userName}. Today is ${today}.
You help with productivity, scheduling, email management, and general questions.
Be concise, friendly, and helpful. Use bullet points when listing multiple items.${contextBlock}`

  try {
    const stream = await streamChat(messages, systemPrompt)
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('Chat route error:', err)
    return new Response('Sorry, I encountered an error. Please try again.', { status: 500 })
  }
}
