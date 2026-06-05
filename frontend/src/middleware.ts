import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const authPages = ['/login', '/signup']
const protectedPages = ['/dashboard']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('better-auth.session_token')

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
