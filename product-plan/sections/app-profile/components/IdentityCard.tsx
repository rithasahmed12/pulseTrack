import { useRef } from 'react'
import { Camera, Lock, Save, Undo2, Loader2 } from 'lucide-react'
import type {
  AppUser,
  AppUserDraft,
} from '../types'

export interface IdentityCardProps {
  user: AppUser
  draft: AppUserDraft
  isDirty: boolean
  isSaving: boolean
  onDisplayNameChange?: (value: string) => void
  onBioChange?: (value: string) => void
  onAvatarChange?: (file: File) => void
  onSave?: () => void
  onDiscard?: () => void
}

export function IdentityCard({
  user,
  draft,
  isDirty,
  isSaving,
  onDisplayNameChange,
  onBioChange,
  onAvatarChange,
  onSave,
  onDiscard,
}: IdentityCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const memberSince = formatJoined(user.joinedAt)

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(6,182,212,0.5), transparent)',
        }}
      />

      <div className="grid gap-5 p-5 sm:gap-6 sm:p-6 lg:grid-cols-[auto_1fr] lg:items-start">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 lg:items-start">
          <div className="group relative">
            <div className="relative h-[96px] w-[96px] overflow-hidden rounded-full p-[2px] sm:h-[104px] sm:w-[104px]">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400"
              />
              <span className="relative block h-full w-full overflow-hidden rounded-full bg-[#0F0F18]">
                <img
                  src={draft.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </span>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change avatar"
              className={
                'absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 ' +
                'group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none'
              }
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-2.5 py-1 text-[11px] font-medium text-violet-100 ring-1 ring-inset ring-violet-500/40">
                <Camera className="h-3 w-3" strokeWidth={2} />
                Change
              </span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onAvatarChange?.(file)
              }}
            />
          </div>

          <div className="text-center text-[11px] text-slate-500 lg:text-left">
            <p className="font-mono uppercase tracking-[0.18em]">Member since</p>
            <p className="mt-0.5 font-medium text-slate-300">{memberSince}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Display name */}
          <Field
            id="display-name"
            label="Display name"
            counter={`${draft.displayName.length}/40`}
          >
            <input
              id="display-name"
              type="text"
              maxLength={40}
              disabled={isSaving}
              value={draft.displayName}
              onChange={(e) => onDisplayNameChange?.(e.target.value)}
              className="h-10 w-full bg-transparent px-3 text-[14.5px] font-medium text-slate-100 outline-none"
            />
          </Field>

          {/* Email (read-only) */}
          <Field
            id="email"
            label="Email"
            hint={
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <Lock className="h-2.5 w-2.5" strokeWidth={2} />
                Managed by sign-in
              </span>
            }
          >
            <input
              id="email"
              type="email"
              readOnly
              value={user.email}
              className="h-10 w-full bg-transparent px-3 text-[14px] text-slate-400 outline-none cursor-default"
            />
          </Field>

          {/* Bio */}
          <Field
            id="bio"
            label="Bio"
            counter={`${draft.bio.length}/280`}
          >
            <textarea
              id="bio"
              maxLength={280}
              rows={3}
              disabled={isSaving}
              value={draft.bio}
              onChange={(e) => onBioChange?.(e.target.value)}
              className="block w-full resize-none bg-transparent px-3 py-2.5 text-[14px] leading-relaxed text-slate-200 outline-none"
            />
          </Field>

          {/* Actions */}
          {isDirty && (
            <div className="flex items-center justify-end gap-2 border-t border-[#1A1A24] pt-4">
              <button
                type="button"
                onClick={onDiscard}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 disabled:opacity-50"
              >
                <Undo2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                Discard
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className={
                  'inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[12.5px] font-medium text-white ' +
                  'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.55)] ' +
                  'transition-colors duration-150 hover:bg-violet-500 ' +
                  'disabled:cursor-not-allowed disabled:opacity-70'
                }
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Save changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  hint,
  counter,
  children,
}: {
  id: string
  label: string
  hint?: React.ReactNode
  counter?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-[12.5px] font-medium text-slate-300">
          {label}
        </label>
        {hint ?? (counter && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 tabular-nums">
            {counter}
          </span>
        ))}
      </div>
      <div className="rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] transition-all duration-150 focus-within:border-violet-500/50 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]">
        {children}
      </div>
    </div>
  )
}

function formatJoined(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}
