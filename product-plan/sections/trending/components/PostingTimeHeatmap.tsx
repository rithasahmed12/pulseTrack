import { useMemo, useState } from 'react'
import { Clock } from 'lucide-react'
import type {
  Heatmap,
  HeatmapCell,
} from '../types'

export interface PostingTimeHeatmapProps {
  heatmap: Heatmap
  onCellClick?: (cell: HeatmapCell) => void
}

export function PostingTimeHeatmap({ heatmap, onCellClick }: PostingTimeHeatmapProps) {
  const [hovered, setHovered] = useState<HeatmapCell | null>(null)

  // Group cells by day for easier grid rendering
  const grid = useMemo(() => {
    const byDay: Map<number, HeatmapCell[]> = new Map()
    for (const cell of heatmap.cells) {
      if (!byDay.has(cell.day)) byDay.set(cell.day, [])
      byDay.get(cell.day)!.push(cell)
    }
    for (const [, row] of byDay) row.sort((a, b) => a.hour - b.hour)
    return byDay
  }, [heatmap])

  const allValues = heatmap.cells.map((c) => c.value)
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)

  // Find the best slot for the eyebrow stat
  const best = useMemo(
    () => heatmap.cells.reduce((b, c) => (c.value > b.value ? c : b), heatmap.cells[0]),
    [heatmap],
  )

  return (
    <section className="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A24] px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-cyan-300" strokeWidth={1.8} />
          <h2 className="text-[14px] font-semibold tracking-tight text-slate-100">
            Best posting times
          </h2>
        </div>
        <div className="font-mono text-[10.5px] uppercase tracking-wider text-slate-500">
          Peak ·{' '}
          <span className="font-medium text-slate-200">
            {heatmap.weekdays[best.day]} {formatHour(best.hour)}
          </span>
          <span className="ml-2 text-amber-300 tabular-nums">{best.value.toFixed(2)}%</span>
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="min-w-[640px]">
          {/* Hour axis */}
          <div className="mb-2 grid items-end gap-[2px] pl-10" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="text-center">
                {h % 6 === 0 ? (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                    {h.toString().padStart(2, '0')}
                  </span>
                ) : (
                  <span className="text-[8px] text-slate-700">·</span>
                )}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-[2px]">
            {heatmap.weekdays.map((label, dayIdx) => (
              <div key={dayIdx} className="flex items-center gap-2">
                <span className="font-mono w-8 shrink-0 text-right text-[10px] uppercase tracking-wider text-slate-500">
                  {label}
                </span>
                <div
                  className="grid flex-1 gap-[2px]"
                  style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                >
                  {(grid.get(dayIdx) ?? []).map((cell) => {
                    const t = (cell.value - min) / Math.max(0.01, max - min)
                    const opacity = 0.08 + t * 0.85
                    const isHovered =
                      hovered?.day === cell.day && hovered?.hour === cell.hour
                    return (
                      <button
                        key={cell.hour}
                        type="button"
                        onClick={() => onCellClick?.(cell)}
                        onMouseEnter={() => setHovered(cell)}
                        onMouseLeave={() => setHovered(null)}
                        aria-label={`${heatmap.weekdays[cell.day]} ${formatHour(cell.hour)} — ${cell.value.toFixed(2)}% engagement`}
                        className={
                          'relative h-5 rounded-sm transition-all duration-100 ' +
                          (isHovered ? 'ring-1 ring-violet-300 ring-offset-1 ring-offset-[#0F0F18]' : '')
                        }
                        style={{
                          background: `rgba(124, 58, 237, ${opacity})`,
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend + hover tooltip line */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10.5px] text-slate-500">
              <span className="font-mono uppercase tracking-wider">Low</span>
              <span className="flex h-2 w-32 overflow-hidden rounded-full ring-1 ring-inset ring-[#1A1A24]">
                {[0.08, 0.18, 0.32, 0.48, 0.64, 0.78, 0.93].map((op, i) => (
                  <span
                    key={i}
                    className="flex-1"
                    style={{ background: `rgba(124,58,237,${op})` }}
                  />
                ))}
              </span>
              <span className="font-mono uppercase tracking-wider">High</span>
            </div>

            <div
              className={
                'rounded-md border border-[#252535] bg-[#13131E] px-2.5 py-1 text-[11px] transition-opacity duration-150 ' +
                (hovered ? 'opacity-100' : 'pointer-events-none opacity-0')
              }
              role="status"
              aria-live="polite"
            >
              {hovered ? (
                <span className="text-slate-200">
                  <span className="font-medium">{heatmap.weekdays[hovered.day]}</span>
                  <span className="ml-1.5 font-mono text-slate-400">{formatHour(hovered.hour)}</span>
                  <span className="mx-2 text-slate-700">·</span>
                  <span className="font-medium text-violet-200 tabular-nums">{hovered.value.toFixed(2)}%</span>
                  <span className="ml-1 font-mono text-[9px] uppercase tracking-wider text-slate-500">avg eng</span>
                </span>
              ) : (
                <span className="text-slate-500">Hover a cell</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}
