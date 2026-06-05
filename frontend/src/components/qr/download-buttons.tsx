'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type QRCodeStyling from 'qr-code-styling'

interface DownloadButtonsProps {
  qrInstance: QRCodeStyling | null
  name: string
}

export function DownloadButtons({ qrInstance, name }: DownloadButtonsProps) {
  const [pdfLoading, setPdfLoading] = useState(false)

  const filename = name.toLowerCase().replace(/\s+/g, '-')

  async function downloadPNG() {
    if (!qrInstance) return
    qrInstance.download({ name: filename, extension: 'png' })
  }

  async function downloadSVG() {
    if (!qrInstance) return
    qrInstance.download({ name: filename, extension: 'svg' })
  }

  async function downloadPDF() {
    if (!qrInstance) return
    setPdfLoading(true)

    try {
      // Get the canvas element from the QR code instance
      const canvas = document.querySelector<HTMLCanvasElement>('[data-qr-canvas] canvas')
      if (!canvas) return

      const { jsPDF } = await import('jspdf')

      const pageW = 210  // A4 mm
      const pageH = 297  // A4 mm
      const margin = 20
      const qrSize = pageW - margin * 2  // fill width

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      // Background
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, pageW, pageH, 'F')

      // QR code image
      const imgData = canvas.toDataURL('image/png')
      const qrY = (pageH - qrSize) / 2 - 15
      doc.addImage(imgData, 'PNG', margin, qrY, qrSize, qrSize)

      // Name below
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(30, 30, 30)
      doc.text(name, pageW / 2, qrY + qrSize + 12, { align: 'center' })

      // Branding footer
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text('Made with QR-Shift', pageW / 2, pageH - 10, { align: 'center' })

      doc.save(`${filename}.pdf`)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={downloadPNG} disabled={!qrInstance}>
        PNG
      </Button>
      <Button variant="outline" size="sm" onClick={downloadSVG} disabled={!qrInstance}>
        SVG
      </Button>
      <Button variant="outline" size="sm" onClick={downloadPDF} disabled={!qrInstance || pdfLoading}>
        {pdfLoading ? 'Generating...' : 'PDF'}
      </Button>
    </div>
  )
}
