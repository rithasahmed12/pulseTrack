<script lang="ts">
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { AppShell, type NavItem, type UserMenuUser } from '$lib/components/shell';
	import { createBrowserSupabase } from '$lib/supabase/client';

	let { children, data } = $props();

	const supabase = createBrowserSupabase();

	const EYEBROW_BY_PREFIX: Array<{ match: RegExp; eyebrow: string }> = [
		{ match: /^\/dashboard/, eyebrow: 'Workspace' },
		{ match: /^\/posts/, eyebrow: 'Content' },
		{ match: /^\/trending/, eyebrow: 'Insights' },
		{ match: /^\/tracked/, eyebrow: 'Workspace' },
		{ match: /^\/profile/, eyebrow: 'Profile detail' },
		{ match: /^\/app-profile/, eyebrow: 'Account' },
		{ match: /^\/settings/, eyebrow: 'Account' }
	];

	const navigationItems = $derived.by<NavItem[]>(() => {
		const path = page.url.pathname;
		const base: NavItem[] = [
			{ label: 'Dashboard', href: '/dashboard' },
			{ label: 'Posts', href: '/posts' },
			{ label: 'Trending', href: '/trending' },
			{ label: 'Tracked', href: '/tracked' },
			{ label: 'App Profile', href: '/app-profile' },
			{ label: 'Settings', href: '/settings' }
		];
		return base.map((item) => ({
			...item,
			isActive:
				item.href === '/app-profile'
					? path.startsWith('/app-profile')
					: item.href === '/tracked'
						? path.startsWith('/tracked') || path.startsWith('/profile/')
						: path.startsWith(item.href)
		}));
	});

	const user = $derived<UserMenuUser>({
		name:
			(data.user?.user_metadata?.display_name as string | undefined) ??
			data.user?.email?.split('@')[0] ??
			'Analyst',
		handle: data.user?.email ?? undefined,
		avatarUrl: data.user?.user_metadata?.avatar_url as string | undefined
	});

	const pageEyebrow = $derived(
		EYEBROW_BY_PREFIX.find((rule) => rule.match.test(page.url.pathname))?.eyebrow ?? 'Workspace'
	);

	function handleNavigate(href: string) {
		void goto(href);
	}

	async function handleLogout() {
		await supabase.auth.signOut();
		await invalidateAll();
		await goto('/login');
	}
</script>

<AppShell
	{navigationItems}
	{user}
	{pageEyebrow}
	notificationCount={0}
	onNavigate={handleNavigate}
	onLogout={handleLogout}
>
	{@render children()}
</AppShell>
