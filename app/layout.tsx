import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from './providers'
import PWARegister from './pwa-register'

export const metadata: Metadata = {
  applicationName: 'Atlas Arc',
  title: 'Atlas Arc',
  description: 'Your AI-powered everything app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Atlas Arc',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#f5ede4',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page-bg" />
        <PWARegister />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
