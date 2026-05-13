<script lang="ts">
	import Inbox from '@lucide/svelte/icons/inbox';
	import type {
		DateRange,
		DateRangeOption,
		Pagination,
		Post,
		PostsPlatformFilter,
		PostTypeFilter
	} from '@pulsetrack/shared-types';
	import PaginationNav from '$lib/components/shared/Pagination.svelte';
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
		onPostTypeChange?: (type: PostTypeFilter) => void;
		onPlatformChange?: (platform: PostsPlatformFilter) => void;
		onDateRangeChange?: (range: DateRange) => void;
		onMinEngagementChange?: (value: number) => void;
		onResetFilters?: () => void;
		onPostClick?: (post: Post) => void;
		onPageChange?: (page: number) => void;
	}

	let {
		posts,
		totalCount,
		filterControls,
		dateRangeOptions,
		pagination,
		onPostTypeChange,
		onPlatformChange,
		onDateRangeChange,
		onMinEngagementChange,
		onResetFilters,
		onPostClick,
		onPageChange
	}: Props = $props();

	const visibleCount = $derived(posts.length);
	const hasResults = $derived(visibleCount > 0);
	const rangeStart = $derived(
		pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
	);
	const rangeEnd = $derived(
		Math.min(pagination.page * pagination.pageSize, pagination.total)
	);
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
			<h3 class="text-[15px] font-semibold tracking-tight text-slate-100">
				No posts match these filters
			</h3>
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

		<div class="mt-6 flex flex-col items-center gap-2">
			<PaginationNav
				page={pagination.page}
				pageCount={pagination.pageCount}
				onPageChange={(p) => onPageChange?.(p)}
				ariaLabel="Posts pagination"
			/>
			{#if pagination.total > 0}
				<p class="font-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-600">
					Showing {rangeStart}–{rangeEnd} of {pagination.total}
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
