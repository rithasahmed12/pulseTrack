import { error, fail, redirect } from '@sveltejs/kit';
import type { Platform } from '@pulsetrack/shared-types';
import { ApiError } from '$lib/api/client';
import { getProfileDetail } from '$lib/api/profile-detail';
import { addTrackedAccount, removeTrackedAccount } from '$lib/api/tracked-accounts';
import type { Actions, PageServerLoad } from './$types';

function assertPlatform(value: string): Platform {
	if (value === 'instagram' || value === 'tiktok') return value;
	throw error(404, 'Unknown platform');
}

export const load: PageServerLoad = async ({ locals, fetch, params }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw error(401, 'Not signed in');
	const platform = assertPlatform(params.platform);
	const username = params.username;

	try {
		const detail = await getProfileDetail(platform, username, {
			jwt: session.access_token,
			fetch
		});
		return { detail, platform, username };
	} catch (err) {
		if (err instanceof ApiError) throw error(err.status, err.message);
		throw err;
	}
};

export const actions: Actions = {
	track: async ({ request, locals, fetch, params }) => {
		const { session } = await locals.safeGetSession();
		if (!session) throw error(401, 'Not signed in');
		const platform = assertPlatform(params.platform);
		const data = await request.formData();
		const username = (data.get('username') as string | null) ?? params.username;
		try {
			await addTrackedAccount({ input: `@${username}`, platform }, { jwt: session.access_token, fetch });
			return { action: 'track', ok: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { action: 'track', error: err.message });
			throw err;
		}
	},

	remove: async ({ request, locals, fetch }) => {
		const { session } = await locals.safeGetSession();
		if (!session) throw error(401, 'Not signed in');
		const data = await request.formData();
		const id = (data.get('id') as string | null) ?? '';
		if (!id) return fail(400, { action: 'remove', error: 'Missing id.' });
		try {
			await removeTrackedAccount(id, { jwt: session.access_token, fetch });
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { action: 'remove', error: err.message });
			throw err;
		}
		throw redirect(303, '/tracked');
	}
};
