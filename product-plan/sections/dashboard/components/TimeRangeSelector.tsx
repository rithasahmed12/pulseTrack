import type {
  TimeRange,
  TimeRangeOption,
} from '../types'

export interface TimeRangeSelectorProps {
  value: TimeRange
  options: TimeRangeOption[]
  onChange?: (range: TimeRange) => void
}

export function TimeRangeSelector({ value, options, onChange }: TimeRangeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Time range"
      className="inline-flex items-center rounded-lg border border-[#1E1E2E] bg-[#0F0F18] p-0.5"
    >
      {options.map((opt) => {
        const active = opt.id === value
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange?.(opt.id)}
            title={opt.longLabel}
            className={
              'relative rounded-md px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wider transition-colors duration-150 ' +
              (active
                ? 'bg-violet-500/15 text-violet-100 shadow-[inset_0_0_0_1px_rgba(124,58,237,0.25)]'
                : 'text-slate-400 hover:text-slate-200')
            }
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
