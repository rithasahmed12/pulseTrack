import type { Platform, TrackedProfile } from '@pulsetrack/shared-types';
import { api } from './client';

interface ApiCallOptions {
	jwt: string;
	fetch?: typeof fetch;
}

export function listTrackedAccounts(opts: ApiCallOptions): Promise<TrackedProfile[]> {
	return api<TrackedProfile[]>('/tracked-accounts', {
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
