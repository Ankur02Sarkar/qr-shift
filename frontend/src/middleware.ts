import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const authPages = ['/login', '/signup']
const protectedPages = ['/dashboard']

// Named 'middleware' (not 'proxy') for OpenNext Cloudflare build compatibility.
// Next.js 16 renamed this to proxy.ts/proxy() but @opennextjs/cloudflare requires
// the edge middleware convention (middleware.ts + middleware export) to deploy correctly.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Better Auth automatically adds the __Secure- prefix in HTTPS contexts
  // (production). Check both names so dev (HTTP) and prod (HTTPS) work correctly.
  const sessionCookie =
    request.cookies.get('__Secure-better-auth.session_token') ??
    request.cookies.get('better-auth.session_token')

  const isAuthPage = authPages.some((p) => pathname.startsWith(p))
  const isProtected = protectedPages.some((p) => pathname.startsWith(p))

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon).*)'],
}
