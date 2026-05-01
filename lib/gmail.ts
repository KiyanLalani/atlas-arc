import { google } from 'googleapis'

export interface EmailMessage {
  id: string
  from: string
  fromName: string
  subject: string
  snippet: string
  body: string
  date: string
  isUnread: boolean
  avatar: string
}

function makeAuth(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return auth
}

export async function getEmails(accessToken: string): Promise<EmailMessage[]> {
  const auth = makeAuth(accessToken)
  const gmail = google.gmail({ version: 'v1', auth })

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 10,
    labelIds: ['INBOX'],
    q: 'in:inbox',
  })

  const messages = listRes.data.messages || []
  if (messages.length === 0) return []

  const fullMessages = await Promise.all(
    messages.map((m) =>
      gmail.users.messages.get({
        userId: 'me',
        id: m.id!,
        format: 'full',
      })
    )
  )

  return fullMessages.map((res) => {
    const msg = res.data
    const headers = msg.payload?.headers || []

    const getHeader = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || ''

    const fromRaw = getHeader('From')
    const fromMatch = fromRaw.match(/^(.+?)\s*<(.+?)>$/)
    const fromName = fromMatch ? fromMatch[1].replace(/"/g, '').trim() : fromRaw
    const from = fromMatch ? fromMatch[2] : fromRaw

    const date = new Date(parseInt(msg.internalDate || '0'))
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const dateStr = isToday
      ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    const body = extractBody(msg.payload)

    return {
      id: msg.id || '',
      from,
      fromName,
      subject: getHeader('Subject') || '(no subject)',
      snippet: msg.snippet || '',
      body,
      date: dateStr,
      isUnread: (msg.labelIds || []).includes('UNREAD'),
      avatar: fromName.charAt(0).toUpperCase(),
    }
  })
}

function extractBody(payload: any): string {
  if (!payload) return ''

  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8')
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractBody(part)
      if (text) return text
    }
  }

  return ''
}
