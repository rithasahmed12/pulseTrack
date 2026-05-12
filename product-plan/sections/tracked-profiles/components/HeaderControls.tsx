import { useEffect, useRef, useState } from 'react'
import { Search, Plus, ChevronDown, Check, X } from 'lucide-react'
import type {
  FilterControls,
  PlatformFilter,
  SortOption,
} from '../types'

export interface HeaderControlsProps {
  totalCount: number
  visibleCount: number
  controls: FilterControls
  onFilterChange?: (filter: PlatformFilter) => void
  onSortChange?: (sort: SortOption) => void
  onSearchChange?: (query: string) => void
  onAddProfileClick?: () => void
}

const SORT_LABELS: Record<SortOption, string> = {
  'recently-added': 'Recently added',
  'most-followers': 'Most followers',
  'highest-engagement': 'Highest engagement',
  'last-scraped': 'Last scraped',
}

const FILTERS: { id: PlatformFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
]

export function HeaderControls({
  totalCount,
  visibleCount,
  controls,
  onFilterChange,
  onSortChange,
  onSearchChange,
  onAddProfileClick,
}: HeaderControlsProps) {
  const isFiltered = visibleCount !== totalCount

  return (
    <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 mb-6 border-b border-[#1A1A24] bg-[#0A0A0F]/85 px-4 pb-4 pt-2 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        {/* Top row — title + add button */}
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-[20px] font-semibold tracking-tight text-slate-50">
              Tracked profiles
            </h1>
            <span className="font-mono text-[12px] text-slate-500 tabular-nums">
              {isFiltered ? (
                <>
                  <span className="text-slate-300">{visibleCount}</span>
                  <span className="text-slate-600"> / {totalCount}</span>
                </>
              ) : (
                <span>{totalCount}</span>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={onAddProfileClick}
            className={
              'inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[12.5px] font-medium text-white ' +
              'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.55)] ' +
              'transition-colors duration-150 hover:bg-violet-500 ' +
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]'
            }
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
            Add profile
          </button>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <SearchInput
            value={controls.search}
            onChange={onSearchChange}
          />

          {/* Platform pills */}
          <div className="flex shrink-0 items-center rounded-lg border border-[#1E1E2E] bg-[#0F0F18] p-0.5">
            {FILTERS.map((f) => {
              const active = controls.platform === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onFilterChange?.(f.id)}
                  aria-pressed={active}
                  className={
                    'relative rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors duration-150 ' +
                    (active
                      ? 'bg-violet-500/15 text-violet-100'
                      : 'text-slate-400 hover:text-slate-200')
                  }
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Sort dropdown */}
          <div className="ml-auto">
            <SortDropdown
              value={controls.sort}
              onChange={onSortChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SearchInput({
  value,
  onChange,
}: {
  value: string
  onChange?: (q: string) => void
}) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
        strokeWidth={1.8}
        aria-hidden
      />
      <input
        type="search"
        value={value}
        placeholder="Search by name or @username"
        onChange={(e) => onChange?.(e.target.value)}
        className={
          'h-8 w-full rounded-lg border border-[#1E1E2E] bg-[#0F0F18] pl-8 pr-7 text-[13px] text-slate-200 placeholder:text-slate-500 ' +
          'outline-none transition-all duration-150 focus:border-violet-500/50 focus:bg-[#13131E] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]'
        }
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange?.('')}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
        >
          <X className="h-3 w-3" strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption
  onChange?: (sort: SortOption) => void
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

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={
          'inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#1E1E2E] bg-[#0F0F18] px-2.5 text-[12.5px] text-slate-300 ' +
          'transition-colors duration-150 hover:border-violet-500/30 hover:text-slate-100'
        }
      >
        <span className="text-slate-500">Sort:</span>
        <span className="font-medium">{SORT_LABELS[value]}</span>
        <ChevronDown
          className={'h-3 w-3 text-slate-500 transition-transform duration-150 ' + (open ? 'rotate-180' : '')}
          strokeWidth={2}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-30 w-52 overflow-hidden rounded-lg border border-[#252535] bg-[#13131E] p-1 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => {
                  onChange?.(key)
                  setOpen(false)
                }}
                role="option"
                aria-selected={value === key}
                className={
                  'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors duration-100 ' +
                  (value === key
                    ? 'bg-violet-500/15 text-violet-100'
                    : 'text-slate-300 hover:bg-white/[0.04] hover:text-slate-100')
                }
              >
                <span>{SORT_LABELS[key]}</span>
                {value === key && <Check className="h-3 w-3" strokeWidth={2.2} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
