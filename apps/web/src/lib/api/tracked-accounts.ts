import type {
	Pagination,
	Platform,
	PlatformFilter,
	SortOption,
	TrackedProfile
} from '@pulsetrack/shared-types';
import { api } from './client';

interface ApiCallOptions {
	jwt: string;
	fetch?: typeof fetch;
}

export interface TrackedAccountsQuery {
	page?: number;
	limit?: number;
	platform?: PlatformFilter;
	q?: string;
	sort?: SortOption;
}

export interface TrackedAccountsListResponse {
	profiles: TrackedProfile[];
	pagination: Pagination;
}

export function listTrackedAccounts(
	query: TrackedAccountsQuery,
	opts: ApiCallOptions
): Promise<TrackedAccountsListResponse> {
	const params = new URLSearchParams();
	if (query.page) params.set('page', String(query.page));
	if (query.limit) params.set('limit', String(query.limit));
	if (query.platform && query.platform !== 'all') params.set('platform', query.platform);
	if (query.q) params.set('q', query.q);
	if (query.sort) params.set('sort', query.sort);
	const path = params.toString()
		? `/tracked-accounts?${params.toString()}`
		: '/tracked-accounts';
	return api<TrackedAccountsListResponse>(path, {
		method: 'GET',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function addTrackedAccount(
	body: { input: string; platform?: Platform },
	opts: ApiCallOptions
): Promise<TrackedProfile> {
	return api<TrackedProfile>('/tracked-accounts', {
		method: 'POST',
		body,
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function removeTrackedAccount(id: string, opts: ApiCallOptions): Promise<void> {
	return api<void>(`/tracked-accounts/${id}`, {
		method: 'DELETE',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function purgeTrackedAccount(id: string, opts: ApiCallOptions): Promise<void> {
	return api<void>(`/tracked-accounts/${id}/permanent`, {
		method: 'DELETE',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function triggerScrape(
	id: string,
	opts: ApiCallOptions
): Promise<{ jobId: string | null }> {
	return api<{ jobId: string | null }>(`/tracked-accounts/${id}/scrape`, {
		method: 'POST',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function pauseTrackedAccount(id: string, opts: ApiCallOptions): Promise<TrackedProfile> {
	return api<TrackedProfile>(`/tracked-accounts/${id}/pause`, {
		method: 'POST',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function resumeTrackedAccount(id: string, opts: ApiCallOptions): Promise<TrackedProfile> {
	return api<TrackedProfile>(`/tracked-accounts/${id}/resume`, {
		method: 'POST',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}
