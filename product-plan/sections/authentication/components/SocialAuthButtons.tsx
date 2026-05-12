import type { SocialProvider, SocialProviderId } from '../types'

export interface SocialAuthButtonsProps {
  providers: SocialProvider[]
  disabled?: boolean
  onProviderClick?: (id: SocialProviderId) => void
}

export function SocialAuthButtons({
  providers,
  disabled = false,
  onProviderClick,
}: SocialAuthButtonsProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {providers.map((p) => (
        <button
          key={p.id}
          type="button"
          disabled={disabled}
          onClick={() => onProviderClick?.(p.id)}
          className={
            'group inline-flex h-11 items-center justify-center gap-2.5 rounded-lg border border-[#1E1E2E] bg-[#0F0F18] ' +
            'px-4 text-[13px] font-medium text-slate-200 transition-all duration-200 ' +
            'hover:border-violet-500/30 hover:bg-[#13131E] hover:text-slate-50 ' +
            'disabled:cursor-not-allowed disabled:opacity-50'
          }
        >
          <ProviderIcon id={p.id} />
          <span className="truncate">{p.label}</span>
        </button>
      ))}
    </div>
  )
}

function ProviderIcon({ id }: { id: SocialProviderId }) {
  if (id === 'google') {
    return (
      <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
          fill="#FF3D00"
          d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        />
      </svg>
    )
  }
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35c-1.09-.46-2.09-.48-3.24 0c-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8c1.18-.24 2.31-.93 3.57-.84c1.51.12 2.65.72 3.4 1.8c-3.12 1.87-2.38 5.98.48 7.13c-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25c.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}
