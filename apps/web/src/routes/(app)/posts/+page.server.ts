import { error } from '@sveltejs/kit';
import type {
	DateRange,
	PostsPlatformFilter,
	PostType,
	PostTypeFilter
} from '@pulsetrack/shared-types';
import { ApiError } from '$lib/api/client';
import { listPosts, getPost } from '$lib/api/posts';
import type { PageServerLoad } from './$types';

const POST_TYPE_VALUES: PostTypeFilter[] = ['all', 'photo', 'video', 'carousel', 'reel'];
const PLATFORM_VALUES: PostsPlatformFilter[] = ['both', 'instagram', 'tiktok'];
const DATE_RANGE_VALUES: DateRange[] = ['24h', '7d', '30d', '90d'];

function parsePostType(value: string | null): PostTypeFilter {
	return value && POST_TYPE_VALUES.includes(value as PostTypeFilter)
		? (value as PostTypeFilter)
		: 'all';
}
function parsePlatform(value: string | null): PostsPlatformFilter {
	return value && PLATFORM_VALUES.includes(value as PostsPlatformFilter)
		? (value as PostsPlatformFilter)
		: 'both';
}
function parseDateRange(value: string | null): DateRange {
	return value && DATE_RANGE_VALUES.includes(value as DateRange)
		? (value as DateRange)
		: '30d';
}
function parseMinEngagement(value: string | null): number {
	if (!value) return 0;
	const n = Number(value);
	if (Number.isNaN(n)) return 0;
	return Math.max(0, Math.min(10, n));
}
function dateRangeIso(range: DateRange): string {
	const MS = {
		'24h': 24 * 60 * 60 * 1000,
		'7d': 7 * 24 * 60 * 60 * 1000,
		'30d': 30 * 24 * 60 * 60 * 1000,
		'90d': 90 * 24 * 60 * 60 * 1000
	} as const;
	return new Date(Date.now() - MS[range]).toISOString();
}

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw error(401, 'Not signed in');

	const postType = parsePostType(url.searchParams.get('postType'));
	const platform = parsePlatform(url.searchParams.get('platform'));
	const dateRange = parseDateRange(url.searchParams.get('dateRange'));
	const minEngagement = parseMinEngagement(url.searchParams.get('minEng'));
	const requestedPostId = url.searchParams.get('postId');

	try {
		const list = await listPosts(
			{
				type: postType,
				platform,
				dateFrom: dateRangeIso(dateRange),
				minEngagement,
				page: 1,
				limit: 24,
				sortBy: 'posted-at'
			},
			{ jwt: session.access_token, fetch }
		);

		let openPost: typeof list.posts[number] | null = null;
		if (requestedPostId) {
			try {
				openPost = await getPost(requestedPostId, { jwt: session.access_token, fetch });
			} catch {
				openPost = null;
			}
		}

		return {
			posts: list.posts,
			pagination: list.pagination,
			filters: { postType, platform, dateRange, minEngagement },
			openPost
		};
	} catch (err) {
		if (err instanceof ApiError) throw error(err.status, err.message);
		throw err;
	}
};

export type LoadedFilters = {
	postType: PostTypeFilter;
	platform: PostsPlatformFilter;
	dateRange: DateRange;
	minEngagement: number;
};

export type { DateRange, PostType, PostsPlatformFilter, PostTypeFilter };
