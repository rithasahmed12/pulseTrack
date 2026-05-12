import type {
  BrandCopy,
  BrandStat,
  Quote,
} from '../types'

export interface AuthBrandingProps {
  brand: BrandCopy
  quote: Quote
  stats: BrandStat[]
}

export function AuthBranding({ brand, quote, stats }: AuthBrandingProps) {
  return (
    <div className="relative h-full overflow-hidden bg-[#08080C]">
      {/* Single very subtle decoration — confined to top-right, no animation */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(241,245,249,0.045) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          maskImage:
            'radial-gradient(circle at 100% 0%, black 0%, black 30%, transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(circle at 100% 0%, black 0%, black 30%, transparent 70%)',
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-8 sm:p-10 lg:p-12">
        {/* Wordmark */}
        <div className="flex items-center gap-3">
          <span
            className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 ring-1 ring-inset ring-violet-500/30"
            aria-hidden
          >
            <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
          </span>
          <div className="leading-tight">
            <p className="text-[14px] font-semibold tracking-tight text-slate-100">
              {brand.name}
            </p>
            <p className="text-[11px] text-slate-500">{brand.supporting}</p>
          </div>
        </div>

        {/* Pull-quote */}
        <figure className="my-10 max-w-[460px]">
          <div className="flex gap-5">
            <span
              aria-hidden
              className="mt-[10px] h-7 w-[2px] shrink-0 rounded-full bg-violet-500/60"
            />
            <div>
              <blockquote className="text-[20px] font-medium leading-[1.45] tracking-tight text-slate-100 sm:text-[22px] lg:text-[24px]">
                {quote.text}
              </blockquote>
              <figcaption className="mt-4 text-[12.5px] leading-snug text-slate-400">
                <span className="font-medium text-slate-200">
                  {quote.attribution}
                </span>
                <span className="text-slate-500"> · {quote.role}</span>
              </figcaption>
            </div>
          </div>
        </figure>

        {/* Bottom strip */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-500">
            {stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                {i > 0 && (
                  <span
                    aria-hidden
                    className="hidden h-1 w-1 rounded-full bg-slate-700 sm:inline-block"
                  />
                )}
                <span>
                  <span className="font-medium text-slate-300 tabular-nums">
                    {s.value}
                  </span>{' '}
                  {s.label.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} PulseTrack · Built for trend researchers
          </p>
        </div>
      </div>
    </div>
  )
}
