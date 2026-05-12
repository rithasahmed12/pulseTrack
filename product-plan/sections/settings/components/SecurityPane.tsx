import { useMemo, useState, type FormEvent } from 'react'
import { Lock, Eye, EyeOff, ShieldCheck, Smartphone } from 'lucide-react'
import { Switch } from './Switch'
import type {
  PasswordFormValues,
  SecurityState,
} from '../types'

export interface SecurityPaneProps {
  security: SecurityState
  onPasswordSubmit?: (values: PasswordFormValues) => void
  onTwoFactorToggle?: (enabled: boolean) => void
  onSetUp2FAClick?: () => void
}

function scorePassword(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { score: 0, label: 'Empty' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const label = ['Too short', 'Weak', 'Fair', 'Strong', 'Excellent'][score] as string
  return { score: score as 0 | 1 | 2 | 3 | 4, label }
}

export function SecurityPane({
  security,
  onPasswordSubmit,
  onTwoFactorToggle,
  onSetUp2FAClick,
}: SecurityPaneProps) {
  const [values, setValues] = useState<PasswordFormValues>({
    current: '',
    next: '',
    confirm: '',
  })
  const [show, setShow] = useState(false)
  const [submitted, setSubmitted] = useState<'idle' | 'saved'>('idle')

  const strength = useMemo(() => scorePassword(values.next), [values.next])
  const mismatch =
    values.confirm.length > 0 && values.next !== values.confirm
  const canSubmit =
    values.current.length > 0 &&
    values.next.length >= 8 &&
    values.next === values.confirm &&
    !mismatch

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onPasswordSubmit?.(values)
    setSubmitted('saved')
    setValues({ current: '', next: '', confirm: '' })
    window.setTimeout(() => setSubmitted('idle'), 2200)
  }

  const strengthColors = [
    'bg-slate-700',
    'bg-rose-500',
    'bg-amber-500',
    'bg-cyan-500',
    'bg-emerald-500',
  ]

  return (
    <div className="space-y-5">
      {/* Password card */}
      <form
        onSubmit={handleSubmit}
        className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 p-5 backdrop-blur-xl"
      >
        <header className="mb-4">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-100">
            Change password
          </h2>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Last changed {formatLong(security.lastPasswordChangeAt)}
          </p>
        </header>

        <div className="space-y-3">
          <PwField
            id="current-pw"
            label="Current password"
            value={values.current}
            show={show}
            onShowToggle={() => setShow((v) => !v)}
            onChange={(v) => setValues((vs) => ({ ...vs, current: v }))}
          />
          <div>
            <PwField
              id="new-pw"
              label="New password"
              value={values.next}
              show={show}
              onShowToggle={() => setShow((v) => !v)}
              onChange={(v) => setValues((vs) => ({ ...vs, next: v }))}
              placeholder="At least 8 characters"
            />
            {values.next.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={
                        'h-1 flex-1 rounded-full transition-colors duration-150 ' +
                        (i < strength.score ? strengthColors[strength.score] : 'bg-[#1E1E2E]')
                      }
                    />
                  ))}
                </div>
                <span className="text-[11.5px] text-slate-500">{strength.label}</span>
              </div>
            )}
          </div>
          <PwField
            id="confirm-pw"
            label="Confirm new password"
            value={values.confirm}
            show={show}
            onShowToggle={() => setShow((v) => !v)}
            onChange={(v) => setValues((vs) => ({ ...vs, confirm: v }))}
            error={mismatch ? 'Passwords don\'t match.' : undefined}
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#1A1A24] pt-4">
          <p
            className={
              'text-[12px] transition-opacity duration-150 ' +
              (submitted === 'saved'
                ? 'text-emerald-300 opacity-100'
                : 'text-slate-500 opacity-0')
            }
            role="status"
            aria-live="polite"
          >
            Password updated.
          </p>
          <button
            type="submit"
            disabled={!canSubmit}
            className={
              'inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[12.5px] font-medium text-white ' +
              'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.55)] ' +
              'transition-colors duration-150 hover:bg-violet-500 ' +
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-violet-600'
            }
          >
            <Lock className="h-3.5 w-3.5" strokeWidth={1.8} />
            Update password
          </button>
        </div>
      </form>

      {/* 2FA card */}
      <section className="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 p-5 backdrop-blur-xl">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className={
                'flex h-9 w-9 items-center justify-center rounded-lg border border-[#1E1E2E] bg-[#16161F] ' +
                (security.twoFactorEnabled ? 'text-emerald-300' : 'text-slate-500')
              }
              aria-hidden
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-slate-100">
                Two-factor authentication
              </h2>
              <p className="mt-0.5 text-[12.5px] text-slate-400">
                Require an authenticator code in addition to your password at sign-in.
              </p>
            </div>
          </div>
          <Switch
            checked={security.twoFactorEnabled}
            onChange={(next) => onTwoFactorToggle?.(next)}
            label="Two-factor authentication"
          />
        </header>
        <div className="border-t border-[#1A1A24] pt-4">
          <button
            type="button"
            onClick={onSetUp2FAClick}
            disabled={!security.twoFactorEnabled}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#1E1E2E] bg-[#0F0F18] px-3 py-1.5 text-[12.5px] text-slate-300 transition-colors duration-150 hover:border-violet-500/30 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[#1E1E2E] disabled:hover:text-slate-300"
          >
            <Smartphone className="h-3.5 w-3.5" strokeWidth={1.8} />
            {security.twoFactorEnabled ? 'Set up authenticator' : 'Enable 2FA first'}
          </button>
        </div>
      </section>
    </div>
  )
}

function PwField({
  id,
  label,
  value,
  show,
  onShowToggle,
  onChange,
  placeholder,
  error,
}: {
  id: string
  label: string
  value: string
  show: boolean
  onShowToggle: () => void
  onChange: (v: string) => void
  placeholder?: string
  error?: string
}) {
  const hasError = !!error
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12.5px] font-medium text-slate-300">
        {label}
      </label>
      <div
        className={
          'relative rounded-lg border bg-[#0A0A0F] transition-all duration-150 ' +
          (hasError
            ? 'border-rose-500/60 shadow-[0_0_0_3px_rgba(244,63,94,0.12)]'
            : 'border-[#1E1E2E] focus-within:border-violet-500/50 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]')
        }
      >
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          <Lock className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={id === 'current-pw' ? 'current-password' : 'new-password'}
          value={value}
          placeholder={placeholder ?? '••••••••'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full bg-transparent pl-10 pr-11 text-[14px] text-slate-100 placeholder:text-slate-600 outline-none"
        />
        <button
          type="button"
          onClick={onShowToggle}
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-300"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hasError && (
        <p className="mt-1 text-[11.5px] text-rose-300">{error}</p>
      )}
    </div>
  )
}

function formatLong(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}
