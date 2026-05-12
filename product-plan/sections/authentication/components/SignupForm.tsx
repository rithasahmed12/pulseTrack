import { useMemo, useState, type FormEvent } from 'react'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { SocialAuthButtons } from './SocialAuthButtons'
import { Field, Checkbox, SubmitButton } from './LoginForm'
import type {
  AuthFormCopy,
  FormErrors,
  LegalLinks,
  SignupFormValues,
  SocialProvider,
  SocialProviderId,
} from '../types'

export interface SignupFormProps {
  copy: AuthFormCopy
  providers: SocialProvider[]
  legal: LegalLinks
  initialValues?: Partial<SignupFormValues>
  onSubmit?: (values: SignupFormValues) => void | Promise<void>
  onSwitchToLogin?: () => void
  onProviderClick?: (id: SocialProviderId) => void
}

const DEFAULTS: SignupFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
}

function validate(values: SignupFormValues): FormErrors<SignupFormValues> {
  const errors: FormErrors<SignupFormValues> = {}
  if (!values.name.trim()) errors.name = 'What should we call you?'
  if (!values.email) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (!values.password) errors.password = 'Password is required.'
  else if (values.password.length < 8) errors.password = 'At least 8 characters.'
  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password.'
  else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords don’t match.'
  if (!values.acceptTerms) errors.acceptTerms = 'Please accept the terms.'
  return errors
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

export function SignupForm({
  copy,
  providers,
  legal,
  initialValues,
  onSubmit,
  onSwitchToLogin,
  onProviderClick,
}: SignupFormProps) {
  const [values, setValues] = useState<SignupFormValues>({ ...DEFAULTS, ...initialValues })
  const [errors, setErrors] = useState<FormErrors<SignupFormValues>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof SignupFormValues, boolean>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const strength = useMemo(() => scorePassword(values.password), [values.password])

  function setField<K extends keyof SignupFormValues>(key: K, value: SignupFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    if (touched[key]) {
      setErrors(validate({ ...values, [key]: value }))
    }
  }
  function markTouched(key: keyof SignupFormValues) {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors(validate(values))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true,
    })
    if (Object.keys(nextErrors).length > 0) return
    setSubmitting(true)
    try {
      await onSubmit?.(values)
    } finally {
      setSubmitting(false)
    }
  }

  const strengthColors = [
    'bg-slate-700',
    'bg-rose-500',
    'bg-amber-500',
    'bg-cyan-500',
    'bg-emerald-500',
  ]

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
        id="name"
        label="Display name"
        icon={<User className="h-4 w-4" />}
        error={touched.name ? errors.name : undefined}
      >
        <input
          id="name"
          type="text"
          autoComplete="name"
          disabled={submitting}
          value={values.name}
          placeholder="Alex Morgan"
          onChange={(e) => setField('name', e.target.value)}
          onBlur={() => markTouched('name')}
          className="h-10 w-full bg-transparent pl-10 pr-3 text-[14px] text-slate-100 placeholder:text-slate-600 outline-none"
        />
      </Field>

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

      <div>
        <Field
          id="password"
          label="Password"
          icon={<Lock className="h-4 w-4" />}
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
            autoComplete="new-password"
            disabled={submitting}
            value={values.password}
            placeholder="At least 8 characters"
            onChange={(e) => setField('password', e.target.value)}
            onBlur={() => markTouched('password')}
            className="h-10 w-full bg-transparent pl-10 pr-11 text-[14px] text-slate-100 placeholder:text-slate-600 outline-none"
          />
        </Field>
        {values.password.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={
                    'h-1 flex-1 rounded-full transition-colors duration-200 ' +
                    (i < strength.score ? strengthColors[strength.score] : 'bg-[#1E1E2E]')
                  }
                />
              ))}
            </div>
            <span className="text-[11.5px] text-slate-500">
              {strength.label}
            </span>
          </div>
        )}
      </div>

      <Field
        id="confirmPassword"
        label="Confirm password"
        icon={<Lock className="h-4 w-4" />}
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
      >
        <input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          disabled={submitting}
          value={values.confirmPassword}
          placeholder="Re-enter your password"
          onChange={(e) => setField('confirmPassword', e.target.value)}
          onBlur={() => markTouched('confirmPassword')}
          className="h-10 w-full bg-transparent pl-10 pr-3 text-[14px] text-slate-100 placeholder:text-slate-600 outline-none"
        />
      </Field>

      <label className="flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-snug text-slate-300">
        <span className="mt-[2px]">
          <Checkbox
            checked={values.acceptTerms}
            disabled={submitting}
            onChange={(v) => {
              setField('acceptTerms', v)
              markTouched('acceptTerms')
            }}
          />
        </span>
        <span>
          I agree to PulseTrack's{' '}
          <a href={legal.termsUrl} className="font-medium text-violet-300 hover:text-violet-200">
            Terms
          </a>{' '}
          and{' '}
          <a href={legal.privacyUrl} className="font-medium text-violet-300 hover:text-violet-200">
            Privacy Policy
          </a>
          .
        </span>
      </label>
      {touched.acceptTerms && errors.acceptTerms && (
        <p className="-mt-2 text-[11.5px] text-rose-300">{errors.acceptTerms}</p>
      )}

      <SubmitButton
        submitting={submitting}
        idleLabel={copy.submitLabel}
        loadingLabel={copy.loadingLabel}
      />

      <p className="pt-1 text-center text-[13px] text-slate-400">
        {copy.footerPrompt}{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-violet-300 hover:text-violet-200"
        >
          {copy.footerLink}
        </button>
      </p>
    </form>
  )
}
