import type { NotificationsResponse } from '@pulsetrack/shared-types';
import { api } from './client';

interface ApiCallOptions {
	jwt: string;
	fetch?: typeof fetch;
}

export function listNotifications(
	limit: number | undefined,
	opts: ApiCallOptions
): Promise<NotificationsResponse> {
	const path = limit ? `/notifications?limit=${limit}` : '/notifications';
	return api<NotificationsResponse>(path, {
		method: 'GET',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function getUnreadCount(opts: ApiCallOptions): Promise<{ unreadCount: number }> {
	return api<{ unreadCount: number }>('/notifications/unread-count', {
		method: 'GET',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}

export function markNotificationsRead(
	body: { ids?: string[]; all?: boolean },
	opts: ApiCallOptions
): Promise<{ unreadCount: number }> {
	return api<{ unreadCount: number }>('/notifications/mark-read', {
		method: 'POST',
		body,
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}
