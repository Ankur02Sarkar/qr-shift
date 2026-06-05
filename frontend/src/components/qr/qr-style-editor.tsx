'use client'

import { useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { QROptions } from './qr-preview'

interface QRStyleEditorProps {
  options: QROptions
  onChange: (options: QROptions) => void
}

const DOT_TYPES: { value: QROptions['dotType']; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
]

const CORNER_SQUARE_TYPES: { value: QROptions['cornerSquareType']; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'extra-rounded', label: 'Rounded' },
  { value: 'dot', label: 'Dot' },
]

const CORNER_DOT_TYPES: { value: QROptions['cornerDotType']; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
]

export function QRStyleEditor({ options, onChange }: QRStyleEditorProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)

  function update<K extends keyof QROptions>(key: K, value: QROptions[K]) {
    onChange({ ...options, [key]: value })
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      update('logo', ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-5">
      {/* Dot style */}
      <div className="space-y-1.5">
        <Label>Dot style</Label>
        <Select value={options.dotType} onValueChange={(v) => update('dotType', v as QROptions['dotType'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Corner square style */}
      <div className="space-y-1.5">
        <Label>Corner square style</Label>
        <Select value={options.cornerSquareType} onValueChange={(v) => update('cornerSquareType', v as QROptions['cornerSquareType'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CORNER_SQUARE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Corner dot style */}
      <div className="space-y-1.5">
        <Label>Corner dot style</Label>
        <Select value={options.cornerDotType} onValueChange={(v) => update('cornerDotType', v as QROptions['cornerDotType'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CORNER_DOT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Foreground</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={options.foreground}
              onChange={(e) => update('foreground', e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
            />
            <Input
              value={options.foreground}
              onChange={(e) => update('foreground', e.target.value)}
              className="font-mono text-sm"
              maxLength={7}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Background</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={options.background}
              onChange={(e) => update('background', e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
            />
            <Input
              value={options.background}
              onChange={(e) => update('background', e.target.value)}
              className="font-mono text-sm"
              maxLength={7}
            />
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="space-y-1.5">
        <Label>Logo (optional)</Label>
        <div className="flex items-center gap-2">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => logoInputRef.current?.click()}
          >
            {options.logo ? 'Change logo' : 'Upload logo'}
          </Button>
          {options.logo && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => update('logo', null)}
            >
              Remove
            </Button>
          )}
        </div>
        {options.logo && (
          <img src={options.logo} alt="Logo preview" className="mt-2 h-10 w-10 rounded object-contain" />
        )}
      </div>
    </div>
  )
}
