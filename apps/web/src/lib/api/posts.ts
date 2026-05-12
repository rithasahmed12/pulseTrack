import type {
	Pagination,
	Post,
	PostType,
	PostsPlatformFilter,
	PostTypeFilter
} from '@pulsetrack/shared-types';
import { api } from './client';

interface ApiCallOptions {
	jwt: string;
	fetch?: typeof fetch;
}

export interface ListPostsQuery {
	type?: PostTypeFilter;
	platform?: PostsPlatformFilter;
	dateFrom?: string;
	dateTo?: string;
	minEngagement?: number;
	page?: number;
	limit?: number;
	sortBy?: 'engagement' | 'posted-at' | 'likes';
}

export interface PostsListResponse {
	posts: Post[];
	pagination: Pagination;
}

export function listPosts(
	query: ListPostsQuery,
	opts: ApiCallOptions
): Promise<PostsListResponse> {
	const params = new URLSearchParams();
	if (query.type && query.type !== 'all') params.set('type', query.type);
	if (query.platform && query.platform !== 'both') params.set('platform', query.platform);
	if (query.dateFrom) params.set('dateFrom', query.dateFrom);
	if (query.dateTo) params.set('dateTo', query.dateTo);
	if (typeof query.minEngagement === 'number' && query.minEngagement > 0) {
		params.set('minEngagement', String(query.minEngagement));
	}
	if (query.page) params.set('page', String(query.page));
	if (query.limit) params.set('limit', String(query.limit));
	if (query.sortBy) params.set('sortBy', query.sortBy);
	const qs = params.toString();
	return api(`/posts${qs ? `?${qs}` : ''}`, {
		method: 'GET',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function getPost(id: string, opts: ApiCallOptions): Promise<Post> {
	return api(`/posts/${id}`, { method: 'GET', jwt: opts.jwt, fetch: opts.fetch });
}

export type { PostType };
