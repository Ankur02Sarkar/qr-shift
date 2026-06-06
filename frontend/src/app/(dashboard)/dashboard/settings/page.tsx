'use client'

import { useSession, signOut } from '@/lib/auth-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account</p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <p className="text-sm font-medium">Name</p>
            <p className="text-sm text-muted-foreground">{session?.user?.name ?? '—'}</p>
          </div>
          <div className="grid gap-1">
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{session?.user?.email ?? '—'}</p>
          </div>
          <div className="grid gap-1">
            <p className="text-sm font-medium">Plan</p>
            <p className="text-sm capitalize text-muted-foreground">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(session?.user as any)?.plan ?? 'free'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session</CardTitle>
          <CardDescription>Sign out of your account on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <Button variant="destructive" onClick={handleSignOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
