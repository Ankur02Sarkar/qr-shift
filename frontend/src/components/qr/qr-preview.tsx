'use client'

import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'

export interface QROptions {
  data: string
  dotType: 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded'
  cornerSquareType: 'square' | 'extra-rounded' | 'dot'
  cornerDotType: 'square' | 'dot'
  foreground: string
  background: string
  logo?: string | null  // data URL
}

interface QRPreviewProps {
  options: QROptions
  size?: number
  qrRef?: React.MutableRefObject<QRCodeStyling | null>
}

export function QRPreview({ options, size = 256, qrRef }: QRPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const qr = new QRCodeStyling({
      width: size,
      height: size,
      type: 'canvas',
      data: options.data || 'https://qr-shift.dev',
      dotsOptions: {
        color: options.foreground,
        type: options.dotType,
      },
      cornersSquareOptions: {
        color: options.foreground,
        type: options.cornerSquareType,
      },
      cornersDotOptions: {
        color: options.foreground,
        type: options.cornerDotType,
      },
      backgroundOptions: {
        color: options.background,
      },
      image: options.logo ?? undefined,
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 4,
        hideBackgroundDots: true,
        imageSize: 0.3,
      },
    })

    containerRef.current.innerHTML = ''
    qr.append(containerRef.current)
    instanceRef.current = qr

    if (qrRef) qrRef.current = qr

    return () => {
      instanceRef.current = null
      if (qrRef) qrRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.data, options.dotType, options.cornerSquareType, options.cornerDotType,
      options.foreground, options.background, options.logo, size])

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-lg"
      style={{ width: size, height: size }}
    />
  )
}
