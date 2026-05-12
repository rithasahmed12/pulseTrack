import type { AppUser, Connection, WorkspaceStat } from '@pulsetrack/shared-types';
import { api } from './client';

interface ApiCallOptions {
	jwt: string;
	fetch?: typeof fetch;
}

export interface AppProfileResponse {
	user: AppUser;
	stats: WorkspaceStat[];
	connections: Connection[];
}

export function getAppProfile(opts: ApiCallOptions): Promise<AppProfileResponse> {
	return api('/app-profile', { method: 'GET', jwt: opts.jwt, fetch: opts.fetch });
}

export function updateAppProfile(
	body: { displayName?: string; bio?: string; avatarUrl?: string },
	opts: ApiCallOptions
): Promise<AppUser> {
	return api('/app-profile', {
		method: 'PATCH',
		body,
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}
