<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import type { PostType, ProfilePost } from '@pulsetrack/shared-types';
	import ProfileDetailView from '$lib/components/profile/ProfileDetailView.svelte';

	let { data } = $props();

	async function trackProfile() {
		const fd = new FormData();
		fd.set('username', data.username);
		await fetch('?/track', { method: 'POST', body: fd });
		await invalidateAll();
	}

	async function removeTracking() {
		const fd = new FormData();
		fd.set('id', data.detail.profile.id);
		await fetch('?/remove', { method: 'POST', body: fd });
	}

	function openPost(post: ProfilePost) {
		void goto(`/posts?postId=${post.id}`);
	}

	function openByType(type: PostType) {
		void goto(`/posts?postType=${type}`);
	}
</script>

<svelte:head>
	<title>{data.detail.profile.displayName} · PulseTrack</title>
</svelte:head>

<ProfileDetailView
	profile={data.detail.profile}
	isTracked={data.detail.isTracked}
	engagementSeries={data.detail.engagementSeries}
	followerSeries={data.detail.followerSeries}
	postTypeBreakdown={data.detail.postTypeBreakdown}
	recentPosts={data.detail.recentPosts}
	topPost={data.detail.topPost}
	quickStats={data.detail.quickStats}
	onTrackProfile={trackProfile}
	onRemoveTracking={removeTracking}
	onPostClick={openPost}
	onTopPostClick={openPost}
	onPostTypeClick={openByType}
/>
