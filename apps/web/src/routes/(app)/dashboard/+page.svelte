<script lang="ts">
	import { goto } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
	import type {
		ActivityEvent,
		TimeRange,
		TimeRangeOption,
		TopPost
	} from '@pulsetrack/shared-types';
	import DashboardView from '$lib/components/dashboard/DashboardView.svelte';
	import { createBrowserSupabase } from '$lib/supabase/client';

	let { data } = $props();

	const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
		{ id: '24h', label: '24h', longLabel: 'Last 24 hours' },
		{ id: '7d', label: '7d', longLabel: 'Last 7 days' },
		{ id: '30d', label: '30d', longLabel: 'Last 30 days' }
	];

	// svelte-ignore state_referenced_locally
	let activity = $state<ActivityEvent[]>(data.activity);

	$effect(() => {
		activity = data.activity;
	});

	function changeRange(range: TimeRange) {
		void goto(`?range=${range}`, { replaceState: false, keepFocus: true, noScroll: true });
	}

	function viewAllPosts() {
		void goto('/posts');
	}

	function openPost(post: TopPost) {
		void goto(`/posts?postId=${post.id}`);
	}

	function openProfile(event: ActivityEvent) {
		if (!event.profileUsername || !event.platform) return;
		void goto(`/profile/${event.platform}/${event.profileUsername}`);
	}

	let supabase: SupabaseClient | null = null;
	let channel: RealtimeChannel | null = null;

	onMount(() => {
		supabase = createBrowserSupabase();
		channel = supabase
			.channel(`activity:${data.userId}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'activity_log',
					filter: `user_id=eq.${data.userId}`
				},
				async () => {
					try {
						const res = await fetch('/dashboard?_data=app/dashboard');
						if (!res.ok) return;
						const fresh = (await res.json()) as { activity?: ActivityEvent[] };
						if (Array.isArray(fresh.activity)) activity = fresh.activity;
					} catch {
						// silent — next page nav will rehydrate
					}
				}
			)
			.subscribe();
	});

	onDestroy(() => {
		if (channel && supabase) {
			void supabase.removeChannel(channel);
		}
	});
</script>

<svelte:head>
	<title>Dashboard · PulseTrack</title>
</svelte:head>

<DashboardView
	currentUser={data.currentUser}
	timeRange={data.range}
	timeRangeOptions={TIME_RANGE_OPTIONS}
	stats={data.stats}
	topPosts={data.topPosts}
	{activity}
	onTimeRangeChange={changeRange}
	onViewAllPostsClick={viewAllPosts}
	onPostClick={openPost}
	onActivityProfileClick={openProfile}
	onViewAllActivityClick={viewAllPosts}
/>
