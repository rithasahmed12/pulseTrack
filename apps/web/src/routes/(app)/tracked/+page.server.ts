import { error, fail } from '@sveltejs/kit';
import {
	addTrackedAccount,
	listTrackedAccounts,
	pauseTrackedAccount,
	purgeTrackedAccount,
	removeTrackedAccount,
	resumeTrackedAccount,
	triggerScrape
} from '$lib/api/tracked-accounts';
import { ApiError } from '$lib/api/client';
import type { Platform, PlatformFilter, SortOption } from '@pulsetrack/shared-types';
import type { Actions, PageServerLoad } from './$types';

const PLATFORM_FILTER_VALUES: PlatformFilter[] = ['all', 'instagram', 'tiktok'];
const SORT_VALUES: SortOption[] = [
	'recently-added',
	'most-followers',
	'highest-engagement',
	'last-scraped'
];

function parsePlatformFilter(value: string | null): PlatformFilter {
	return value && PLATFORM_FILTER_VALUES.includes(value as PlatformFilter)
		? (value as PlatformFilter)
		: 'all';
}
function parseSort(value: string | null): SortOption {
	return value && SORT_VALUES.includes(value as SortOption)
		? (value as SortOption)
		: 'recently-added';
}
function parsePage(value: string | null): number {
	if (!value) return 1;
	const n = parseInt(value, 10);
	if (!Number.isFinite(n) || n < 1) return 1;
	return Math.min(n, 10000);
}

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw error(401, 'Not signed in');

	const platform = parsePlatformFilter(url.searchParams.get('platform'));
	const sort = parseSort(url.searchParams.get('sort'));
	const q = (url.searchParams.get('q') ?? '').slice(0, 200).trim();
	const page = parsePage(url.searchParams.get('page'));

	try {
		const list = await listTrackedAccounts(
			{ page, limit: 8, platform, q: q || undefined, sort },
			{ jwt: session.access_token, fetch }
		);
		return {
			profiles: list.profiles,
			pagination: list.pagination,
			filters: { platform, sort, search: q, page }
		};
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
	},

	purge: async ({ request, locals, fetch }) => {
		const jwt = await requireJwt(locals);
		const data = await request.formData();
		const id = (data.get('id') as string | null) ?? '';
		const confirm = (data.get('confirm') as string | null) ?? '';
		const expected = (data.get('expected') as string | null) ?? '';
		if (!id) return fail(400, { action: 'purge', error: 'Missing id.' });
		if (!expected || confirm !== expected) {
			return fail(400, {
				action: 'purge',
				error: 'Confirmation does not match the username — type it exactly to confirm.'
			});
		}
		try {
			await purgeTrackedAccount(id, { jwt, fetch });
			return { action: 'purge', ok: true };
		} catch (err) {
			if (err instanceof ApiError) return fail(err.status, { action: 'purge', error: err.message });
			throw err;
		}
	}
};
