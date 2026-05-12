import { error, fail, redirect } from '@sveltejs/kit';
import type { AccentColorId } from '@pulsetrack/shared-types';
import { ApiError } from '$lib/api/client';
import {
	changePassword,
	deleteAccount,
	getSettings,
	toggleNotification,
	toggleTwoFactor,
	updateAppearance
} from '$lib/api/settings';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw error(401, 'Not signed in');
	try {
		const settings = await getSettings({ jwt: session.access_token, fetch });
		return { settings };
	} catch (err) {
		if (err instanceof ApiError) throw error(err.status, err.message);
		throw err;
	}
};

async function requireJwt(locals: App.Locals): Promise<string> {
	const { session } = await locals.safeGetSession();
	if (!session) throw error(401, 'Not signed in');
	return session.access_token;
}

export const actions: Actions = {
	notification: async ({ request, locals, fetch }) => {
		const jwt = await requireJwt(locals);
		const data = await request.formData();
		const id = (data.get('id') as string | null) ?? '';
		const enabled = data.get('enabled') === 'true';
		try {
			await toggleNotification({ id, enabled }, { jwt, fetch });
			return { action: 'notification', ok: true };
		} catch (err) {
			if (err instanceof ApiError)
				return fail(err.status, { action: 'notification', error: err.message });
			throw err;
		}
	},

	appearance: async ({ request, locals, fetch }) => {
		const jwt = await requireJwt(locals);
		const data = await request.formData();
		const accent = data.get('accentColor');
		const sidebar = data.get('sidebarStartsCollapsed');
		const patch: { accentColor?: AccentColorId; sidebarStartsCollapsed?: boolean } = {};
		if (
			accent === 'violet' ||
			accent === 'cyan' ||
			accent === 'rose' ||
			accent === 'amber'
		) {
			patch.accentColor = accent;
		}
		if (sidebar === 'true' || sidebar === 'false') {
			patch.sidebarStartsCollapsed = sidebar === 'true';
		}
		try {
			await updateAppearance(patch, { jwt, fetch });
			return { action: 'appearance', ok: true };
		} catch (err) {
			if (err instanceof ApiError)
				return fail(err.status, { action: 'appearance', error: err.message });
			throw err;
		}
	},

	twoFactor: async ({ request, locals, fetch }) => {
		const jwt = await requireJwt(locals);
		const data = await request.formData();
		const enabled = data.get('enabled') === 'true';
		try {
			await toggleTwoFactor({ enabled }, { jwt, fetch });
			return { action: 'twoFactor', ok: true };
		} catch (err) {
			if (err instanceof ApiError)
				return fail(err.status, { action: 'twoFactor', error: err.message });
			throw err;
		}
	},

	password: async ({ request, locals, fetch }) => {
		const jwt = await requireJwt(locals);
		const data = await request.formData();
		const current = (data.get('current') as string | null) ?? '';
		const next = (data.get('next') as string | null) ?? '';
		if (next.length < 8) {
			return fail(400, { action: 'password', error: 'New password must be at least 8 characters.' });
		}
		try {
			await changePassword({ current, next }, { jwt, fetch });
			return { action: 'password', ok: true };
		} catch (err) {
			if (err instanceof ApiError)
				return fail(err.status, { action: 'password', error: err.message });
			throw err;
		}
	},

	deleteAccount: async ({ request, locals, fetch }) => {
		const jwt = await requireJwt(locals);
		const data = await request.formData();
		const confirm = data.get('confirm');
		if (confirm !== 'DELETE') {
			return fail(400, { action: 'deleteAccount', error: 'Confirmation string did not match.' });
		}
		try {
			await deleteAccount({ jwt, fetch });
		} catch (err) {
			if (err instanceof ApiError)
				return fail(err.status, { action: 'deleteAccount', error: err.message });
			throw err;
		}
		await locals.supabase.auth.signOut();
		throw redirect(303, '/login');
	}
};
