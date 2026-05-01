'use client'

import { useEffect, useState } from 'react'
import LGCard from '@/components/LGCard'
import Icon from '@/components/Icon'

interface Reminder {
  id: number
  text: string
  done: boolean
  time: string
  tag: 'Work' | 'Health' | 'Personal' | 'Finance'
}

const ACCENT = 'var(--orange)'
const TAG_COLORS: Record<string, string> = {
  Work: 'var(--sage)',
  Health: ACCENT,
  Personal: 'var(--slate)',
  Finance: 'var(--slate)',
}

const INITIAL: Reminder[] = [
  { id: 1, text: "Review Sarah's Q2 proposal", done: false, time: '11:00am', tag: 'Work' },
  { id: 2, text: 'Book gym session',           done: false, time: '5:00pm',  tag: 'Health' },
  { id: 3, text: 'Call mum',                   done: true,  time: 'Done',    tag: 'Personal' },
  { id: 4, text: 'Pay Webflow invoice',        done: false, time: 'Today',   tag: 'Finance' },
  { id: 5, text: 'Finish design system draft', done: false, time: 'Tomorrow',tag: 'Work' },
]

export default function RemindersPage() {
  const [todos, setTodos] = useState<Reminder[]>([])
  const [newText, setNewText] = useState('')
  const [nextId, setNextId] = useState(100)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('atlas-reminders')
      setTodos(saved ? JSON.parse(saved) : INITIAL)
    } catch {
      setTodos(INITIAL)
    }
  }, [])

  const save = (updated: Reminder[]) => {
    setTodos(updated)
    try { localStorage.setItem('atlas-reminders', JSON.stringify(updated)) } catch {}
  }

  const toggle = (id: number) => save(todos.map((r) => r.id === id ? { ...r, done: !r.done } : r))
  const del    = (id: number) => save(todos.filter((r) => r.id !== id))
  const add    = () => {
    if (!newText.trim()) return
    const reminder: Reminder = { id: nextId, text: newText.trim(), done: false, time: 'Today', tag: 'Personal' }
    save([...todos, reminder])
    setNextId((n) => n + 1)
    setNewText('')
  }

  const pending = todos.filter((t) => !t.done)
  const done    = todos.filter((t) => t.done)

  const ReminderItem = ({ r }: { r: Reminder }) => (
    <LGCard style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: r.done ? 0.6 : 1, transition: 'opacity 0.2s' }}>
      <button
        onClick={() => toggle(r.id)}
        className="tappable"
        style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, border: `2px solid ${r.done ? ACCENT : 'rgba(0,0,0,0.15)'}`, background: r.done ? ACCENT : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
      >
        {r.done && <Icon name="check" size={11} color="white" sw={2.5} />}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, color: 'var(--text)', textDecoration: r.done ? 'line-through' : 'none' }}>{r.text}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>{r.time}</span>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: TAG_COLORS[r.tag] }} />
          <span style={{ fontSize: 11, color: TAG_COLORS[r.tag], fontWeight: 500 }}>{r.tag}</span>
        </div>
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
        <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{pending.length} pending</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
      </div>

      <div className="lg" style={{ padding: '10px 14px', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderBottom: 'none', display: 'flex', gap: 10, flexShrink: 0 }}>
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add a reminder…"
          style={{ flex: 1, padding: '11px 16px', borderRadius: 'var(--r-full)', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', fontSize: 14, color: 'var(--text)', outline: 'none', fontFamily: 'var(--font)', transition: 'box-shadow 0.2s' }}
        />
        <button onClick={add} className="tappable" style={{ width: 44, height: 44, borderRadius: '50%', background: ACCENT, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="plus" size={19} color="white" sw={2.2} />
        </button>
      </div>
    </div>
  )
}
