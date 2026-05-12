import { useMemo, useState } from 'react'
import type {
  PostType,
  PostTypeSlice,
  TimePoint,
} from '../types'

/* ============================ LineChart (engagement) ====================== */

export interface LineChartProps {
  series: TimePoint[]
  /** Y-axis label suffix, e.g. "%" */
  unitSuffix?: string
  /** Hex / class color for the line + dot accent. */
  accent?: string
  /** Optional: number of Y grid lines (default 4). */
  yTicks?: number
  /** Accessible name. */
  ariaLabel?: string
}

export function LineChart({
  series,
  unitSuffix = '',
  accent = '#7C3AED',
  yTicks = 4,
  ariaLabel = 'Line chart',
}: LineChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const { width, height, padding } = { width: 800, height: 220, padding: { l: 36, r: 12, t: 12, b: 24 } }

  const { points, yMin, yMax, xStep } = useMemo(() => {
    const ys = series.map((p) => p.value)
    let yMin = Math.min(...ys)
    let yMax = Math.max(...ys)
    const range = yMax - yMin || 1
    // give a little headroom
    yMin = yMin - range * 0.15
    yMax = yMax + range * 0.15
    const plotW = width - padding.l - padding.r
    const plotH = height - padding.t - padding.b
    const xStep = series.length > 1 ? plotW / (series.length - 1) : 0
    const points = series.map((p, i) => ({
      x: padding.l + i * xStep,
      y: padding.t + plotH - ((p.value - yMin) / (yMax - yMin)) * plotH,
      raw: p,
    }))
    return { points, yMin, yMax, xStep }
  }, [series])

  const linePath = points
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(' ')

  const fillPath =
    linePath +
    ` L${points[points.length - 1].x},${height - padding.b} L${padding.l},${height - padding.b} Z`

  const gradId = `lc-fill-${useId()}`

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
        className="block h-[220px] w-full"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * width - padding.l
          const idx = Math.round(x / Math.max(1, xStep))
          setHoverIdx(Math.max(0, Math.min(series.length - 1, idx)))
        }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Y grid */}
        <YAxis
          yMin={yMin}
          yMax={yMax}
          padding={padding}
          height={height}
          width={width}
          ticks={yTicks}
          unitSuffix={unitSuffix}
        />

        {/* Fill */}
        <path d={fillPath} fill={`url(#${gradId})`} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={accent}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 6px ${hexAlpha(accent, 0.55)})` }}
        />

        {/* Hover guide + dot + tooltip */}
        {hoverIdx != null && points[hoverIdx] && (
          <g>
            <line
              x1={points[hoverIdx].x}
              x2={points[hoverIdx].x}
              y1={padding.t}
              y2={height - padding.b}
              stroke="rgba(241,245,249,0.18)"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
            <circle
              cx={points[hoverIdx].x}
              cy={points[hoverIdx].y}
              r={4}
              fill={accent}
              stroke="#0F0F18"
              strokeWidth={1.5}
              style={{ filter: `drop-shadow(0 0 6px ${hexAlpha(accent, 0.7)})` }}
            />
            <Tooltip
              x={points[hoverIdx].x}
              y={points[hoverIdx].y}
              maxX={width}
              date={points[hoverIdx].raw.date}
              value={`${points[hoverIdx].raw.value.toFixed(2)}${unitSuffix}`}
              accent={accent}
            />
          </g>
        )}
      </svg>
    </div>
  )
}

/* ============================ AreaChart (followers) ======================= */

export interface AreaChartProps {
  series: TimePoint[]
  accent?: string
  yTicks?: number
  ariaLabel?: string
}

export function AreaChart({
  series,
  accent = '#06B6D4',
  yTicks = 4,
  ariaLabel = 'Area chart',
}: AreaChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const { width, height, padding } = { width: 800, height: 220, padding: { l: 50, r: 12, t: 12, b: 24 } }

  const { points, yMin, yMax, xStep } = useMemo(() => {
    const ys = series.map((p) => p.value)
    let yMin = Math.min(...ys)
    let yMax = Math.max(...ys)
    const range = yMax - yMin || 1
    yMin = yMin - range * 0.1
    yMax = yMax + range * 0.2
    const plotW = width - padding.l - padding.r
    const plotH = height - padding.t - padding.b
    const xStep = series.length > 1 ? plotW / (series.length - 1) : 0
    const points = series.map((p, i) => ({
      x: padding.l + i * xStep,
      y: padding.t + plotH - ((p.value - yMin) / (yMax - yMin)) * plotH,
      raw: p,
    }))
    return { points, yMin, yMax, xStep }
  }, [series])

  // Smooth path with cubic catmull-rom -> bezier
  const linePath = useMemo(() => buildSmoothPath(points), [points])
  const fillPath = `${linePath} L${points[points.length - 1].x},${height - padding.b} L${padding.l},${height - padding.b} Z`

  const gradId = `ac-fill-${useId()}`

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
        className="block h-[220px] w-full"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * width - padding.l
          const idx = Math.round(x / Math.max(1, xStep))
          setHoverIdx(Math.max(0, Math.min(series.length - 1, idx)))
        }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0.4} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
        </defs>

        <YAxis
          yMin={yMin}
          yMax={yMax}
          padding={padding}
          height={height}
          width={width}
          ticks={yTicks}
          formatTick={(v) => formatCount(v)}
        />

        <path d={fillPath} fill={`url(#${gradId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={accent}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 6px ${hexAlpha(accent, 0.55)})` }}
        />

        {hoverIdx != null && points[hoverIdx] && (
          <g>
            <line
              x1={points[hoverIdx].x}
              x2={points[hoverIdx].x}
              y1={padding.t}
              y2={height - padding.b}
              stroke="rgba(241,245,249,0.18)"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
            <circle
              cx={points[hoverIdx].x}
              cy={points[hoverIdx].y}
              r={4}
              fill={accent}
              stroke="#0F0F18"
              strokeWidth={1.5}
              style={{ filter: `drop-shadow(0 0 6px ${hexAlpha(accent, 0.7)})` }}
            />
            <Tooltip
              x={points[hoverIdx].x}
              y={points[hoverIdx].y}
              maxX={width}
              date={points[hoverIdx].raw.date}
              value={formatCount(points[hoverIdx].raw.value)}
              accent={accent}
              valueSuffix=" followers"
            />
          </g>
        )}
      </svg>
    </div>
  )
}

/* ============================ DonutChart (post types) ===================== */

export interface DonutChartProps {
  slices: PostTypeSlice[]
  onSliceClick?: (type: PostType) => void
  size?: number
  thickness?: number
}

const TYPE_COLORS: Record<PostType, string> = {
  carousel: '#7C3AED',
  reel: '#06B6D4',
  video: '#06B6D4',
  photo: '#F59E0B',
}

const TYPE_LABELS: Record<PostType, string> = {
  carousel: 'Carousel',
  reel: 'Reel',
  video: 'Video',
  photo: 'Photo',
}

export function DonutChart({
  slices,
  onSliceClick,
  size = 180,
  thickness = 18,
}: DonutChartProps) {
  const [hovered, setHovered] = useState<PostType | null>(null)

  const total = slices.reduce((acc, s) => acc + s.count, 0)
  const radius = size / 2 - thickness / 2
  const center = size / 2
  const circumference = 2 * Math.PI * radius

  let cumulative = 0
  const arcs = slices.map((slice) => {
    const fraction = total > 0 ? slice.count / total : 0
    const length = fraction * circumference
    const offset = (cumulative / circumference) * circumference
    cumulative += length
    return {
      slice,
      length,
      offset,
      color: TYPE_COLORS[slice.type] ?? '#7C3AED',
    }
  })

  const dominant = slices.reduce(
    (best, s) => (s.count > (best?.count ?? -1) ? s : best),
    null as PostTypeSlice | null,
  )
  const dominantPct = dominant && total > 0 ? Math.round((dominant.count / total) * 100) : 0

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="block h-full w-full">
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1A1A24"
            strokeWidth={thickness}
          />
          {/* Arcs */}
          {arcs.map((a) => {
            const isHovered = hovered === a.slice.type
            return (
              <circle
                key={a.slice.type}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={a.color}
                strokeWidth={isHovered ? thickness + 3 : thickness}
                strokeDasharray={`${a.length} ${circumference - a.length}`}
                strokeDashoffset={-a.offset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${center} ${center})`}
                style={{
                  cursor: onSliceClick ? 'pointer' : 'default',
                  transition: 'stroke-width 150ms ease',
                  filter: isHovered ? `drop-shadow(0 0 8px ${hexAlpha(a.color, 0.6)})` : undefined,
                }}
                onMouseEnter={() => setHovered(a.slice.type)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSliceClick?.(a.slice.type)}
              />
            )
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {hovered ? (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                {TYPE_LABELS[hovered]}
              </p>
              <p className="mt-0.5 text-[24px] font-semibold leading-none tracking-tight text-slate-50 tabular-nums">
                {slices.find((s) => s.type === hovered)?.count ?? 0}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                {Math.round(
                  ((slices.find((s) => s.type === hovered)?.count ?? 0) / total) * 100,
                )}
                %
              </p>
            </>
          ) : (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                {dominant ? TYPE_LABELS[dominant.type] : 'Posts'}
              </p>
              <p className="mt-0.5 text-[24px] font-semibold leading-none tracking-tight text-slate-50 tabular-nums">
                {dominantPct}%
              </p>
              <p className="mt-1 text-[11px] text-slate-500 tabular-nums">{total} total</p>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <ul className="flex flex-col gap-1.5 self-stretch text-[12px]">
        {slices.map((s) => {
          const color = TYPE_COLORS[s.type] ?? '#7C3AED'
          const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
          const active = hovered === s.type
          return (
            <li key={s.type}>
              <button
                type="button"
                onMouseEnter={() => setHovered(s.type)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSliceClick?.(s.type)}
                className={
                  'flex w-full items-center justify-between rounded-md px-2 py-1 transition-colors duration-150 ' +
                  (active
                    ? 'bg-white/[0.04] text-slate-100'
                    : 'text-slate-300 hover:bg-white/[0.03]')
                }
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: color }}
                  />
                  {TYPE_LABELS[s.type]}
                </span>
                <span className="font-mono text-slate-500 tabular-nums">
                  <span className="text-slate-200">{s.count}</span>
                  <span className="ml-1 text-slate-600">· {pct}%</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ================================== shared ================================ */

function YAxis({
  yMin,
  yMax,
  padding,
  height,
  width,
  ticks,
  unitSuffix = '',
  formatTick,
}: {
  yMin: number
  yMax: number
  padding: { l: number; r: number; t: number; b: number }
  height: number
  width: number
  ticks: number
  unitSuffix?: string
  formatTick?: (v: number) => string
}) {
  const plotH = height - padding.t - padding.b
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) => {
    const t = i / ticks
    return yMin + (yMax - yMin) * (1 - t)
  })
  return (
    <g>
      {tickValues.map((v, i) => {
        const y = padding.t + (i / ticks) * plotH
        return (
          <g key={i}>
            <line
              x1={padding.l}
              x2={width - padding.r}
              y1={y}
              y2={y}
              stroke="#1A1A24"
              strokeWidth={1}
            />
            <text
              x={padding.l - 6}
              y={y + 3}
              textAnchor="end"
              fontSize={9}
              fill="rgba(148,163,184,0.6)"
              fontFamily="ui-monospace, SFMono-Regular, monospace"
            >
              {formatTick ? formatTick(v) : `${v.toFixed(1)}${unitSuffix}`}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function Tooltip({
  x,
  y,
  maxX,
  date,
  value,
  accent,
  valueSuffix,
}: {
  x: number
  y: number
  maxX: number
  date: string
  value: string
  accent: string
  valueSuffix?: string
}) {
  const w = 132
  const h = 36
  // Flip to the left of cursor if near right edge
  const flip = x > maxX - w - 12
  const tx = flip ? x - w - 10 : x + 10
  const ty = Math.max(8, y - h - 8)
  return (
    <g pointerEvents="none">
      <rect
        x={tx}
        y={ty}
        width={w}
        height={h}
        rx={6}
        ry={6}
        fill="rgba(15,15,24,0.95)"
        stroke="#252535"
        strokeWidth={1}
      />
      <circle cx={tx + 10} cy={ty + 14} r={3} fill={accent} />
      <text
        x={tx + 18}
        y={ty + 17}
        fontSize={11}
        fill="#F1F5F9"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        fontWeight={600}
      >
        {value}
        {valueSuffix}
      </text>
      <text
        x={tx + 10}
        y={ty + 28}
        fontSize={9}
        fill="rgba(148,163,184,0.7)"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
      >
        {formatTooltipDate(date)}
      </text>
    </g>
  )
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${points[0].x},${points[0].y}`
  let d = `M${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }
  return d
}

function hexAlpha(hex: string, alpha: number): string {
  const m = hex.replace('#', '')
  const r = parseInt(m.substring(0, 2), 16)
  const g = parseInt(m.substring(2, 4), 16)
  const b = parseInt(m.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '') + 'K'
  return n.toFixed(0)
}

function formatTooltipDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

let __idCounter = 0
function useId(): string {
  // Lightweight stable id per mount — avoids React 17 stale value across SSR which we don't need here.
  return useMemo(() => `${++__idCounter}`, [])
}
