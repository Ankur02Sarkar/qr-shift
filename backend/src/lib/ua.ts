export interface ParsedUA {
  device: 'mobile' | 'tablet' | 'desktop'
  os: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Other'
  browser: 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Other'
}

/**
 * Lightweight UA parser — pure regex, no external deps, safe for Workers.
 * Cloudflare's cf.device_type is preferred in production but unavailable in local dev.
 */
export function parseUA(ua: string, cfDeviceType?: string): ParsedUA {
  // Device — prefer Cloudflare's authoritative signal
  let device: ParsedUA['device'] = 'desktop'
  if (cfDeviceType === 'mobile') device = 'mobile'
  else if (cfDeviceType === 'tablet') device = 'tablet'
  else if (/iPad|Android(?!.*Mobile)/i.test(ua)) device = 'tablet'
  else if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) device = 'mobile'

  // OS — order matters (iPad must come before Mac)
  let os: ParsedUA['os'] = 'Other'
  if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/Windows/i.test(ua)) os = 'Windows'
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS'
  else if (/Linux/i.test(ua)) os = 'Linux'

  // Browser — order matters (Edge and Chrome both contain 'Chrome'; Safari check last)
  let browser: ParsedUA['browser'] = 'Other'
  if (/Edg\//i.test(ua)) browser = 'Edge'
  else if (/Firefox\//i.test(ua)) browser = 'Firefox'
  else if (/Chrome\//i.test(ua)) browser = 'Chrome'
  else if (/Safari\//i.test(ua)) browser = 'Safari'

  return { device, os, browser }
}
