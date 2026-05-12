export type SocialProviderId = 'google' | 'apple'

export interface SocialProvider {
  id: SocialProviderId
  label: string
}

export interface BrandCopy {
  name: string
  tagline: string
  supporting: string
}

export interface BrandStat {
  label: string
  value: string
}

export interface Quote {
  text: string
  attribution: string
  role: string
}

export interface AuthFormCopy {
  title: string
  subtitle: string
  submitLabel: string
  loadingLabel: string
  footerPrompt: string
  footerLink: string
}

export interface LegalLinks {
  termsUrl: string
  privacyUrl: string
}

export interface AuthSectionData {
  brand: BrandCopy
  quote: Quote
  stats: BrandStat[]
  login: AuthFormCopy
  signup: AuthFormCopy
  socialProviders: SocialProvider[]
  legal: LegalLinks
}

export interface LoginFormValues {
  email: string
  password: string
  remember: boolean
}

export interface SignupFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export type FormErrors<T> = Partial<Record<keyof T, string>>
