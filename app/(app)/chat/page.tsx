'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import Icon from '@/components/Icon'
import LGCard from '@/components/LGCard'

interface Message {
  role: 'user' | 'ai'
  text: string
}

const ACCENT = 'var(--orange)'

const GREETING: Message = { role: 'ai', text: "Hi! I'm Atlas, your AI assistant. What can I help you with today?" }

export default function ChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  const send = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || streaming) return
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'user', text: msg }]
    setMessages(newMessages)
    setStreaming(true)

    const aiPlaceholder: Message = { role: 'ai', text: '' }
    setMessages([...newMessages, aiPlaceholder])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.text,
          })),
          hasGoogleAccess: !!session?.accessToken,
        }),
      })

      if (!res.ok) throw new Error('Chat request failed')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          setMessages([...newMessages, { role: 'ai', text: accumulated }])
        }
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: 'ai', text: "Sorry, I couldn't connect right now. Please try again." },
      ])
    } finally {
      setStreaming(false)
    }
  }

  const suggestions = session?.accessToken
    ? ["What's my day like?", 'Draft a reply to Sarah', 'Set a reminder']
    : ["What's your name?", 'Tell me a productivity tip', 'What can you do?']

  return (
    <div
      className="screen-in"
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
    >
      {/* Header */}
      <div
        className="lg"
        style={{
          padding: '12px 18px', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none',
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 14, background: 'linear-gradient(135deg, var(--orange), oklch(68% 0.12 28))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="sparkle" size={18} color="white" sw={1.6} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Atlas</div>
          <div style={{ fontSize: 11, color: 'var(--sage)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)' }} />
            AI · Always on
          </div>
        </div>
        {!session?.accessToken && (
          <LGCard style={{ marginLeft: 'auto', padding: '5px 10px' }}>
            <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>
              <a href="/settings" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>Connect Google</a> for full context
            </span>
          </LGCard>
        )}
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-end', gap: 8,
              animation: 'fadeSlideIn 0.22s ease both',
              animationDelay: `${Math.min(i * 0.04, 0.2)}s`,
            }}
          >
            {m.role === 'ai' && (
              <div style={{ width: 26, height: 26, borderRadius: 9, background: 'linear-gradient(135deg, var(--orange), oklch(68% 0.12 28))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="sparkle" size={12} color="white" sw={2} />
              </div>
            )}
            <div
              className={m.role === 'ai' ? 'lg' : ''}
              style={{
                maxWidth: '76%', padding: '10px 14px',
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.role === 'user' ? ACCENT : undefined,
                fontSize: 13.5, lineHeight: 1.55,
                color: m.role === 'user' ? 'white' : 'var(--text)',
                whiteSpace: 'pre-line',
              }}
            >
              {m.text}
              {streaming && i === messages.length - 1 && m.role === 'ai' && m.text === '' && (
                <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-soft)', animation: 'pulse 1s infinite' }} />
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-soft)', animation: 'pulse 1s infinite 0.2s' }} />
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-soft)', animation: 'pulse 1s infinite 0.4s' }} />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div style={{ padding: '0 12px 8px', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0 }}>
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => send(s)}
            disabled={streaming}
            className="lg tappable"
            style={{ flexShrink: 0, padding: '7px 13px', borderRadius: 'var(--r-full)', fontSize: 12, color: 'var(--text-mid)', cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', background: undefined, opacity: streaming ? 0.5 : 1 }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div
        className="lg"
        style={{ padding: '10px 14px', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderBottom: 'none', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask Atlas anything…"
          disabled={streaming}
          style={{ flex: 1, padding: '11px 16px', borderRadius: 'var(--r-full)', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', fontSize: 14, color: 'var(--text)', outline: 'none', fontFamily: 'var(--font)', transition: 'box-shadow 0.2s' }}
        />
        <button
          onClick={() => send()}
          disabled={streaming || !input.trim()}
          className="tappable"
          style={{ width: 42, height: 42, borderRadius: '50%', background: streaming || !input.trim() ? 'rgba(0,0,0,0.12)' : ACCENT, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}
        >
          <Icon name="send" size={16} color="white" />
        </button>
      </div>
    </div>
  )
}
