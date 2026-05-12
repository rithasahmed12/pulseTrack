import type {
	AccentColorId,
	AppearanceState,
	NotificationPreference,
	SecurityState
} from '@pulsetrack/shared-types';
import { api } from './client';

interface ApiCallOptions {
	jwt: string;
	fetch?: typeof fetch;
}

export interface SettingsResponse {
	security: SecurityState;
	notifications: NotificationPreference[];
	appearance: AppearanceState;
}

export function getSettings(opts: ApiCallOptions): Promise<SettingsResponse> {
	return api('/settings', { method: 'GET', jwt: opts.jwt, fetch: opts.fetch });
}

export function toggleNotification(
	body: { id: string; enabled: boolean },
	opts: ApiCallOptions
): Promise<NotificationPreference[]> {
	return api('/settings/notifications', {
		method: 'PATCH',
		body,
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function updateAppearance(
	body: { accentColor?: AccentColorId; sidebarStartsCollapsed?: boolean },
	opts: ApiCallOptions
): Promise<AppearanceState> {
	return api('/settings/appearance', {
		method: 'PATCH',
		body,
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function toggleTwoFactor(
	body: { enabled: boolean },
	opts: ApiCallOptions
): Promise<SecurityState> {
	return api('/settings/two-factor', {
		method: 'PATCH',
		body,
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function changePassword(
	body: { current: string; next: string },
	opts: ApiCallOptions
): Promise<{ ok: true }> {
	return api('/settings/password', {
		method: 'POST',
		body,
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function deleteAccount(opts: ApiCallOptions): Promise<void> {
	return api('/settings/account', {
		method: 'DELETE',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}
