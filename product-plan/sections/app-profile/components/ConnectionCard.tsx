import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Plus, RefreshCw, Unplug } from 'lucide-react'
import type {
  Connection,
} from '../types'

export interface ConnectionCardProps {
  connection: Connection
  onConnectClick?: () => void
  onDisconnectClick?: () => void
}

export function ConnectionCard({
  connection,
  onConnectClick,
  onDisconnectClick,
}: ConnectionCardProps) {
  const [confirming, setConfirming] = useState(false)
  const confirmRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!confirming) return
    function onDocClick(e: MouseEvent) {
      if (!confirmRef.current?.contains(e.target as Node)) setConfirming(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setConfirming(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [confirming])

  const isConnected = connection.isConnected
  const isIG = connection.platform === 'instagram'

  return (
    <article
      className={
        'relative flex flex-col overflow-hidden rounded-2xl border bg-[#0F0F18]/85 p-5 backdrop-blur-xl transition-all duration-200 ' +
        (isConnected
          ? 'border-emerald-500/20 hover:border-emerald-500/35'
          : 'border-[#1E1E2E] hover:border-violet-500/30')
      }
    >
      {/* Platform color wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl"
        style={{
          background: isIG
            ? 'radial-gradient(circle, rgba(225,48,108,0.18), transparent 70%)'
            : 'radial-gradient(circle, rgba(6,182,212,0.18), transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={connection.platform} />
          <div>
            <p className="text-[14.5px] font-semibold tracking-tight text-slate-100">
              {connection.label}
            </p>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-500">
              {isIG ? 'apify · instagram-scraper' : 'apify · tiktok-scraper'}
            </p>
          </div>
        </div>
        <StatusChip isConnected={isConnected} />
      </div>

      {/* Body */}
      <div className="relative mt-4 flex-1">
        {isConnected ? (
          <>
            <p className="text-[13px] text-slate-300">
              Linked as{' '}
              <span className="font-mono text-slate-100">@{connection.connectedHandle}</span>
            </p>
            {connection.lastSyncedAt && (
              <p className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-slate-500">
                <RefreshCw className="h-2.5 w-2.5" strokeWidth={1.8} />
                Last sync {formatRelative(connection.lastSyncedAt)}
              </p>
            )}
          </>
        ) : (
          <p className="text-[12.5px] leading-relaxed text-slate-400">
            {connection.hint}
          </p>
        )}
      </div>

      {/* Footer action row */}
      <div className="relative mt-4 flex items-end justify-between gap-3 border-t border-[#1A1A24] pt-4">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-slate-600">
          OAuth · coming soon
        </span>

        {isConnected ? (
          <div ref={confirmRef} className="relative">
            <button
              type="button"
              onClick={() => setConfirming((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#1E1E2E] bg-[#0F0F18] px-2.5 py-1.5 text-[12px] text-slate-300 hover:border-rose-500/30 hover:text-rose-200"
            >
              <Unplug className="h-3.5 w-3.5" strokeWidth={1.8} />
              Disconnect
            </button>
            {confirming && (
              <div
                role="dialog"
                aria-label="Confirm disconnect"
                className="absolute right-0 bottom-[calc(100%+6px)] z-20 w-60 overflow-hidden rounded-lg border border-[#252535] bg-[#13131E] p-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
              >
                <p className="mb-2.5 text-[12px] leading-snug text-slate-300">
                  Disconnect{' '}
                  <span className="font-medium text-slate-100">{connection.label}</span>?
                  First-party metrics will no longer flow into your workspace.
                </p>
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="rounded-md px-2 py-1 text-[12px] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirming(false)
                      onDisconnectClick?.()
                    }}
                    className="rounded-md bg-rose-500/15 px-2 py-1 text-[12px] font-medium text-rose-200 hover:bg-rose-500/25"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onConnectClick}
            className={
              'inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[12.5px] font-medium text-white ' +
              'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.55)] ' +
              'transition-colors duration-150 hover:bg-violet-500'
            }
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
            Connect {connection.label}
          </button>
        )}
      </div>
    </article>
  )
}

function StatusChip({ isConnected }: { isConnected: boolean }) {
  if (isConnected) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-1.5 py-[1px] text-[10px] font-medium uppercase tracking-wider text-emerald-200">
        <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2.2} />
        Connected
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-white/[0.03] px-1.5 py-[1px] text-[10px] font-medium uppercase tracking-wider text-slate-500">
      Not connected
    </span>
  )
}

function PlatformIcon({ platform }: { platform: Connection['platform'] }) {
  if (platform === 'instagram') {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E1306C] to-[#F77737] shadow-[0_0_22px_-4px_rgba(225,48,108,0.65)]">
        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.07 1.25.07 1.63.07 4.85s-.02 3.6-.09 4.85c-.05 1.17-.25 1.8-.41 2.22a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.25.07-1.65.07-4.85.07s-3.6-.02-4.85-.09c-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.17 15.6 2.15 15.22 2.15 12s.02-3.6.09-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.4 2.17 8.78 2.15 12 2.2zm0 4.85a4.95 4.95 0 1 0 0 9.9 4.95 4.95 0 0 0 0-9.9zm0 1.8a3.15 3.15 0 1 1 0 6.3 3.15 3.15 0 0 1 0-6.3zm5.1-2.04a1.16 1.16 0 1 1 0 2.32 1.16 1.16 0 0 1 0-2.32z" />
        </svg>
      </span>
    )
  }
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black ring-1 ring-inset ring-white/15">
      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.6 7.3a6.4 6.4 0 0 1-4.1-1.5v8.6a5.3 5.3 0 1 1-4.7-5.3v2.2a3.1 3.1 0 1 0 2.5 3v-11h2.3a4.1 4.1 0 0 0 4 3.6v0z" />
      </svg>
    </span>
  )
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - then)
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
