import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronDown, Check, RotateCcw } from 'lucide-react'
import type {
  DateRange,
  DateRangeOption,
  FilterControls,
  PlatformFilter,
  PostTypeFilter,
} from '../types'

export interface FilterBarProps {
  controls: FilterControls
  dateRangeOptions: DateRangeOption[]
  totalCount: number
  visibleCount: number
  onPostTypeChange?: (type: PostTypeFilter) => void
  onPlatformChange?: (platform: PlatformFilter) => void
  onDateRangeChange?: (range: DateRange) => void
  onMinEngagementChange?: (value: number) => void
  onResetFilters?: () => void
}

const POST_TYPE_TABS: { id: PostTypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'photo', label: 'Photos' },
  { id: 'video', label: 'Videos' },
  { id: 'carousel', label: 'Carousels' },
  { id: 'reel', label: 'Reels' },
]

const PLATFORM_PILLS: { id: PlatformFilter; label: string }[] = [
  { id: 'both', label: 'Both' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
]

const DEFAULT: FilterControls = {
  postType: 'all',
  platform: 'both',
  dateRange: '30d',
  minEngagement: 0,
}

function isDefault(c: FilterControls): boolean {
  return (
    c.postType === DEFAULT.postType &&
    c.platform === DEFAULT.platform &&
    c.dateRange === DEFAULT.dateRange &&
    c.minEngagement === DEFAULT.minEngagement
  )
}

export function FilterBar({
  controls,
  dateRangeOptions,
  totalCount,
  visibleCount,
  onPostTypeChange,
  onPlatformChange,
  onDateRangeChange,
  onMinEngagementChange,
  onResetFilters,
}: FilterBarProps) {
  const filtered = !isDefault(controls)

  return (
    <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 mb-5 border-b border-[#1A1A24] bg-[#0A0A0F]/85 px-4 pb-3 pt-2 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Title + count */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 pb-3">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-[20px] font-semibold tracking-tight text-slate-50">Posts</h1>
          <span className="font-mono text-[12px] text-slate-500 tabular-nums">
            {filtered ? (
              <>
                <span className="text-slate-300">{visibleCount}</span>
                <span className="text-slate-600"> / {totalCount}</span>
              </>
            ) : (
              <span>{totalCount}</span>
            )}
          </span>
        </div>

        {filtered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-[12px] text-slate-400 hover:text-violet-300"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={2} />
            Reset filters
          </button>
        )}
      </div>

      {/* Post type tabs */}
      <div className="-mx-1 mb-3 flex items-center gap-1 overflow-x-auto pb-1">
        {POST_TYPE_TABS.map((tab) => {
          const active = controls.postType === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onPostTypeChange?.(tab.id)}
              aria-pressed={active}
              className={
                'relative shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ' +
                (active
                  ? 'bg-violet-500/12 text-violet-100 shadow-[inset_0_0_0_1px_rgba(124,58,237,0.3)]'
                  : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200')
              }
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Platform pills */}
        <div className="flex shrink-0 items-center rounded-lg border border-[#1E1E2E] bg-[#0F0F18] p-0.5">
          {PLATFORM_PILLS.map((p) => {
            const active = controls.platform === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPlatformChange?.(p.id)}
                aria-pressed={active}
                className={
                  'rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors duration-150 ' +
                  (active
                    ? 'bg-violet-500/15 text-violet-100'
                    : 'text-slate-400 hover:text-slate-200')
                }
              >
                {p.label}
              </button>
            )
          })}
        </div>

        {/* Date range */}
        <DateRangeDropdown
          value={controls.dateRange}
          options={dateRangeOptions}
          onChange={onDateRangeChange}
        />

        {/* Min engagement slider */}
        <MinEngagementSlider
          value={controls.minEngagement}
          onChange={onMinEngagementChange}
        />
      </div>
    </div>
  )
}

function DateRangeDropdown({
  value,
  options,
  onChange,
}: {
  value: DateRange
  options: DateRangeOption[]
  onChange?: (r: DateRange) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = options.find((o) => o.id === value)?.label ?? 'Last 30 days'

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#1E1E2E] bg-[#0F0F18] px-2.5 text-[12px] text-slate-300 transition-colors duration-150 hover:border-violet-500/30 hover:text-slate-100"
      >
        <CalendarDays className="h-3 w-3 text-slate-500" strokeWidth={1.8} />
        <span className="font-medium">{current}</span>
        <ChevronDown
          className={'h-3 w-3 text-slate-500 transition-transform duration-150 ' + (open ? 'rotate-180' : '')}
          strokeWidth={2}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-30 w-44 overflow-hidden rounded-lg border border-[#252535] bg-[#13131E] p-1 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
        >
          {options.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                role="option"
                aria-selected={value === o.id}
                onClick={() => {
                  onChange?.(o.id)
                  setOpen(false)
                }}
                className={
                  'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors duration-100 ' +
                  (value === o.id
                    ? 'bg-violet-500/15 text-violet-100'
                    : 'text-slate-300 hover:bg-white/[0.04] hover:text-slate-100')
                }
              >
                <span>{o.label}</span>
                {value === o.id && <Check className="h-3 w-3" strokeWidth={2.2} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MinEngagementSlider({
  value,
  onChange,
}: {
  value: number
  onChange?: (v: number) => void
}) {
  return (
    <div className="flex min-w-[200px] flex-1 items-center gap-2.5 rounded-lg border border-[#1E1E2E] bg-[#0F0F18] px-2.5 py-1.5">
      <span className="font-mono shrink-0 text-[10px] uppercase tracking-[0.18em] text-slate-500">
        Min eng
      </span>
      <input
        type="range"
        min={0}
        max={10}
        step={0.5}
        value={value}
        onChange={(e) => onChange?.(parseFloat(e.target.value))}
        className="slider-range flex-1 accent-violet-500"
        aria-label="Minimum engagement rate"
      />
      <span className="font-mono shrink-0 text-[11px] text-slate-200 tabular-nums">
        {value.toFixed(1)}%
      </span>
      <style>{`
        .slider-range {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: linear-gradient(to right, #7C3AED ${value * 10}%, #1E1E2E ${value * 10}%);
          border-radius: 9999px;
          outline: none;
        }
        .slider-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: #F1F5F9;
          border: 2px solid #7C3AED;
          box-shadow: 0 0 8px rgba(124,58,237,0.5);
          cursor: pointer;
        }
        .slider-range::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: #F1F5F9;
          border: 2px solid #7C3AED;
          box-shadow: 0 0 8px rgba(124,58,237,0.5);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
