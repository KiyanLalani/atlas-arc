'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LGCard from '@/components/LGCard'
import Icon from '@/components/Icon'

const ACCENT = 'var(--orange)'

function Toggle({ val, onChange }: { val: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!val)}
      className="tappable"
      style={{
        width: 46, height: 27, borderRadius: 'var(--r-full)',
        background: val ? ACCENT : 'rgba(0,0,0,0.12)',
        position: 'relative', cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.25s ease',
      }}
    >
      <div
        style={{
          position: 'absolute', top: 3, left: val ? 22 : 3,
          width: 21, height: 21, borderRadius: '50%', background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      />
    </div>
  )
}

function loadToggle(key: string, def: boolean): boolean {
  try { const v = localStorage.getItem(key); return v === null ? def : v === 'true' } catch { return def }
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [calSync, setCalSyncRaw] = useState(true)
  const [gmailSync, setGmailSyncRaw] = useState(true)
  const [onDevice, setOnDeviceRaw] = useState(true)
  const [shareContext, setShareContextRaw] = useState(true)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    setCalSyncRaw(loadToggle('atlas-toggle-calSync', true))
    setGmailSyncRaw(loadToggle('atlas-toggle-gmailSync', true))
    setOnDeviceRaw(loadToggle('atlas-toggle-onDevice', true))
    setShareContextRaw(loadToggle('atlas-toggle-shareContext', true))
  }, [])

  const persist = (key: string, val: boolean) => {
    try { localStorage.setItem(key, String(val)) } catch {}
  }
  const setCalSync = (v: boolean) => { setCalSyncRaw(v); persist('atlas-toggle-calSync', v) }
  const setGmailSync = (v: boolean) => { setGmailSyncRaw(v); persist('atlas-toggle-gmailSync', v) }
  const setOnDevice = (v: boolean) => { setOnDeviceRaw(v); persist('atlas-toggle-onDevice', v) }
  const setShareContext = (v: boolean) => { setShareContextRaw(v); persist('atlas-toggle-shareContext', v) }

  const isConnected = !!session?.accessToken
  const name = session?.user?.name?.split(' ')[0] || 'You'
  const email = session?.user?.email || ''

  const handleConnect = async () => {
    setSigningIn(true)
    await signIn('google', { callbackUrl: '/settings' })
  }

  const handleDisconnect = async () => {
    await signOut({ callbackUrl: '/settings' })
  }

  return (
    <div className="screen-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Header */}
      <div className="lg" style={{ padding: '12px 18px', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={() => router.push('/')} className="tappable" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: ACCENT, fontSize: 14, fontWeight: 500 }}>
          <Icon name="chevL" size={18} color={ACCENT} /> Back
        </button>
        <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>Settings</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Profile */}
        <LGCard style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, var(--orange), oklch(68% 0.12 28))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {session?.user?.image ? (
                <img src={session.user.image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'white', fontSize: 22, fontWeight: 600 }}>{name.charAt(0)}</span>
              )}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{email || 'Not signed in'}</div>
            </div>
          </div>
        </LGCard>

        {/* Google Connect */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, paddingLeft: 4 }}>Connected Accounts</div>
          <LGCard style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isConnected ? 16 : 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: 13, background: 'white', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 48 48">
                  <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
                  <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.32-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
                  <path fill="#FBBC05" d="M11.68 28.18A13.9 13.9 0 0110.8 24c0-1.45.25-2.86.88-4.18v-5.7H4.34A23.93 23.93 0 002 24c0 3.87.92 7.54 2.34 10.88l7.34-6.7z"/>
                  <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.34 5.7C13.42 14.62 18.27 10.75 24 10.75z"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Google Account</div>
                <div style={{ fontSize: 12, color: isConnected ? 'var(--sage)' : 'var(--text-soft)' }}>
                  {isConnected ? `✓ Connected as ${email}` : 'Not connected'}
                </div>
              </div>
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={signingIn || status === 'loading'}
                  className="tappable"
                  style={{ padding: '8px 16px', borderRadius: 'var(--r-full)', background: signingIn ? 'rgba(0,0,0,0.08)' : ACCENT, border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                >
                  {signingIn ? '…' : 'Connect'}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="tappable"
                  style={{ padding: '8px 16px', borderRadius: 'var(--r-full)', background: 'rgba(0,0,0,0.06)', border: 'none', color: 'var(--text-mid)', fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}
                >
                  Disconnect
                </button>
              )}
            </div>

            {isConnected && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 14 }}>
                {[
                  { icon: 'calendar' as const, label: 'Sync Google Calendar', val: calSync, set: setCalSync, desc: 'Import events & meetings' },
                  { icon: 'mail'     as const, label: 'Sync Gmail',            val: gmailSync, set: setGmailSync, desc: 'AI summaries & smart replies' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 11, background: 'oklch(63% 0.14 47 / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name={item.icon} size={16} color={ACCENT} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>{item.desc}</div>
                    </div>
                    <Toggle val={item.val} onChange={item.set} />
                  </div>
                ))}
              </div>
            )}
          </LGCard>
        </div>

        {/* Privacy & AI */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, paddingLeft: 4 }}>Privacy & AI</div>
          <LGCard style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: 'shield' as const, label: 'On-device processing', desc: 'AI runs locally when possible', val: onDevice, set: setOnDevice },
              { icon: 'link'   as const, label: 'Share context with Atlas', desc: 'Personalise suggestions', val: shareContext, set: setShareContext },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 11, background: 'oklch(63% 0.14 47 / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={item.icon} size={16} color={ACCENT} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>{item.desc}</div>
                </div>
                <Toggle val={item.val} onChange={item.set} />
              </div>
            ))}
          </LGCard>
        </div>

        {/* Atlas AI info */}
        <LGCard style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, var(--orange), oklch(68% 0.12 28))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkle" size={17} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Atlas AI</div>
            <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>Powered by Claude Haiku · Up to date</div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--sage)', fontWeight: 600, background: 'var(--sage-light)', padding: '4px 10px', borderRadius: 'var(--r-full)' }}>Active</span>
        </LGCard>
      </div>
    </div>
  )
}
