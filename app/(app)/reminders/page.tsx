'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LGCard from '@/components/LGCard'
import Icon from '@/components/Icon'

interface Reminder {
  id: string
  text: string
  done: boolean
}

const ACCENT = 'var(--orange)'

export default function RemindersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [todos, setTodos] = useState<Reminder[]>([])
  const [newText, setNewText] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState('')

  const isConnected = !!session?.accessToken

  // Load reminders
  useEffect(() => {
    if (isConnected) {
      setLoading(true)
      fetch('/api/tasks')
        .then((r) => r.json())
        .then((d) => { setTodos((d.tasks ?? []).map((t: any) => ({ id: t.id, text: t.title, done: t.done }))); setLoading(false) })
        .catch(() => setLoading(false))
    } else {
      try {
        const saved = localStorage.getItem('atlas-reminders-v2')
        setTodos(saved ? JSON.parse(saved) : [])
      } catch {
        setTodos([])
      }
    }
  }, [isConnected])

  const saveLocal = (updated: Reminder[]) => {
    try { localStorage.setItem('atlas-reminders-v2', JSON.stringify(updated)) } catch {}
  }

  const add = async () => {
    const text = newText.trim()
    if (!text || saving) return
    setAddError('')
    setSaving(true)
    if (isConnected) {
      try {
        const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: text }) })
        const d = await res.json()
        if (!res.ok || !d.task) {
          setAddError(d.error === 'needs-reconnect' ? 'Please disconnect and reconnect Google in Settings to enable reminders.' : 'Failed to save reminder. Try again.')
        } else {
          setTodos((prev) => [...prev, { id: d.task.id, text: d.task.title, done: d.task.done }])
          setNewText('')
        }
      } catch {
        setAddError('Could not connect. Check your internet and try again.')
      }
    } else {
      const reminder: Reminder = { id: `local-${Date.now()}`, text, done: false }
      setTodos((prev) => {
        const updated = [...prev, reminder]
        saveLocal(updated)
        return updated
      })
      setNewText('')
    }
    setSaving(false)
  }

  const toggle = async (id: string, done: boolean) => {
    setTodos((prev) => prev.map((r) => r.id === id ? { ...r, done: !done } : r))
    if (isConnected) {
      try {
        await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, done: !done }) })
      } catch {}
    } else {
      setTodos((prev) => {
        saveLocal(prev)
        return prev
      })
    }
  }

  const del = async (id: string) => {
    setTodos((prev) => {
      const updated = prev.filter((r) => r.id !== id)
      if (!isConnected) saveLocal(updated)
      return updated
    })
    if (isConnected) {
      try {
        await fetch(`/api/tasks?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      } catch {}
    }
  }

  const pending = todos.filter((t) => !t.done)
  const done = todos.filter((t) => t.done)

  const ReminderItem = ({ r }: { r: Reminder }) => (
    <LGCard style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: r.done ? 0.6 : 1, transition: 'opacity 0.2s' }}>
      <button
        onClick={() => toggle(r.id, r.done)}
        className="tappable"
        style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, border: `2px solid ${r.done ? ACCENT : 'rgba(0,0,0,0.15)'}`, background: r.done ? ACCENT : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
      >
        {r.done && <Icon name="check" size={11} color="white" sw={2.5} />}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, color: 'var(--text)', textDecoration: r.done ? 'line-through' : 'none' }}>{r.text}</div>
      </div>
      <button onClick={() => del(r.id)} className="tappable" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
        <Icon name="trash" size={15} color="var(--text-soft)" />
      </button>
    </LGCard>
  )

  return (
    <div className="screen-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div className="lg" style={{ padding: '12px 18px', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>Reminders</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isConnected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)' }} />
              <span style={{ fontSize: 11, color: 'var(--sage)', fontWeight: 500 }}>Synced</span>
            </div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{pending.length} pending</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!isConnected && (
          <LGCard style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Icon name="bell" size={15} color={ACCENT} />
            <span style={{ flex: 1, fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.45 }}>
              <button onClick={() => router.push('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, fontSize: 12, fontWeight: 500, padding: 0 }}>Connect Google</button>{' '}to sync reminders across all your devices.
            </span>
          </LGCard>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-soft)', fontSize: 13, padding: '8px 0' }}>
            <Icon name="loader" size={14} color="var(--text-soft)" /> Loading…
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Pending</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pending.map((r) => <ReminderItem key={r.id} r={r} />)}
                </div>
              </>
            )}
            {done.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '8px 0 4px' }}>Done</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {done.map((r) => <ReminderItem key={r.id} r={r} />)}
                </div>
              </>
            )}
            {todos.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-soft)', textAlign: 'center', padding: '32px 0' }}>No reminders yet. Add one below.</p>
            )}
          </>
        )}
      </div>

      {addError && (
        <div style={{ padding: '8px 18px', fontSize: 12, color: '#c0392b', background: 'rgba(192,57,43,0.07)', borderTop: '1px solid rgba(192,57,43,0.1)', flexShrink: 0 }}>
          {addError}
        </div>
      )}
      <div className="lg" style={{ padding: '10px 14px', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderBottom: 'none', display: 'flex', gap: 10, flexShrink: 0 }}>
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add a reminder…"
          disabled={saving}
          style={{ flex: 1, padding: '11px 16px', borderRadius: 'var(--r-full)', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', fontSize: 14, color: 'var(--text)', outline: 'none', fontFamily: 'var(--font)', transition: 'box-shadow 0.2s' }}
        />
        <button onClick={add} disabled={saving || !newText.trim()} className="tappable" style={{ width: 44, height: 44, borderRadius: '50%', background: saving || !newText.trim() ? 'rgba(0,0,0,0.12)' : ACCENT, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          <Icon name="plus" size={19} color="white" sw={2.2} />
        </button>
      </div>
    </div>
  )
}
