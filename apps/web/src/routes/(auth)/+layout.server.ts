import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { session } = await locals.safeGetSession();
	if (session) {
		const next = url.searchParams.get('redirectTo') ?? '/dashboard';
		throw redirect(303, next);
	}
	return {};
};
