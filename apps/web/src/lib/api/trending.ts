import type {
	Heatmap,
	PlatformSeries,
	TrendingHashtag,
	TrendingPost
} from '@pulsetrack/shared-types';
import { api } from './client';

interface ApiCallOptions {
	jwt: string;
	fetch?: typeof fetch;
}

export function getTrendingPosts(opts: ApiCallOptions): Promise<{ posts: TrendingPost[] }> {
	return api('/trending/posts', { method: 'GET', jwt: opts.jwt, fetch: opts.fetch });
}

export function getTrendingHashtags(opts: ApiCallOptions): Promise<{ hashtags: TrendingHashtag[] }> {
	return api('/trending/hashtags', { method: 'GET', jwt: opts.jwt, fetch: opts.fetch });
}

export function getPlatformComparison(
	opts: ApiCallOptions
): Promise<{ series: PlatformSeries[] }> {
	return api('/trending/platform-comparison', {
		method: 'GET',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function getBestTimes(opts: ApiCallOptions): Promise<Heatmap> {
	return api('/trending/best-times', { method: 'GET', jwt: opts.jwt, fetch: opts.fetch });
}
