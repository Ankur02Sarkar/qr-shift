import { getAuth } from '@/lib/auth'
import type { NextRequest } from 'next/server'

export function GET(request: NextRequest) {
  return getAuth().handler(request)
}

export function POST(request: NextRequest) {
  return getAuth().handler(request)
}
