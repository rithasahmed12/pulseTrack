import type {
	DetailedProfile,
	Platform,
	PostTypeSlice,
	ProfilePost,
	QuickStat,
	TimePoint
} from '@pulsetrack/shared-types';
import { api } from './client';

interface ApiCallOptions {
	jwt: string;
	fetch?: typeof fetch;
}

export interface ProfileDetailResponse {
	profile: DetailedProfile;
	isTracked: boolean;
	engagementSeries: TimePoint[];
	followerSeries: TimePoint[];
	postTypeBreakdown: PostTypeSlice[];
	recentPosts: ProfilePost[];
	topPost: ProfilePost | null;
	quickStats: QuickStat[];
}

export function getProfileDetail(
	platform: Platform,
	username: string,
	opts: ApiCallOptions
): Promise<ProfileDetailResponse> {
	return api(`/profile-detail/${platform}/${encodeURIComponent(username)}`, {
		method: 'GET',
		jwt: opts.jwt,
		fetch: opts.fetch
	});
}
