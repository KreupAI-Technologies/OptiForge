import type { Metadata, Viewport } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { UserPreferenceProvider } from '@/contexts/UserPreferenceContext'

// OptiForge is an authenticated, tenant-specific ERP: every route is user/tenant
// scoped and gated behind AuthProvider, so static prerendering has no value and
// only breaks the build (client pages evaluating live/mock data at export time).
// Forcing dynamic rendering at the root cascades to all routes.
export const dynamic = 'force-dynamic'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900']
})

export const metadata: Metadata = {
  title: 'OptiForge ERP',
  description: 'Manufacturing ERP System for Kitchen and Furniture Manufacturing',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OptiForge',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'OptiForge ERP',
    title: 'OptiForge - Manufacturing ERP',
    description: 'Complete Manufacturing ERP System',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={roboto.className}>
        <AuthProvider>
          <UserPreferenceProvider>
            <NotificationProvider>
              {children}
              <ServiceWorkerRegistration />
            </NotificationProvider>
          </UserPreferenceProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
