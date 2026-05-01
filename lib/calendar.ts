import { google } from 'googleapis'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  startTime: string
  endTime: string
  location?: string | null
  description?: string | null
  colorId?: string | null
}

function makeAuth(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return auth
}

export async function getTodayEvents(accessToken: string): Promise<CalendarEvent[]> {
  const auth = makeAuth(accessToken)
  const cal = google.calendar({ version: 'v3', auth })

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const res = await cal.events.list({
    calendarId: 'primary',
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 20,
  })

  return (res.data.items || []).map((event) => {
    const start = event.start?.dateTime || event.start?.date || ''
    const end = event.end?.dateTime || event.end?.date || ''

    const fmt = (iso: string) => {
      if (!iso) return ''
      const d = new Date(iso)
      return isNaN(d.getTime())
        ? iso
        : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }

    return {
      id: event.id || '',
      title: event.summary || 'Untitled',
      start,
      end,
      startTime: fmt(start),
      endTime: fmt(end),
      location: event.location,
      description: event.description,
      colorId: event.colorId,
    }
  })
}

export async function getUpcomingEvents(
  accessToken: string,
  days = 7
): Promise<CalendarEvent[]> {
  const auth = makeAuth(accessToken)
  const cal = google.calendar({ version: 'v3', auth })

  const now = new Date()
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  const res = await cal.events.list({
    calendarId: 'primary',
    timeMin: now.toISOString(),
    timeMax: future.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 30,
  })

  return (res.data.items || []).map((event) => {
    const start = event.start?.dateTime || event.start?.date || ''
    const end = event.end?.dateTime || event.end?.date || ''

    const fmt = (iso: string) => {
      if (!iso) return ''
      const d = new Date(iso)
      return isNaN(d.getTime())
        ? iso
        : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }

    return {
      id: event.id || '',
      title: event.summary || 'Untitled',
      start,
      end,
      startTime: fmt(start),
      endTime: fmt(end),
      location: event.location,
      description: event.description,
      colorId: event.colorId,
    }
  })
}
