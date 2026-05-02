import BottomNav from '@/components/BottomNav'
import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-container">
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 'var(--bottom-nav-space)' }}>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
