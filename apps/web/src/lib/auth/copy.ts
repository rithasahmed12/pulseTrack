import type {
	AuthFormCopy,
	BrandCopy,
	BrandStat,
	LegalLinks,
	Quote,
	SocialProvider
} from './types';

export const AUTH_BRAND: BrandCopy = {
	name: 'PulseTrack',
	tagline: 'Cross-platform social intelligence.',
	supporting: 'One workspace for Instagram and TikTok signal.'
};

export const AUTH_QUOTE: Quote = {
	text: "PulseTrack changed how our studio reads momentum on socials. We catch trends weeks before any industry report — and we stopped switching between two dashboards to do it.",
	attribution: 'Lena Karpov',
	role: 'Trends Director, Meridian Studio'
};

export const AUTH_STATS: BrandStat[] = [
	{ label: 'Profiles tracked', value: '12,400+' },
	{ label: 'Posts indexed daily', value: '2.1M' }
];

export const LOGIN_COPY: AuthFormCopy = {
	title: 'Welcome back',
	subtitle: "Sign in to keep an eye on what's trending across your tracked profiles.",
	submitLabel: 'Sign in',
	loadingLabel: 'Signing in…',
	footerPrompt: "Don't have an account?",
	footerLink: 'Create one'
};

export const SIGNUP_COPY: AuthFormCopy = {
	title: 'Create your workspace',
	subtitle: 'Set up PulseTrack in under a minute — add your first tracked profile right after.',
	submitLabel: 'Create account',
	loadingLabel: 'Creating account…',
	footerPrompt: 'Already have an account?',
	footerLink: 'Sign in'
};

export const SOCIAL_PROVIDERS: SocialProvider[] = [
	{ id: 'google', label: 'Continue with Google' },
	{ id: 'apple', label: 'Continue with Apple' }
];

export const LEGAL_LINKS: LegalLinks = {
	termsUrl: '/legal/terms',
	privacyUrl: '/legal/privacy'
};
