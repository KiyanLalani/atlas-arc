'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import LGCard from '@/components/LGCard'

interface Attachment {
  name: string
  mimeType: string
  size: number
}

interface Email {
  id: string
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
  attachments: Attachment[]
}

const ACCENT = 'var(--orange)'
const COLORS = [ACCENT, 'var(--sage)', 'var(--slate)', ACCENT, 'var(--sage)']

export default function MailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [emails, setEmails] = useState<Email[]>([])
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
        const mapped: Email[] = (d.emails ?? []).map((e: any, i: number) => ({
          id: e.id,
          fromName: e.fromName,
          subject: e.subject,
          preview: e.snippet,
          body: e.body || e.snippet,
          time: e.date,
          isUnread: e.isUnread,
          avatar: e.avatar,
          aiSummary: d.summaries?.[i]?.summary ?? '',
          priority: d.summaries?.[i]?.priority ?? 'medium',
          avatarColor: COLORS[i % COLORS.length],
          attachments: e.attachments ?? [],
        }))
        setEmails(mapped)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session?.accessToken])

  const priorityColor = (p: string) =>
    p === 'high' ? ACCENT : p === 'medium' ? 'var(--slate)' : 'var(--text-soft)'

  const handleDraftReply = async () => {
    if (!selected) return
    setDraftingReply(true)
    setDraft('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Draft a short, professional reply to this email:\n\nFrom: ${selected.fromName}\nSubject: ${selected.subject}\n\n${selected.body}` }],
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

  // ── Not signed in ──
  if (!session?.accessToken) {
    return (
      <div className="screen-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--slate-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="mail" size={28} color="var(--slate)" />
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Your inbox, powered by AI</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.6 }}>Atlas reads your Gmail and prioritises what matters. Connect your Google account to get started.</div>
        </div>
        <button onClick={() => router.push('/settings')} className="tappable" style={{ padding: '12px 28px', borderRadius: 'var(--r-full)', background: ACCENT, border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Connect Google
        </button>
      </div>
    )
  }

  // ── Email detail ──
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
              <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>{selected.time}</div>
            </div>
          </div>
          {selected.aiSummary && (
            <LGCard style={{ padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <Icon name="sparkle" size={15} color={ACCENT} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, marginBottom: 3 }}>Atlas Summary</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-mid)', lineHeight: 1.5 }}>{selected.aiSummary}</div>
              </div>
            </LGCard>
          )}
          <div style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{selected.body || selected.preview}</div>
          {selected.attachments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Attachments</div>
              {selected.attachments.map((a, i) => (
                <LGCard key={i} style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--slate-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="link" size={14} color="var(--slate)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>{a.size > 0 ? `${Math.round(a.size / 1024)} KB` : a.mimeType}</div>
                  </div>
                </LGCard>
              ))}
            </div>
          )}
          {draft && (
            <LGCard style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, marginBottom: 8 }}>Atlas Draft Reply</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{draft}</div>
            </LGCard>
          )}
        </div>
        <div className="lg" style={{ padding: '12px 18px', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}>
          <button onClick={handleDraftReply} disabled={draftingReply} className="tappable" style={{ width: '100%', padding: '13px', borderRadius: 'var(--r)', background: draftingReply ? 'rgba(0,0,0,0.12)' : ACCENT, border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {draftingReply ? 'Drafting…' : draft ? 'Regenerate Reply' : 'Draft Reply with Atlas'}
          </button>
        </div>
      </div>
    )
  }

  // ── Inbox list ──
  return (
    <div className="screen-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div className="lg" style={{ padding: '12px 18px', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>Inbox</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="search" size={20} color="var(--text-mid)" /></button>
        </div>
      </div>
      {loading && (
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-soft)', fontSize: 13 }}>
          <Icon name="loader" size={14} color="var(--text-soft)" /> Fetching emails…
        </div>
      )}
      {!loading && emails.length === 0 && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)', fontSize: 13 }}>
          Your inbox is empty.
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {emails.map((e) => (
          <div key={e.id} onClick={() => setSelected(e)} className="tappable" style={{ padding: '14px 18px', borderBottom: '1px solid rgba(0,0,0,0.04)', background: e.isUnread ? 'rgba(255,255,255,0.45)' : 'transparent' }}>
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
                {e.aiSummary && (
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon name="sparkle" size={11} color={priorityColor(e.priority)} />
                    <span style={{ fontSize: 11, color: priorityColor(e.priority), fontWeight: 500 }}>{e.aiSummary}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
