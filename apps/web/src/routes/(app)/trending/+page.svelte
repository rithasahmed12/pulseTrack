<script lang="ts">
	import { goto } from '$app/navigation';
	import type { HeatmapCell, TrendingPost } from '@pulsetrack/shared-types';
	import TrendingView from '$lib/components/trending/TrendingView.svelte';

	let { data } = $props();

	function openPost(post: TrendingPost) {
		void goto(`/posts?postId=${post.id}`);
	}

	function openHashtag(tag: string) {
		void goto(`/posts?tag=${encodeURIComponent(tag)}`);
	}

	function pickSlot(_cell: HeatmapCell) {
		// "Schedule a post" UI is post-MVP — for now, do nothing.
	}
</script>

<svelte:head>
	<title>Trending · PulseTrack</title>
</svelte:head>

<TrendingView
	trendingPosts={data.trendingPosts}
	trendingHashtags={data.trendingHashtags}
	platformComparison={data.platformComparison}
	heatmap={data.heatmap}
	onPostClick={openPost}
	onHashtagClick={openHashtag}
	onHeatmapCellClick={pickSlot}
/>
