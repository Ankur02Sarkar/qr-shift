import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free QR Code Generator',
  description:
    'Create a free styled QR code instantly — custom colours, dot shapes, logo. No sign-up needed. Download as PNG, SVG, or PDF.',
}

export default function QRGeneratorLayout({ children }: { children: React.ReactNode }) {
  return children
}
