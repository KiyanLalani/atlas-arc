import { google } from 'googleapis'

export interface EmailAttachment {
  name: string
  mimeType: string
  size: number
}

export interface EmailMessage {
  id: string
  from: string
  fromName: string
  subject: string
  snippet: string
  body: string      // stripped text — used for AI draft replies
  bodyHtml: string  // raw HTML — rendered in iframe
  date: string
  isUnread: boolean
  avatar: string
  attachments: EmailAttachment[]
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

    const ts = parseInt(msg.internalDate || '0')
    const date = new Date(ts)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const dateStr = isToday
      ? date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })
      : date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })

    const bodyHtml = extractHtml(msg.payload)
    const body = bodyHtml ? htmlToText(bodyHtml) : extractPlainText(msg.payload)
    const attachments = extractAttachments(msg.payload)

    return {
      id: msg.id || '',
      from,
      fromName,
      subject: getHeader('Subject') || '(no subject)',
      snippet: msg.snippet || '',
      body,
      bodyHtml,
      date: dateStr,
      isUnread: (msg.labelIds || []).includes('UNREAD'),
      avatar: fromName.charAt(0).toUpperCase(),
      attachments,
    }
  })
}

function extractHtml(payload: any): string {
  if (!payload) return ''
  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf-8')
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const html = extractHtml(part)
      if (html) return html
    }
  }
  return ''
}

function extractPlainText(payload: any): string {
  if (!payload) return ''
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf-8')
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractPlainText(part)
      if (text) return text
    }
  }
  return ''
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<a\s[^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function extractAttachments(payload: any): EmailAttachment[] {
  if (!payload) return []
  const results: EmailAttachment[] = []
  if (payload.filename?.trim() && payload.body?.attachmentId) {
    results.push({
      name: payload.filename,
      mimeType: payload.mimeType || 'application/octet-stream',
      size: payload.body.size || 0,
    })
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      results.push(...extractAttachments(part))
    }
  }
  return results
}
