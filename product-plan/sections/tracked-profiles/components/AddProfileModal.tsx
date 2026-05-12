import { useEffect, useMemo, useRef } from 'react'
import { Link2, AtSign, ArrowRight, Loader2, X } from 'lucide-react'
import type {
  AddProfileModalState,
  Platform,
} from '../types'

export interface AddProfileModalProps {
  state: AddProfileModalState
  onInputChange?: (value: string) => void
  onPlatformChange?: (platform: Platform) => void
  onSubmit?: (input: { platform: Platform; username: string }) => void
  onCancel?: () => void
}

/**
 * Best-effort client-side URL parser. Lives in the modal so the host component
 * can either pre-resolve detectedPlatform on every keystroke OR let the modal
 * resolve at submit time — either is correct.
 */
function parseInput(value: string): { platform: Platform | null; username: string } {
  const v = value.trim()
  if (!v) return { platform: null, username: '' }

  // URL detection
  try {
    const url = new URL(v.startsWith('http') ? v : `https://${v}`)
    const host = url.hostname.replace(/^www\./, '')
    const pathSegs = url.pathname.split('/').filter(Boolean)
    if (host === 'instagram.com' && pathSegs.length > 0) {
      return { platform: 'instagram', username: pathSegs[0].replace(/^@/, '') }
    }
    if (host === 'tiktok.com' && pathSegs.length > 0) {
      const seg = pathSegs[0].replace(/^@/, '')
      return { platform: 'tiktok', username: seg }
    }
    if (host === 'vm.tiktok.com' || host === 'm.tiktok.com') {
      return { platform: 'tiktok', username: '' }
    }
  } catch {
    // not a URL — fall through
  }

  // Raw username — strip leading @ but no platform inferred
  return { platform: null, username: v.replace(/^@/, '') }
}

export function AddProfileModal({
  state,
  onInputChange,
  onPlatformChange,
  onSubmit,
  onCancel,
}: AddProfileModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Resolve the effective platform and username at render time.
  // Prefer state.detectedPlatform if the host set it; otherwise parse locally.
  const parsed = useMemo(() => parseInput(state.inputValue), [state.inputValue])
  const isUrlDetected = !!parsed.platform || !!state.detectedPlatform
  const effectivePlatform: Platform =
    state.detectedPlatform ?? parsed.platform ?? state.manualPlatform
  const effectiveUsername = parsed.username

  // Focus the input on open + lock body scroll
  useEffect(() => {
    if (!state.isOpen) return
    inputRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel?.()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [state.isOpen, onCancel])

  if (!state.isOpen) return null

  const canSubmit =
    effectiveUsername.length > 0 && !state.isSubmitting

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit?.({ platform: effectivePlatform, username: effectiveUsername })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Card */}
      <div
        className="relative w-full max-w-[460px] overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(6,182,212,0.5), transparent)',
          }}
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-5">
          <div>
            <h2
              id="add-profile-title"
              className="text-[16px] font-semibold tracking-tight text-slate-50"
            >
              Track a new profile
            </h2>
            <p className="mt-0.5 text-[12.5px] text-slate-400">
              Paste an Instagram or TikTok URL — or type a username and pick the platform.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Smart input */}
        <div className="px-5 py-3">
          <label
            htmlFor="add-profile-input"
            className="mb-1.5 block text-[12px] font-medium text-slate-300"
          >
            Profile URL or username
          </label>
          <div
            className={
              'relative rounded-lg border bg-[#0A0A0F] transition-all duration-150 ' +
              'border-[#1E1E2E] focus-within:border-violet-500/50 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]'
            }
          >
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {isUrlDetected ? (
                <Link2 className="h-4 w-4" strokeWidth={1.8} />
              ) : (
                <AtSign className="h-4 w-4" strokeWidth={1.8} />
              )}
            </span>
            <input
              ref={inputRef}
              id="add-profile-input"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={state.inputValue}
              placeholder="https://instagram.com/melodye.haus  ·  or  ·  melodye.haus"
              onChange={(e) => onInputChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              disabled={state.isSubmitting}
              className="h-10 w-full bg-transparent pl-10 pr-3 text-[14px] text-slate-100 placeholder:text-slate-600 outline-none"
            />
          </div>

          {/* Resolution hint */}
          <div className="mt-2 flex items-center gap-2 text-[11.5px] text-slate-500">
            {state.inputValue ? (
              effectiveUsername ? (
                <>
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                  />
                  <span>
                    Will track{' '}
                    <span className="font-medium text-slate-200">
                      @{effectiveUsername}
                    </span>{' '}
                    on{' '}
                    <span className="font-medium text-slate-200">
                      {effectivePlatform === 'instagram' ? 'Instagram' : 'TikTok'}
                    </span>
                    {isUrlDetected && (
                      <span className="ml-1 rounded-sm bg-cyan-400/10 px-1 py-px text-[10px] uppercase tracking-wider text-cyan-300">
                        detected
                      </span>
                    )}
                  </span>
                </>
              ) : (
                <>
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-amber-400"
                  />
                  Couldn't parse a username from that link.
                </>
              )
            ) : (
              <>&nbsp;</>
            )}
          </div>
        </div>

        {/* Platform toggle — only active when not URL-detected */}
        <div className="px-5 pb-4">
          <p className="mb-1.5 text-[12px] font-medium text-slate-300">
            Platform
            {isUrlDetected && (
              <span className="ml-1.5 text-[11px] font-normal text-slate-500">
                · locked by URL
              </span>
            )}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <PlatformChoice
              platform="instagram"
              active={effectivePlatform === 'instagram'}
              locked={isUrlDetected}
              onClick={() => onPlatformChange?.('instagram')}
            />
            <PlatformChoice
              platform="tiktok"
              active={effectivePlatform === 'tiktok'}
              locked={isUrlDetected}
              onClick={() => onPlatformChange?.('tiktok')}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#1A1A24] bg-[#0B0B12] px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={state.isSubmitting}
            className="rounded-md px-3 py-1.5 text-[12.5px] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={
              'inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[12.5px] font-medium text-white ' +
              'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.55)] ' +
              'transition-colors duration-150 hover:bg-violet-500 ' +
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-violet-600'
            }
          >
            {state.isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                Add profile
                <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function PlatformChoice({
  platform,
  active,
  locked,
  onClick,
}: {
  platform: Platform
  active: boolean
  locked: boolean
  onClick?: () => void
}) {
  const isIG = platform === 'instagram'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked && !active}
      aria-pressed={active}
      className={
        'group relative overflow-hidden rounded-lg border p-3 text-left transition-all duration-150 ' +
        (active
          ? 'border-violet-500/40 bg-violet-500/[0.06]'
          : 'border-[#1E1E2E] bg-[#0A0A0F] hover:border-violet-500/25') +
        ' disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#1E1E2E]'
      }
    >
      <div className="flex items-center gap-2.5">
        <span
          className={
            'flex h-8 w-8 items-center justify-center rounded-md ' +
            (isIG
              ? 'bg-gradient-to-br from-[#E1306C] to-[#F77737]'
              : 'bg-black ring-1 ring-inset ring-white/10')
          }
        >
          {isIG ? (
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.07 1.25.07 1.63.07 4.85s-.02 3.6-.09 4.85c-.05 1.17-.25 1.8-.41 2.22a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.25.07-1.65.07-4.85.07s-3.6-.02-4.85-.09c-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.17 15.6 2.15 15.22 2.15 12s.02-3.6.09-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.4 2.17 8.78 2.15 12 2.2zm0 4.85a4.95 4.95 0 1 0 0 9.9 4.95 4.95 0 0 0 0-9.9zm0 1.8a3.15 3.15 0 1 1 0 6.3 3.15 3.15 0 0 1 0-6.3zm5.1-2.04a1.16 1.16 0 1 1 0 2.32 1.16 1.16 0 0 1 0-2.32z" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.6 7.3a6.4 6.4 0 0 1-4.1-1.5v8.6a5.3 5.3 0 1 1-4.7-5.3v2.2a3.1 3.1 0 1 0 2.5 3v-11h2.3a4.1 4.1 0 0 0 4 3.6v0z" />
            </svg>
          )}
        </span>
        <div>
          <p className="text-[13px] font-medium text-slate-100">
            {isIG ? 'Instagram' : 'TikTok'}
          </p>
          <p className="font-mono text-[10.5px] uppercase tracking-wider text-slate-500">
            {isIG ? 'apify · instagram-scraper' : 'apify · tiktok-scraper'}
          </p>
        </div>
      </div>
      {active && (
        <span
          aria-hidden
          className="absolute right-2 top-2 inline-flex h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(124,58,237,0.7)]"
        />
      )}
    </button>
  )
}
