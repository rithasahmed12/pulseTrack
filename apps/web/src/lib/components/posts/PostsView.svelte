<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Inbox from '@lucide/svelte/icons/inbox';
	import type {
		DateRange,
		DateRangeOption,
		Pagination,
		Post,
		PostsPlatformFilter,
		PostTypeFilter
	} from '@pulsetrack/shared-types';
	import FilterBar from './FilterBar.svelte';
	import PostCard from './PostCard.svelte';

	interface FilterControls {
		postType: PostTypeFilter;
		platform: PostsPlatformFilter;
		dateRange: DateRange;
		minEngagement: number;
	}

	interface Props {
		posts: Post[];
		totalCount: number;
		filterControls: FilterControls;
		dateRangeOptions: DateRangeOption[];
		pagination: Pagination;
		loadingMore?: boolean;
		onPostTypeChange?: (type: PostTypeFilter) => void;
		onPlatformChange?: (platform: PostsPlatformFilter) => void;
		onDateRangeChange?: (range: DateRange) => void;
		onMinEngagementChange?: (value: number) => void;
		onResetFilters?: () => void;
		onPostClick?: (post: Post) => void;
		onLoadMore?: () => void;
	}

	let {
		posts,
		totalCount,
		filterControls,
		dateRangeOptions,
		pagination,
		loadingMore = false,
		onPostTypeChange,
		onPlatformChange,
		onDateRangeChange,
		onMinEngagementChange,
		onResetFilters,
		onPostClick,
		onLoadMore
	}: Props = $props();

	let sentinel: HTMLDivElement | undefined = $state();

	onMount(() => {
		if (!sentinel) return;
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const canLoad = untrack(() => pagination.hasMore && !loadingMore);
						if (canLoad) onLoadMore?.();
						break;
					}
				}
			},
			{ rootMargin: '200px' }
		);
		io.observe(sentinel);
		return () => io.disconnect();
	});

	const visibleCount = $derived(posts.length);
	const hasResults = $derived(visibleCount > 0);
</script>

<div>
	<FilterBar
		controls={filterControls}
		{dateRangeOptions}
		{totalCount}
		{visibleCount}
		{onPostTypeChange}
		{onPlatformChange}
		{onDateRangeChange}
		{onMinEngagementChange}
		{onResetFilters}
	/>

	{#if !hasResults}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1E1E2E] bg-[#0F0F18]/40 px-6 py-16 text-center"
		>
			<div
				class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16161F] ring-1 ring-inset ring-[#1E1E2E]"
			>
				<Inbox class="h-5 w-5 text-slate-500" strokeWidth={1.5} />
			</div>
			<h3 class="text-[15px] font-semibold tracking-tight text-slate-100">No posts match these filters</h3>
			<p class="mt-1 max-w-md text-[13px] text-slate-400">
				Try lowering the minimum engagement floor or widening the date range — or reset everything.
			</p>
			<button
				type="button"
				onclick={() => onResetFilters?.()}
				class="mt-4 rounded-md border border-[#1E1E2E] bg-[#0F0F18] px-3 py-1.5 text-[12.5px] text-slate-300 hover:border-violet-500/30 hover:text-slate-100"
			>
				Reset filters
			</button>
		</div>
	{:else}
		<div
			class="grid gap-3"
			style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));"
		>
			{#each posts as post, idx (post.id)}
				<div style="animation: posts-rise 0.35s ease-out {Math.min(idx, 16) * 0.025}s both;">
					<PostCard {post} onClick={() => onPostClick?.(post)} />
				</div>
			{/each}
		</div>

		<div
			bind:this={sentinel}
			class="mt-6 flex items-center justify-center py-6"
			aria-live="polite"
		>
			{#if pagination.hasMore}
				<span class="inline-flex items-center gap-2 text-[12px] text-slate-500">
					<Loader2 class="h-3.5 w-3.5 animate-spin text-violet-300" />
					Loading more posts…
				</span>
			{:else}
				<p
					class="font-mono text-center text-[10.5px] uppercase tracking-[0.22em] text-slate-600"
				>
					· all caught up ·
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	@keyframes posts-rise {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
