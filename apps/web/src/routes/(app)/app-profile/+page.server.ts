import { error, fail } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';
import { getAppProfile, updateAppProfile } from '$lib/api/app-profile';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw error(401, 'Not signed in');
	try {
		const profile = await getAppProfile({ jwt: session.access_token, fetch });
		return { profile };
	} catch (err) {
		if (err instanceof ApiError) throw error(err.status, err.message);
		throw err;
	}
};

export const actions: Actions = {
	save: async ({ request, locals, fetch }) => {
		const { session } = await locals.safeGetSession();
		if (!session) throw error(401, 'Not signed in');
		const data = await request.formData();
		const displayName = data.get('displayName');
		const bio = data.get('bio');
		const avatarUrl = data.get('avatarUrl');

		const patch: { displayName?: string; bio?: string; avatarUrl?: string } = {};
		if (typeof displayName === 'string') patch.displayName = displayName.slice(0, 40);
		if (typeof bio === 'string') patch.bio = bio.slice(0, 280);
		if (typeof avatarUrl === 'string') patch.avatarUrl = avatarUrl;

		try {
			const user = await updateAppProfile(patch, { jwt: session.access_token, fetch });
			return { action: 'save', ok: true, user };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { action: 'save', error: err.message });
			throw err;
		}
	}
};
