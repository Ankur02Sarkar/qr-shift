import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: {
    template: '%s | QR-Shift',
    default: 'QR-Shift — Trackable QR Campaigns',
  },
  description:
    'Create dynamic QR codes, edit the destination after printing, and track scans by day, device, and country. Built for marketers and agencies.',
  keywords: ['QR code', 'dynamic QR', 'QR analytics', 'QR campaign', 'trackable QR'],
  authors: [{ name: 'QR-Shift' }],
  openGraph: {
    type: 'website',
    siteName: 'QR-Shift',
    title: 'QR-Shift — Trackable QR Campaigns',
    description:
      'Create dynamic QR codes, edit the destination after printing, and track scans by day, device, and country.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR-Shift — Trackable QR Campaigns',
    description:
      'Create dynamic QR codes, edit the destination after printing, and track scans by day, device, and country.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
