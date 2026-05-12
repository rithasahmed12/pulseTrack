export type SocialProviderId = 'google' | 'apple';

export interface SocialProvider {
	id: SocialProviderId;
	label: string;
}

export interface BrandCopy {
	name: string;
	tagline: string;
	supporting: string;
}

export interface BrandStat {
	label: string;
	value: string;
}

export interface Quote {
	text: string;
	attribution: string;
	role: string;
}

export interface AuthFormCopy {
	title: string;
	subtitle: string;
	submitLabel: string;
	loadingLabel: string;
	footerPrompt: string;
	footerLink: string;
}

export interface LegalLinks {
	termsUrl: string;
	privacyUrl: string;
}
