'use client'

export type DateRange = '7d' | '30d' | '90d' | 'all'

const RANGES: { value: DateRange; label: string }[] = [
  { value: '7d',  label: '7 days'  },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time'},
]

interface RangeSelectorProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function RangeSelector({ value, onChange }: RangeSelectorProps) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-sm">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={
            'rounded-md px-3 py-1.5 font-medium transition-colors ' +
            (value === r.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground')
          }
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}

/** Convert a DateRange value into { from, to } Unix timestamps (seconds) */
export function rangeToParams(range: DateRange): { from?: number; to?: number } {
  if (range === 'all') return {}
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const from = Math.floor((Date.now() - days * 86_400_000) / 1000)
  return { from }
}
