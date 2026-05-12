import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { SocialAuthButtons } from './SocialAuthButtons'
import type {
  AuthFormCopy,
  FormErrors,
  LoginFormValues,
  SocialProvider,
  SocialProviderId,
} from '../types'

export interface LoginFormProps {
  copy: AuthFormCopy
  providers: SocialProvider[]
  initialValues?: Partial<LoginFormValues>
  onSubmit?: (values: LoginFormValues) => void | Promise<void>
  onForgotPassword?: () => void
  onSwitchToSignup?: () => void
  onProviderClick?: (id: SocialProviderId) => void
}

const DEFAULTS: LoginFormValues = {
  email: '',
  password: '',
  remember: true,
}

function validate(values: LoginFormValues): FormErrors<LoginFormValues> {
  const errors: FormErrors<LoginFormValues> = {}
  if (!values.email) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (!values.password) errors.password = 'Password is required.'
  else if (values.password.length < 8) errors.password = 'At least 8 characters.'
  return errors
}

export function LoginForm({
  copy,
  providers,
  initialValues,
  onSubmit,
  onForgotPassword,
  onSwitchToSignup,
  onProviderClick,
}: LoginFormProps) {
  const [values, setValues] = useState<LoginFormValues>({ ...DEFAULTS, ...initialValues })
  const [errors, setErrors] = useState<FormErrors<LoginFormValues>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof LoginFormValues, boolean>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function setField<K extends keyof LoginFormValues>(key: K, value: LoginFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    if (touched[key]) {
      setErrors(validate({ ...values, [key]: value }))
    }
  }

  function markTouched(key: keyof LoginFormValues) {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors(validate(values))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setTouched({ email: true, password: true, remember: true })
    if (Object.keys(nextErrors).length > 0) return
    setSubmitting(true)
    try {
      await onSubmit?.(values)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="mb-2">
        <h2 className="text-[22px] font-semibold leading-tight tracking-tight text-slate-50">
          {copy.title}
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-snug text-slate-400">
          {copy.subtitle}
        </p>
      </div>

      <SocialAuthButtons
        providers={providers}
        disabled={submitting}
        onProviderClick={onProviderClick}
      />

      <div className="relative py-1">
        <div aria-hidden className="absolute inset-0 flex items-center">
          <div className="h-px w-full bg-[#1A1A24]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#0A0A0F] px-3 text-[12px] text-slate-500">
            or
          </span>
        </div>
      </div>

      <Field
        id="email"
        label="Email"
        icon={<Mail className="h-4 w-4" />}
        error={touched.email ? errors.email : undefined}
      >
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          disabled={submitting}
          value={values.email}
          placeholder="you@studio.co"
          onChange={(e) => setField('email', e.target.value)}
          onBlur={() => markTouched('email')}
          className="h-10 w-full bg-transparent pl-10 pr-3 text-[14px] text-slate-100 placeholder:text-slate-600 outline-none"
        />
      </Field>

      <Field
        id="password"
        label="Password"
        icon={<Lock className="h-4 w-4" />}
        action={
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[12px] text-slate-400 hover:text-violet-300"
          >
            Forgot password?
          </button>
        }
        error={touched.password ? errors.password : undefined}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-300"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      >
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          disabled={submitting}
          value={values.password}
          placeholder="••••••••"
          onChange={(e) => setField('password', e.target.value)}
          onBlur={() => markTouched('password')}
          className="h-10 w-full bg-transparent pl-10 pr-11 text-[14px] text-slate-100 placeholder:text-slate-600 outline-none"
        />
      </Field>

      <label className="flex cursor-pointer select-none items-center gap-2.5 text-[13px] text-slate-300">
        <Checkbox
          checked={values.remember}
          disabled={submitting}
          onChange={(v) => setField('remember', v)}
        />
        Keep me signed in
      </label>

      <SubmitButton submitting={submitting} idleLabel={copy.submitLabel} loadingLabel={copy.loadingLabel} />

      <p className="pt-1 text-center text-[13px] text-slate-400">
        {copy.footerPrompt}{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-medium text-violet-300 hover:text-violet-200"
        >
          {copy.footerLink}
        </button>
      </p>
    </form>
  )
}

/* ------------------------------ shared primitives ------------------------------ */

export function Field({
  id,
  label,
  icon,
  action,
  trailing,
  error,
  children,
}: {
  id: string
  label: string
  icon?: React.ReactNode
  action?: React.ReactNode
  trailing?: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  const hasError = !!error
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[12.5px] font-medium text-slate-300">
          {label}
        </label>
        {action}
      </div>
      <div
        className={
          'relative rounded-lg border bg-[#0F0F18] transition-all duration-200 ' +
          (hasError
            ? 'border-rose-500/60 shadow-[0_0_0_3px_rgba(244,63,94,0.12)]'
            : 'border-[#1E1E2E] focus-within:border-violet-500/60 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.14)]')
        }
      >
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </span>
        )}
        {children}
        {trailing}
      </div>
      {hasError && (
        <p className="flex items-center gap-1.5 text-[11.5px] text-rose-300">
          <span className="inline-block h-1 w-1 rounded-full bg-rose-400" />
          {error}
        </p>
      )}
    </div>
  )
}

export function Checkbox({
  checked,
  disabled = false,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  onChange?: (next: boolean) => void
}) {
  return (
    <span className="relative inline-flex">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={
          'flex h-4 w-4 items-center justify-center rounded-[5px] border transition-all duration-150 ' +
          (checked
            ? 'border-violet-400/60 bg-violet-500/80 shadow-[0_0_10px_-2px_rgba(124,58,237,0.6)]'
            : 'border-[#252535] bg-[#0F0F18]') +
          ' peer-disabled:opacity-50'
        }
        aria-hidden
      >
        {checked && (
          <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </span>
  )
}

export function SubmitButton({
  submitting,
  idleLabel,
  loadingLabel,
}: {
  submitting: boolean
  idleLabel: string
  loadingLabel: string
}) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className={
        'group flex h-10 w-full items-center justify-center gap-2 rounded-lg ' +
        'bg-violet-600 text-[13.5px] font-medium text-white ' +
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.5)] ' +
        'transition-colors duration-150 hover:bg-violet-500 ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] ' +
        'disabled:cursor-not-allowed disabled:opacity-70'
      }
    >
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          <span>{idleLabel}</span>
          <ArrowRight className="h-4 w-4 opacity-70" />
        </>
      )}
    </button>
  )
}
