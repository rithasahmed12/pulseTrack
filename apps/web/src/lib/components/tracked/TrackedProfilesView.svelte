<script lang="ts">
	import type {
		AddProfileModalState,
		Pagination,
		Platform,
		PlatformFilter,
		SortOption,
		TrackedProfile
	} from '@pulsetrack/shared-types';
	import PaginationNav from '$lib/components/shared/Pagination.svelte';
	import HeaderControls from './HeaderControls.svelte';
	import ProfileCard from './ProfileCard.svelte';
	import AddProfileModal from './AddProfileModal.svelte';
	import EmptyState from './EmptyState.svelte';

	interface FilterControls {
		platform: PlatformFilter;
		sort: SortOption;
		search: string;
	}

	interface Props {
		trackedProfiles: TrackedProfile[];
		pagination: Pagination;
		filterControls: FilterControls;
		addProfileModalState: AddProfileModalState;
		addProfileError?: string | null;
		onAddProfileClick?: () => void;
		onModalInputChange?: (value: string) => void;
		onModalPlatformChange?: (platform: Platform) => void;
		onAddProfileSubmit?: (input: { platform: Platform; username: string }) => void;
		onAddProfileCancel?: () => void;
		onFilterChange?: (filter: PlatformFilter) => void;
		onSortChange?: (sort: SortOption) => void;
		onSearchChange?: (query: string) => void;
		onPageChange?: (page: number) => void;
		onProfileClick?: (profile: TrackedProfile) => void;
		onScrapeNow?: (profileId: string) => void;
		onTogglePaused?: (profileId: string, nextIsActive: boolean) => void;
		onRemoveProfile?: (profileId: string) => void;
		onPurgeProfile?: (profileId: string, username: string, typed: string) => Promise<boolean>;
		onRetryScrape?: (profileId: string) => void;
	}

	let {
		trackedProfiles,
		pagination,
		filterControls,
		addProfileModalState,
		addProfileError = null,
		onAddProfileClick,
		onModalInputChange,
		onModalPlatformChange,
		onAddProfileSubmit,
		onAddProfileCancel,
		onFilterChange,
		onSortChange,
		onSearchChange,
		onPageChange,
		onProfileClick,
		onScrapeNow,
		onTogglePaused,
		onRemoveProfile,
		onPurgeProfile,
		onRetryScrape
	}: Props = $props();

	function sortLabel(s: SortOption): string {
		switch (s) {
			case 'recently-added':
				return 'recently added';
			case 'most-followers':
				return 'most followers';
			case 'highest-engagement':
				return 'highest engagement';
			case 'last-scraped':
				return 'last scraped';
		}
	}

	const visibleCount = $derived(trackedProfiles.length);
	const totalCount = $derived(pagination.total);
	const hasAny = $derived(totalCount > 0);
	const hasResults = $derived(visibleCount > 0);
	const filtersActive = $derived(
		filterControls.platform !== 'all' || filterControls.search.length > 0
	);
	const rangeStart = $derived(
		totalCount === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
	);
	const rangeEnd = $derived(Math.min(pagination.page * pagination.pageSize, totalCount));
</script>

<div class="min-h-full">
	<HeaderControls
		{totalCount}
		{visibleCount}
		controls={filterControls}
		{onFilterChange}
		{onSortChange}
		{onSearchChange}
		{onAddProfileClick}
	/>

	{#if !hasAny && !filtersActive}
		<EmptyState variant="no-profiles" {onAddProfileClick} />
	{:else if !hasResults}
		<EmptyState
			variant="no-results"
			searchQuery={filterControls.search || undefined}
			onClearFilters={() => {
				onFilterChange?.('all');
				onSearchChange?.('');
			}}
		/>
	{:else}
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each trackedProfiles as profile, idx (profile.id)}
				<div style="animation: card-rise 0.4s ease-out {Math.min(idx, 12) * 0.04}s both;">
					<ProfileCard
						{profile}
						onCardClick={() => onProfileClick?.(profile)}
						onScrapeNow={() => onScrapeNow?.(profile.id)}
						onTogglePaused={(nextActive) => onTogglePaused?.(profile.id, nextActive)}
						onRemove={() => onRemoveProfile?.(profile.id)}
						onPurge={(typed) => onPurgeProfile?.(profile.id, profile.username, typed) ?? Promise.resolve(false)}
						onRetryScrape={() => onRetryScrape?.(profile.id)}
					/>
				</div>
			{/each}
		</div>

		<div class="mt-6 flex flex-col items-center gap-2">
			<PaginationNav
				page={pagination.page}
				pageCount={pagination.pageCount}
				onPageChange={(p) => onPageChange?.(p)}
				ariaLabel="Tracked profiles pagination"
			/>
			{#if totalCount > 0}
				<p class="font-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-600">
					{rangeStart}–{rangeEnd} of {totalCount} · sort: {sortLabel(filterControls.sort)}
				</p>
			{/if}
		</div>
	{/if}

	<AddProfileModal
		modalState={addProfileModalState}
		errorMessage={addProfileError}
		onInputChange={onModalInputChange}
		onPlatformChange={onModalPlatformChange}
		onSubmit={onAddProfileSubmit}
		onCancel={onAddProfileCancel}
	/>
</div>

<style>
	@keyframes card-rise {
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
