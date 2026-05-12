import { error, json } from '@sveltejs/kit';
import type {
	DateRange,
	PostsPlatformFilter,
	PostTypeFilter
} from '@pulsetrack/shared-types';
import { ApiError } from '$lib/api/client';
import { listPosts } from '$lib/api/posts';
import type { RequestHandler } from './$types';

const POST_TYPE_VALUES: PostTypeFilter[] = ['all', 'photo', 'video', 'carousel', 'reel'];
const PLATFORM_VALUES: PostsPlatformFilter[] = ['both', 'instagram', 'tiktok'];
const DATE_RANGE_VALUES: DateRange[] = ['24h', '7d', '30d', '90d'];
const MS: Record<DateRange, number> = {
	'24h': 24 * 60 * 60 * 1000,
	'7d': 7 * 24 * 60 * 60 * 1000,
	'30d': 30 * 24 * 60 * 60 * 1000,
	'90d': 90 * 24 * 60 * 60 * 1000
};

export const GET: RequestHandler = async ({ locals, fetch, url }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw error(401, 'Not signed in');

	const typeParam = url.searchParams.get('postType');
	const platformParam = url.searchParams.get('platform');
	const dateParam = url.searchParams.get('dateRange');
	const minEngParam = url.searchParams.get('minEng');
	const pageParam = Number(url.searchParams.get('page') ?? '2');

	const postType: PostTypeFilter = POST_TYPE_VALUES.includes(typeParam as PostTypeFilter)
		? (typeParam as PostTypeFilter)
		: 'all';
	const platform: PostsPlatformFilter = PLATFORM_VALUES.includes(platformParam as PostsPlatformFilter)
		? (platformParam as PostsPlatformFilter)
		: 'both';
	const dateRange: DateRange = DATE_RANGE_VALUES.includes(dateParam as DateRange)
		? (dateParam as DateRange)
		: '30d';
	const minEngagement = Math.max(0, Math.min(10, Number(minEngParam ?? '0') || 0));
	const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 2;

	try {
		const result = await listPosts(
			{
				type: postType,
				platform,
				dateFrom: new Date(Date.now() - MS[dateRange]).toISOString(),
				minEngagement,
				page,
				limit: 24,
				sortBy: 'posted-at'
			},
			{ jwt: session.access_token, fetch }
		);
		return json(result);
	} catch (err) {
		if (err instanceof ApiError) throw error(err.status, err.message);
		throw err;
	}
};
