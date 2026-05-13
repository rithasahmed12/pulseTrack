<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type {
		DateRange,
		DateRangeOption,
		Pagination,
		Post,
		PostsPlatformFilter,
		PostTypeFilter
	} from '@pulsetrack/shared-types';
	import PostsView from '$lib/components/posts/PostsView.svelte';
	import PostDetailModal from '$lib/components/posts/PostDetailModal.svelte';

	let { data } = $props();

	const DATE_RANGE_OPTIONS: DateRangeOption[] = [
		{ id: '24h', label: 'Last 24 hours' },
		{ id: '7d', label: 'Last 7 days' },
		{ id: '30d', label: 'Last 30 days' },
		{ id: '90d', label: 'Last 90 days' }
	];

	// svelte-ignore state_referenced_locally
	let posts = $state<Post[]>(data.posts);
	// svelte-ignore state_referenced_locally
	let pagination = $state<Pagination>(data.pagination);
	// svelte-ignore state_referenced_locally
	let openPost = $state<Post | null>(data.openPost);
	let loadingMore = $state(false);

	$effect(() => {
		posts = data.posts;
		pagination = data.pagination;
		openPost = data.openPost;
	});

	function updateFilter(
		patch: Partial<{
			postType: PostTypeFilter;
			platform: PostsPlatformFilter;
			dateRange: DateRange;
			minEng: number;
		}>
	) {
		const params = new URLSearchParams(page.url.searchParams);
		if (patch.postType !== undefined) {
			if (patch.postType === 'all') params.delete('postType');
			else params.set('postType', patch.postType);
		}
		if (patch.platform !== undefined) {
			if (patch.platform === 'both') params.delete('platform');
			else params.set('platform', patch.platform);
		}
		if (patch.dateRange !== undefined) {
			if (patch.dateRange === '30d') params.delete('dateRange');
			else params.set('dateRange', patch.dateRange);
		}
		if (patch.minEng !== undefined) {
			if (patch.minEng === 0) params.delete('minEng');
			else params.set('minEng', String(patch.minEng));
		}
		params.delete('postId');
		void goto(`/posts${params.toString() ? `?${params.toString()}` : ''}`, {
			keepFocus: true,
			noScroll: true
		});
	}

	function resetFilters() {
		void goto('/posts', { keepFocus: true, noScroll: true });
	}

	function clearSearch() {
		const params = new URLSearchParams(page.url.searchParams);
		params.delete('q');
		params.delete('postId');
		void goto(`/posts${params.toString() ? `?${params.toString()}` : ''}`, {
			keepFocus: true,
			noScroll: true
		});
	}

	function loadMoreUrl(nextPage: number): string {
		const params = new URLSearchParams();
		if (data.filters.postType !== 'all') params.set('postType', data.filters.postType);
		if (data.filters.platform !== 'both') params.set('platform', data.filters.platform);
		if (data.filters.dateRange !== '30d') params.set('dateRange', data.filters.dateRange);
		if (data.filters.minEngagement > 0)
			params.set('minEng', String(data.filters.minEngagement));
		if (data.filters.q) params.set('q', data.filters.q);
		params.set('page', String(nextPage));
		return `/posts/load-more?${params.toString()}`;
	}

	async function loadMore() {
		if (!pagination.hasMore || loadingMore) return;
		loadingMore = true;
		try {
			const next = pagination.page + 1;
			const res = await fetch(loadMoreUrl(next));
			if (!res.ok) return;
			const body = (await res.json()) as { posts: Post[]; pagination: Pagination };
			posts = [...posts, ...body.posts];
			pagination = body.pagination;
		} finally {
			loadingMore = false;
		}
	}

	async function openPostFromCard(post: Post) {
		try {
			const res = await fetch(`/posts/detail/${post.id}`);
			openPost = res.ok ? ((await res.json()) as Post) : post;
		} catch {
			openPost = post;
		}
		const params = new URLSearchParams(page.url.searchParams);
		params.set('postId', post.id);
		void goto(`/posts?${params.toString()}`, {
			keepFocus: true,
			noScroll: true,
			replaceState: true
		});
	}

	function closeModal() {
		openPost = null;
		const params = new URLSearchParams(page.url.searchParams);
		params.delete('postId');
		void goto(`/posts${params.toString() ? `?${params.toString()}` : ''}`, {
			keepFocus: true,
			noScroll: true,
			replaceState: true
		});
	}

	function openHashtag(tag: string) {
		void goto(`/trending?tag=${encodeURIComponent(tag)}`);
	}
</script>

<svelte:head>
	<title>Posts · PulseTrack</title>
</svelte:head>

{#if data.filters.q}
	<div class="mb-4 flex items-center gap-2">
		<span
			class="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[12px] text-violet-100"
		>
			<span class="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-300/80">Search</span>
			<span class="font-medium">"{data.filters.q}"</span>
			<button
				type="button"
				aria-label="Clear search"
				onclick={clearSearch}
				class="-mr-1 flex h-4 w-4 items-center justify-center rounded-full text-violet-200/80 hover:bg-white/10 hover:text-white"
			>
				×
			</button>
		</span>
	</div>
{/if}

<PostsView
	{posts}
	totalCount={posts.length}
	filterControls={{
		postType: data.filters.postType,
		platform: data.filters.platform,
		dateRange: data.filters.dateRange,
		minEngagement: data.filters.minEngagement
	}}
	dateRangeOptions={DATE_RANGE_OPTIONS}
	{pagination}
	{loadingMore}
	onPostTypeChange={(t) => updateFilter({ postType: t })}
	onPlatformChange={(p) => updateFilter({ platform: p })}
	onDateRangeChange={(r) => updateFilter({ dateRange: r })}
	onMinEngagementChange={(v) => updateFilter({ minEng: v })}
	onResetFilters={resetFilters}
	onPostClick={openPostFromCard}
	onLoadMore={loadMore}
/>

<PostDetailModal post={openPost} onClose={closeModal} onHashtagClick={openHashtag} />
