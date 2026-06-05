import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your QR-Shift account to manage your dynamic QR codes and analytics.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
