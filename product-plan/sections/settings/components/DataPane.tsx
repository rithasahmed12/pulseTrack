import { useEffect, useRef, useState } from 'react'
import { Download, Trash2, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'

export interface DataPaneProps {
  onClearCache?: () => void
  onExportCsv?: () => void
  onDeleteAccount?: () => void
}

export function DataPane({ onClearCache, onExportCsv, onDeleteAccount }: DataPaneProps) {
  const [confirmingCache, setConfirmingCache] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [exporting, setExporting] = useState(false)
  const cacheConfirmRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!confirmingCache) return
    function onDocClick(e: MouseEvent) {
      if (!cacheConfirmRef.current?.contains(e.target as Node)) setConfirmingCache(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setConfirmingCache(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [confirmingCache])

  const canDelete = deleteText === 'DELETE'

  function handleExport() {
    setExporting(true)
    onExportCsv?.()
    window.setTimeout(() => setExporting(false), 1400)
  }

  return (
    <div className="space-y-5">
      {/* Export CSV */}
      <ActionCard
        icon={<Download className="h-4 w-4" strokeWidth={1.8} />}
        tone="cyan"
        title="Export workspace as CSV"
        description="A single CSV containing every tracked profile, scraped post, follower snapshot, and activity event in your workspace."
      >
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[12.5px] font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.55)] transition-colors duration-150 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {exporting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Preparing…
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" strokeWidth={1.8} />
              Export CSV
            </>
          )}
        </button>
      </ActionCard>

      {/* Clear cache */}
      <ActionCard
        icon={<RefreshCw className="h-4 w-4" strokeWidth={1.8} />}
        tone="amber"
        title="Clear scrape cache"
        description="Removes locally cached thumbnails and parsed scrape responses. Historical data in Supabase is unaffected — only the in-memory caches are wiped."
      >
        <div ref={cacheConfirmRef} className="relative">
          <button
            type="button"
            onClick={() => setConfirmingCache((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#1E1E2E] bg-[#0F0F18] px-3 py-1.5 text-[12.5px] text-slate-300 transition-colors duration-150 hover:border-violet-500/30 hover:text-slate-100"
          >
            Clear cache
          </button>
          {confirmingCache && (
            <div
              role="dialog"
              aria-label="Confirm clear cache"
              className="absolute right-0 bottom-[calc(100%+6px)] z-20 w-64 overflow-hidden rounded-lg border border-[#252535] bg-[#13131E] p-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
            >
              <p className="mb-2.5 text-[12px] leading-snug text-slate-300">
                Clear the scrape cache? The next dashboard load will refetch thumbnails and may be slightly slower.
              </p>
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setConfirmingCache(false)}
                  className="rounded-md px-2 py-1 text-[12px] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingCache(false)
                    onClearCache?.()
                  }}
                  className="rounded-md bg-amber-500/15 px-2 py-1 text-[12px] font-medium text-amber-200 hover:bg-amber-500/25"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </ActionCard>

      {/* Danger zone */}
      <section className="relative overflow-hidden rounded-2xl border border-rose-500/25 bg-rose-500/[0.03] p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(244,63,94,0.5), transparent)',
          }}
        />
        <header className="mb-4 flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200">
            <AlertTriangle className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-rose-100">
              Danger zone
            </h2>
            <p className="mt-0.5 text-[12.5px] leading-snug text-rose-200/70">
              Deleting your account removes all tracked profiles, scraped posts, follower snapshots, and history. This cannot be undone.
            </p>
          </div>
        </header>

        <div className="space-y-3 border-t border-rose-500/15 pt-4">
          <label htmlFor="delete-confirm" className="block text-[12.5px] font-medium text-rose-100">
            Type <span className="font-mono rounded bg-rose-500/15 px-1 py-px text-rose-100">DELETE</span> to confirm
          </label>
          <div
            className={
              'rounded-lg border bg-[#0A0A0F] transition-all duration-150 ' +
              (canDelete
                ? 'border-rose-500/60 shadow-[0_0_0_3px_rgba(244,63,94,0.18)]'
                : 'border-rose-500/15')
            }
          >
            <input
              id="delete-confirm"
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="DELETE"
              className="h-10 w-full bg-transparent px-3 text-[14px] tracking-[0.18em] text-slate-100 placeholder:text-slate-700 outline-none font-mono"
            />
          </div>
          <button
            type="button"
            onClick={onDeleteAccount}
            disabled={!canDelete}
            className={
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors duration-150 ' +
              (canDelete
                ? 'bg-rose-500 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_-12px_rgba(244,63,94,0.6)] hover:bg-rose-400'
                : 'cursor-not-allowed border border-rose-500/20 bg-rose-500/[0.06] text-rose-300/60')
            }
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
            Delete account permanently
          </button>
        </div>
      </section>
    </div>
  )
}

function ActionCard({
  icon,
  tone,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  tone: 'violet' | 'cyan' | 'amber'
  title: string
  description: string
  children: React.ReactNode
}) {
  const toneClass = {
    violet: 'text-violet-300',
    cyan: 'text-cyan-300',
    amber: 'text-amber-300',
  }[tone]
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span
          className={
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1E1E2E] bg-[#16161F] ' +
            toneClass
          }
          aria-hidden
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium tracking-tight text-slate-100">
            {title}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-snug text-slate-400">
            {description}
          </p>
        </div>
      </div>
      <div className="sm:shrink-0">{children}</div>
    </article>
  )
}
