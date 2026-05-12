import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';
import {
	getBestTimes,
	getPlatformComparison,
	getTrendingHashtags,
	getTrendingPosts
} from '$lib/api/trending';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw error(401, 'Not signed in');

	const opts = { jwt: session.access_token, fetch };
	try {
		const [postsRes, hashtagsRes, comparisonRes, heatmap] = await Promise.all([
			getTrendingPosts(opts),
			getTrendingHashtags(opts),
			getPlatformComparison(opts),
			getBestTimes(opts)
		]);
		return {
			trendingPosts: postsRes.posts,
			trendingHashtags: hashtagsRes.hashtags,
			platformComparison: comparisonRes.series,
			heatmap
		};
	} catch (err) {
		if (err instanceof ApiError) throw error(err.status, err.message);
		throw err;
	}
};
