export interface SwitchProps {
  checked: boolean
  onChange?: (next: boolean) => void
  disabled?: boolean
  label?: string
}

export function Switch({ checked, onChange, disabled = false, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 ' +
        (checked
          ? 'bg-violet-500/85 shadow-[inset_0_0_0_1px_rgba(124,58,237,0.4),0_0_12px_-2px_rgba(124,58,237,0.6)]'
          : 'bg-[#1E1E2E]') +
        ' disabled:cursor-not-allowed disabled:opacity-50'
      }
    >
      <span
        aria-hidden
        className={
          'inline-block h-3.5 w-3.5 rounded-full bg-slate-50 shadow transition-transform duration-150 ' +
          (checked ? 'translate-x-[18px]' : 'translate-x-[3px]')
        }
      />
    </button>
  )
}
