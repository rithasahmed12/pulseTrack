import { error } from '@sveltejs/kit';
import type { TimeRange } from '@pulsetrack/shared-types';
import { ApiError } from '$lib/api/client';
import {
	getDashboardActivity,
	getDashboardStats,
	getDashboardTopPosts
} from '$lib/api/dashboard';
import type { PageServerLoad } from './$types';

function parseRange(value: string | null): TimeRange {
	if (value === '24h' || value === '7d' || value === '30d') return value;
	return '7d';
}

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) throw error(401, 'Not signed in');
	const range = parseRange(url.searchParams.get('range'));

	try {
		const [statsRes, postsRes, activityRes] = await Promise.all([
			getDashboardStats(range, { jwt: session.access_token, fetch }),
			getDashboardTopPosts(range, { jwt: session.access_token, fetch }),
			getDashboardActivity({ jwt: session.access_token, fetch })
		]);
		return {
			range,
			stats: statsRes.stats,
			currentUser: statsRes.user,
			topPosts: postsRes.posts,
			activity: activityRes.events,
			userId: user.id
		};
	} catch (err) {
		if (err instanceof ApiError) throw error(err.status, err.message);
		throw err;
	}
};
