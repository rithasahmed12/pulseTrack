import { error, fail } from '@sveltejs/kit';
import {
	addTrackedAccount,
	listTrackedAccounts,
	pauseTrackedAccount,
	removeTrackedAccount,
	resumeTrackedAccount,
	triggerScrape
} from '$lib/api/tracked-accounts';
import { ApiError } from '$lib/api/client';
import type { Platform } from '@pulsetrack/shared-types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw error(401, 'Not signed in');
	try {
		const profiles = await listTrackedAccounts({ jwt: session.access_token, fetch });
		return { profiles };
	} catch (err) {
		if (err instanceof ApiError) {
			throw error(err.status, err.message);
		}
		throw err;
	}
};

const PLATFORM_VALUES = new Set<Platform>(['instagram', 'tiktok']);

function readPlatform(value: FormDataEntryValue | null): Platform | undefined {
	if (typeof value !== 'string') return undefined;
	return PLATFORM_VALUES.has(value as Platform) ? (value as Platform) : undefined;
}

async function requireJwt(locals: App.Locals): Promise<string> {
	const { session } = await locals.safeGetSession();
	if (!session) throw error(401, 'Not signed in');
	return session.access_token;
}

export const actions: Actions = {
	add: async ({ request, locals, fetch }) => {
		const jwt = await requireJwt(locals);
		const data = await request.formData();
		const input = (data.get('input') as string | null)?.trim() ?? '';
		const platform = readPlatform(data.get('platform'));

		if (!input) {
			return fail(400, { action: 'add', error: 'Enter a URL or @username.', input, platform });
		}

		try {
			await addTrackedAccount({ input, platform }, { jwt, fetch });
			return { action: 'add', ok: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { action: 'add', error: err.message, input, platform });
			}
			throw err;
		}
	},

	scrape: async ({ request, locals, fetch }) => {
		const jwt = await requireJwt(locals);
		const data = await request.formData();
		const id = (data.get('id') as string | null) ?? '';
		if (!id) return fail(400, { action: 'scrape', error: 'Missing id.' });
		try {
			await triggerScrape(id, { jwt, fetch });
			return { action: 'scrape', ok: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { action: 'scrape', error: err.message });
			throw err;
		}
	},

	pause: async ({ request, locals, fetch }) => {
		const jwt = await requireJwt(locals);
		const data = await request.formData();
		const id = (data.get('id') as string | null) ?? '';
		const next = data.get('nextIsActive') === 'true';
		if (!id) return fail(400, { action: 'pause', error: 'Missing id.' });
		try {
			if (next) await resumeTrackedAccount(id, { jwt, fetch });
			else await pauseTrackedAccount(id, { jwt, fetch });
			return { action: 'pause', ok: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { action: 'pause', error: err.message });
			throw err;
		}
	},

	remove: async ({ request, locals, fetch }) => {
		const jwt = await requireJwt(locals);
		const data = await request.formData();
		const id = (data.get('id') as string | null) ?? '';
		if (!id) return fail(400, { action: 'remove', error: 'Missing id.' });
		try {
			await removeTrackedAccount(id, { jwt, fetch });
			return { action: 'remove', ok: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { action: 'remove', error: err.message });
			throw err;
		}
	}
};
