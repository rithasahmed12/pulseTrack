<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import type {
		NotificationEventType,
		NotificationItem
	} from '@pulsetrack/shared-types';
	import { AppShell, type NavItem, type UserMenuUser } from '$lib/components/shell';
	import { markNotificationsRead } from '$lib/api/notifications';
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
			{ label: 'Tracked', href: '/tracked' },
			{ label: 'Posts', href: '/posts' },
			{ label: 'Trending', href: '/trending' },
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
			data.profile?.displayName ??
			(data.user?.user_metadata?.display_name as string | undefined) ??
			data.user?.email?.split('@')[0] ??
			'Analyst',
		handle: data.user?.email ?? undefined,
		avatarUrl:
			data.profile?.avatarUrl ??
			(data.user?.user_metadata?.avatar_url as string | undefined) ??
			undefined
	});

	const pageEyebrow = $derived(
		EYEBROW_BY_PREFIX.find((rule) => rule.match.test(page.url.pathname))?.eyebrow ?? 'Workspace'
	);

	// Notification state, seeded from the server load and kept in sync via Realtime.
	// svelte-ignore state_referenced_locally
	let notifications = $state<NotificationItem[]>(data.notifications?.items ?? []);
	// svelte-ignore state_referenced_locally
	let unreadCount = $state<number>(data.notifications?.unreadCount ?? 0);

	$effect(() => {
		notifications = data.notifications?.items ?? [];
		unreadCount = data.notifications?.unreadCount ?? 0;
	});

	const NOTIFIABLE: Record<NotificationEventType, true> = {
		new_post: true,
		follower_spike: true,
		trending_hashtag: true,
		scrape_complete: true,
		scrape_failed: true
	};

	$effect(() => {
		const userId = data.user?.id;
		if (!userId) return;
		const channel = supabase
			.channel(`activity_log:${userId}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'activity_log',
					filter: `user_id=eq.${userId}`
				},
				(payload) => {
					const row = payload.new as {
						id: string;
						event_type: string;
						platform: 'instagram' | 'tiktok' | null;
						message: string;
						tracked_account_id: string | null;
						metadata: { post_id?: string | null } | null;
						created_at: string;
						read_at: string | null;
					};
					if (!(row.event_type in NOTIFIABLE)) return;
					const incoming: NotificationItem = {
						id: row.id,
						type: row.event_type as NotificationEventType,
						platform: row.platform,
						profileUsername: null,
						trackedAccountId: row.tracked_account_id,
						postId: row.metadata?.post_id ?? null,
						message: row.message,
						createdAt: row.created_at,
						readAt: row.read_at
					};
					notifications = [incoming, ...notifications].slice(0, 20);
					if (row.read_at == null) unreadCount += 1;
				}
			)
			.subscribe();
		return () => {
			void supabase.removeChannel(channel);
		};
	});

	function handleNavigate(href: string) {
		void goto(href);
	}

	function handleSearch(query: string) {
		const q = query.trim();
		void goto(q ? `/posts?q=${encodeURIComponent(q)}` : '/posts');
	}

	async function handleLogout() {
		await supabase.auth.signOut();
		await invalidateAll();
		await goto('/login');
	}

	async function handleNotificationClick(item: NotificationItem) {
		// Optimistically mark this one read.
		if (item.readAt == null) {
			notifications = notifications.map((n) =>
				n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n
			);
			unreadCount = Math.max(0, unreadCount - 1);
			const session = data.session;
			if (session) {
				try {
					await markNotificationsRead(
						{ ids: [item.id] },
						{ jwt: session.access_token }
					);
				} catch {
					// If the API call fails the badge will resync on next navigation via the server load.
				}
			}
		}
		// Route to the most relevant destination per event type.
		if (item.type === 'new_post' && item.postId) {
			// Open the post detail modal on the /posts page.
			void goto(`/posts?postId=${encodeURIComponent(item.postId)}`);
		} else if (item.type === 'trending_hashtag') {
			void goto('/trending');
		} else if (item.profileUsername && item.platform) {
			// scrape_complete / scrape_failed / follower_spike / fallback new_post (no post_id):
			// drop the user on the profile page.
			void goto(`/profile/${item.platform}/${item.profileUsername}`);
		} else {
			void goto('/dashboard');
		}
	}

	async function handleMarkAllRead() {
		const session = data.session;
		const now = new Date().toISOString();
		notifications = notifications.map((n) => (n.readAt ? n : { ...n, readAt: now }));
		unreadCount = 0;
		if (!session) return;
		try {
			await markNotificationsRead({ all: true }, { jwt: session.access_token });
		} catch {
			// Resync on next navigation.
		}
	}

	onDestroy(() => {
		// supabase client is created per layout instance; no shared singleton to disconnect.
	});
</script>

<AppShell
	{navigationItems}
	{user}
	{pageEyebrow}
	notifications={notifications}
	unreadNotificationCount={unreadCount}
	onNavigate={handleNavigate}
	onSearch={handleSearch}
	onLogout={handleLogout}
	onNotificationClick={handleNotificationClick}
	onMarkAllNotificationsRead={handleMarkAllRead}
>
	{@render children()}
</AppShell>
