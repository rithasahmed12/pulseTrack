import { useEffect, type ReactNode } from 'react'
import { AuthBranding, type AuthBrandingProps } from './AuthBranding'

export interface AuthLayoutProps {
  branding: AuthBrandingProps
  children: ReactNode
}

export function AuthLayout({ branding, children }: AuthLayoutProps) {
  useEffect(() => {
    const hrefs = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap',
    ]
    for (const href of hrefs) {
      if (document.querySelector(`link[href="${href}"]`)) continue
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      document.head.appendChild(link)
    }
  }, [])

  return (
    <div
      className="dark min-h-screen bg-[#0A0A0F] text-slate-200 lg:h-screen lg:overflow-hidden"
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        fontFeatureSettings: '"ss01", "cv11"',
        ['--font-mono' as string]:
          '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
      }}
    >
      <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-2">
        {/* Brand panel — banner on mobile, full panel on desktop */}
        <div className="relative h-auto min-h-[260px] border-b border-[#1A1A24] lg:h-full lg:min-h-0 lg:border-b-0 lg:border-r">
          <AuthBranding {...branding} />
        </div>

        {/* Form panel */}
        <div className="relative flex h-auto items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:h-full lg:overflow-y-auto lg:py-12">
          <div className="w-full max-w-[400px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
