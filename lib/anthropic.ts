import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = 'claude-haiku-4-5-20251001'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function streamChat(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder()

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        // Cache the system prompt — it contains the user's context and changes infrequently
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  })

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })
}

export async function summariseEmails(
  emails: Array<{ from: string; subject: string; snippet: string }>
): Promise<Array<{ id?: string; summary: string; priority: 'high' | 'medium' | 'low' }>> {
  if (emails.length === 0) return []

  const emailList = emails
    .map(
      (e, i) =>
        `Email ${i + 1}:\nFrom: ${e.from}\nSubject: ${e.subject}\nSnippet: ${e.snippet}`
    )
    .join('\n\n')

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: [
      {
        type: 'text',
        text: 'You are Atlas, an AI assistant that summarises emails concisely. For each email output a JSON array. Each element: { "summary": "one-line summary", "priority": "high|medium|low" }. Output ONLY valid JSON, no extra text.',
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: emailList }],
  })

  try {
    const text =
      response.content[0].type === 'text' ? response.content[0].text : '[]'
    const parsed = JSON.parse(text.trim())
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return emails.map(() => ({ summary: 'Unable to summarise', priority: 'medium' as const }))
  }
}

export async function generateDailySummary(context: {
  name: string
  events: Array<{ title: string; startTime: string }>
  emails: Array<{ from: string; subject: string }>
}): Promise<string> {
  const { name, events, emails } = context

  const eventList =
    events.length > 0
      ? events.map((e) => `${e.startTime} — ${e.title}`).join(', ')
      : 'No events today'

  const emailList =
    emails.length > 0
      ? emails.slice(0, 5).map((e) => `${e.from}: ${e.subject}`).join('; ')
      : 'No new emails'

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 120,
    system: [
      {
        type: 'text',
        text: `You are Atlas, a personal AI assistant. Write a brief (2-3 sentence) morning summary for ${name}. Be warm, specific, and useful. Mention standout events or emails. No bullet points.`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Today's events: ${eventList}\nRecent emails: ${emailList}`,
      },
    ],
  })

  return response.content[0].type === 'text'
    ? response.content[0].text
    : 'Good morning! Ready to help with your day.'
}
