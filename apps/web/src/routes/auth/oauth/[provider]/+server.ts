import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const SUPPORTED = new Set(['google', 'apple']);

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const provider = params.provider;
	if (!SUPPORTED.has(provider)) {
		throw error(404, `Unknown provider "${provider}"`);
	}

	const redirectTo = url.searchParams.get('redirectTo') ?? '/dashboard';
	const callbackUrl = new URL('/auth/callback', url.origin);
	callbackUrl.searchParams.set('next', redirectTo);

	const { data, error: authError } = await locals.supabase.auth.signInWithOAuth({
		provider: provider as 'google' | 'apple',
		options: {
			redirectTo: callbackUrl.toString(),
			skipBrowserRedirect: true
		}
	});

	if (authError || !data?.url) {
		const loginUrl = new URL('/login', url.origin);
		loginUrl.searchParams.set(
			'error',
			authError?.message ?? `${provider} sign-in is not configured yet.`
		);
		throw redirect(303, loginUrl.toString());
	}

	throw redirect(303, data.url);
};
