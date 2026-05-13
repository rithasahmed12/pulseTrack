import { redirect } from '@sveltejs/kit';
import type { NotificationsResponse } from '@pulsetrack/shared-types';
import { listNotifications } from '$lib/api/notifications';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url, fetch }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) {
		const redirectTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/login?redirectTo=${redirectTo}`);
	}

	let notifications: NotificationsResponse = { items: [], unreadCount: 0 };
	try {
		notifications = await listNotifications(10, { jwt: session.access_token, fetch });
	} catch {
		// Non-fatal: if the API is briefly down, render the shell anyway with zero.
	}

	return { session, user, notifications };
};
