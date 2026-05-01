'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Icon from '@/components/Icon'
import LGCard from '@/components/LGCard'

interface Email {
  id: string
  from: string
  fromName: string
  subject: string
  preview: string
  body: string
  time: string
  isUnread: boolean
  avatar: string
  aiSummary: string
  priority: 'high' | 'medium' | 'low'
  avatarColor: string
}

const ACCENT = 'var(--orange)'
const AVATAR_COLORS = [ACCENT, 'var(--sage)', 'var(--slate)', ACCENT, 'var(--sage)']

const MOCK_EMAILS: Email[] = [
  { id: '1', from: 'sarah@example.com', fromName: 'Sarah K.', subject: 'Q2 Proposal — please review', preview: "Hey Kiyan, I've attached the latest version of the Q2 proposal…", body: "Hey Kiyan,\n\nI've attached the latest version of the Q2 proposal. Please review it before our Thursday meeting.\n\nLooking forward to your feedback!\n\nBest,\nSarah", time: '9:14am', isUnread: true, avatar: 'S', aiSummary: 'High priority · Action needed', priority: 'high', avatarColor: ACCENT },
  { id: '2', from: 'marcus@example.com', fromName: 'Marcus R.', subject: 'Re: Project timeline update', preview: 'Sounds good to me. I think we can push the deadline…', body: "Sounds good to me. I think we can push the deadline to next Friday without any issues.\n\nThanks,\nMarcus", time: '8:42am', isUnread: true, avatar: 'M', aiSummary: 'Low priority · Informational', priority: 'low', avatarColor: 'var(--sage)' },
  { id: '3', from: 'billing@webflow.com', fromName: 'Webflow', subject: 'Your invoice for April', preview: 'Invoice #WF-20489. Amount due: $49.00. Due date: May 15, 2026.', body: "Invoice #WF-20489\nAmount due: $49.00\nDue date: May 15, 2026\n\nThank you for being a Webflow customer.", time: '7:30am', isUnread: false, avatar: 'W', aiSummary: 'Finance · $49 due May 15', priority: 'medium', avatarColor: 'var(--slate)' },
  { id: '4', from: 'digest@notion.so', fromName: 'Notion', subject: 'Weekly digest — 14 updates', preview: "Here's what happened in your workspace this week…", body: "Here's what happened in your workspace this week. 14 updates across 6 projects.", time: 'Yesterday', isUnread: false, avatar: 'N', aiSummary: 'Newsletter · Low priority', priority: 'low', avatarColor: 'var(--slate)' },
  { id: '5', from: 'james@example.com', fromName: 'James P.', subject: 'Lunch tomorrow still on?', preview: 'Hey! Just checking if we\'re still good for tomorrow at 12:30.', body: "Hey!\n\nJust checking if we're still good for tomorrow at 12:30. Let me know!\n\nCheers,\nJames", time: 'Yesterday', isUnread: false, avatar: 'J', aiSummary: 'Personal · Reply suggested', priority: 'medium', avatarColor: ACCENT },
]

export default function MailPage() {
  const { data: session } = useSession()
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS)
  const [selected, setSelected] = useState<Email | null>(null)
  const [loading, setLoading] = useState(false)
  const [draftingReply, setDraftingReply] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!session?.accessToken) return
    setLoading(true)
    fetch('/api/gmail')
      .then((r) => r.json())
      .then((d) => {
        if (d.emails?.length > 0) {
          const mapped: Email[] = d.emails.map((e: any, i: number) => ({
            id: e.id,
            from: e.from,
            fromName: e.fromName,
            subject: e.subject,
            preview: e.snippet,
            body: e.body || e.snippet,
            time: e.date,
            isUnread: e.isUnread,
            avatar: e.avatar,
            aiSummary: d.summaries?.[i]?.summary || 'Awaiting summary',
            priority: d.summaries?.[i]?.priority || 'medium',
            avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
          }))
          setEmails(mapped)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session?.accessToken])

  const priorityColor = (p: string) => p === 'high' ? ACCENT : p === 'medium' ? 'var(--slate)' : 'var(--text-soft)'

  const handleDraftReply = async () => {
    if (!selected) return
    setDraftingReply(true)
    setDraft('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Please draft a short, professional reply to this email:\n\nFrom: ${selected.fromName}\nSubject: ${selected.subject}\n\n${selected.body}` }],
          hasGoogleAccess: false,
        }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let text = ''
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          text += decoder.decode(value, { stream: true })
          setDraft(text)
        }
      }
    } catch {
      setDraft('Unable to draft reply. Please try again.')
    } finally {
      setDraftingReply(false)
    }
  }

  if (selected) {
    return (
      <div className="screen-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div className="lg" style={{ padding: '12px 18px', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button onClick={() => { setSelected(null); setDraft('') }} className="tappable" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: ACCENT, fontSize: 14, fontWeight: 500 }}>
            <Icon name="chevL" size={18} color={ACCENT} /> Back
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 19, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{selected.subject}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: selected.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14, color: 'white', fontWeight: 600 }}>{selected.avatar}</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{selected.fromName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>Today · {selected.time}</div>
            </div>
          </div>
          <LGCard style={{ padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Icon name="sparkle" size={15} color={ACCENT} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, marginBottom: 3 }}>Atlas Summary</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-mid)', lineHeight: 1.5 }}>{selected.aiSummary}</div>
            </div>
          </LGCard>
          <div style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
            {selected.body}
          </div>
          {draft && (
            <LGCard style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, marginBottom: 8 }}>Atlas Draft Reply</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{draft}</div>
            </LGCard>
          )}
        </div>
        <div className="lg" style={{ padding: '12px 18px', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}>
          <button
            onClick={handleDraftReply}
            disabled={draftingReply}
            className="tappable"
            style={{ width: '100%', padding: '13px', borderRadius: 'var(--r)', background: draftingReply ? 'rgba(0,0,0,0.12)' : ACCENT, border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            {draftingReply ? 'Drafting…' : draft ? 'Regenerate Reply' : 'Draft Reply with Atlas'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div className="lg" style={{ padding: '12px 18px', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>Inbox</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="search" size={20} color="var(--text-mid)" /></button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="settings" size={20} color="var(--text-mid)" /></button>
        </div>
      </div>
      {loading && (
        <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-soft)', fontSize: 13 }}>
          <Icon name="loader" size={14} color="var(--text-soft)" /> Fetching emails…
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {emails.map((e) => (
          <div
            key={e.id}
            onClick={() => setSelected(e)}
            className="tappable"
            style={{ padding: '14px 18px', borderBottom: '1px solid rgba(0,0,0,0.04)', background: e.isUnread ? 'rgba(255,255,255,0.45)' : 'transparent', transition: 'background 0.15s' }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: e.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 16, color: 'white', fontWeight: 600 }}>{e.avatar}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 13.5, fontWeight: e.isUnread ? 600 : 500, color: 'var(--text)' }}>{e.fromName}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>{e.time}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: e.isUnread ? 500 : 400, color: 'var(--text)', marginBottom: 3 }}>{e.subject}</div>
                <div style={{ fontSize: 12, color: 'var(--text-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.preview}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="sparkle" size={11} color={priorityColor(e.priority)} />
                  <span style={{ fontSize: 11, color: priorityColor(e.priority), fontWeight: 500 }}>{e.aiSummary}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
