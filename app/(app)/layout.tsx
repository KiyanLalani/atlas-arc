import BottomNav from '@/components/BottomNav'
import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-container">
      <main
        className="scroll-view"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          paddingBottom: 'var(--bottom-nav-space)',
        }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
