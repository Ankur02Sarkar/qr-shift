import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a free QR-Shift account and start building trackable QR campaigns in seconds.',
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
