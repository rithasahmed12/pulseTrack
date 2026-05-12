import type {
	ActivityEvent,
	DashboardStat,
	DashboardUser,
	TimeRange,
	TopPost
} from '@pulsetrack/shared-types';
import { api } from './client';

interface ApiCallOptions {
	jwt: string;
	fetch?: typeof fetch;
}

export function getDashboardStats(
	range: TimeRange,
	opts: ApiCallOptions
): Promise<{ stats: DashboardStat[]; user: DashboardUser }> {
	return api(`/dashboard/stats?range=${range}`, {
		method: 'GET',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function getDashboardTopPosts(
	range: TimeRange,
	opts: ApiCallOptions
): Promise<{ posts: TopPost[] }> {
	return api(`/dashboard/top-posts?range=${range}`, {
		method: 'GET',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function getDashboardActivity(
	opts: ApiCallOptions
): Promise<{ events: ActivityEvent[] }> {
	return api(`/dashboard/activity`, {
		method: 'GET',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}
