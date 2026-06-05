/**
 * Typed fetch client for the QR-Shift Hono API backend.
 *
 * All requests automatically forward credentials (session cookie).
 * Base URL is read from NEXT_PUBLIC_BACKEND_URL.
 *
 * Usage:
 *   const { data } = await api.qr.list()
 *   const { data } = await api.qr.create({ name: 'My QR', destUrl: 'https://example.com' })
 */

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8787'

// ─── Shared types (mirrors backend schema) ──────────────────────────────────

export interface QrCode {
  id:        string
  userId:    string
  name:      string
  shortCode: string
  destUrl:   string
  isActive:  boolean
  createdAt: string
  updatedAt: string
}

export interface Scan {
  id:        string
  qrCodeId:  string
  scannedAt: string
  country:   string | null
  city:      string | null
  device:    string | null
  os:        string | null
  browser:   string | null
}

export interface AnalyticsData {
  qrCode:    QrCode
  total:     number
  byDay:     Array<{ date: string; count: number }>
  byCountry: Array<{ country: string | null; count: number }>
  byDevice:  Array<{ device: string | null; count: number }>
  byOs:      Array<{ os: string | null; count: number }>
  byBrowser: Array<{ browser: string | null; count: number }>
}

export interface CreateQrInput {
  name:    string
  destUrl: string
}

export interface UpdateQrInput {
  name?:     string
  destUrl?:  string
  isActive?: boolean
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',   // forwards the better-auth session cookie
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `API error ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ─── API namespaces ──────────────────────────────────────────────────────────

export const api = {
  qr: {
    list: () =>
      apiFetch<{ data: QrCode[] }>('/qr'),

    create: (body: CreateQrInput) =>
      apiFetch<{ data: QrCode }>('/qr', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    get: (id: string) =>
      apiFetch<{ data: QrCode }>(`/qr/${id}`),

    update: (id: string, body: UpdateQrInput) =>
      apiFetch<{ data: QrCode }>(`/qr/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),

    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/qr/${id}`, { method: 'DELETE' }),
  },

  analytics: {
    get: (qrId: string) =>
      apiFetch<{ data: AnalyticsData }>(`/analytics/${qrId}`),
  },
}
