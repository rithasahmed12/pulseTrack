import type { LayoutServerLoad } from './$types';

export interface AppProfileSnapshot {
	displayName: string | null;
	avatarUrl: string | null;
	bio: string | null;
}

interface ProfileRow {
	display_name: string | null;
	avatar_url: string | null;
	bio: string | null;
}

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) {
		return { session, user, profile: null as AppProfileSnapshot | null };
	}

	const { data } = await locals.supabase
		.from('profiles')
		.select('display_name, avatar_url, bio')
		.eq('id', user.id)
		.maybeSingle<ProfileRow>();

	const profile: AppProfileSnapshot | null = data
		? {
				displayName: data.display_name,
				avatarUrl: data.avatar_url,
				bio: data.bio
			}
		: null;

	return { session, user, profile };
};
