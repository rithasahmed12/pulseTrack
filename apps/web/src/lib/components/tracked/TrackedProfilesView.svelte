<script lang="ts">
	import type {
		AddProfileModalState,
		Platform,
		PlatformFilter,
		SortOption,
		TrackedProfile
	} from '@pulsetrack/shared-types';
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
		onProfileClick?: (profile: TrackedProfile) => void;
		onScrapeNow?: (profileId: string) => void;
		onTogglePaused?: (profileId: string, nextIsActive: boolean) => void;
		onRemoveProfile?: (profileId: string) => void;
		onRetryScrape?: (profileId: string) => void;
	}

	let {
		trackedProfiles,
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
		onProfileClick,
		onScrapeNow,
		onTogglePaused,
		onRemoveProfile,
		onRetryScrape
	}: Props = $props();

	function applyControls(
		profiles: TrackedProfile[],
		controls: FilterControls
	): TrackedProfile[] {
		let out = profiles;
		if (controls.platform !== 'all') out = out.filter((p) => p.platform === controls.platform);
		const q = controls.search.trim().toLowerCase();
		if (q.length > 0) {
			out = out.filter(
				(p) =>
					p.username.toLowerCase().includes(q) || p.displayName.toLowerCase().includes(q)
			);
		}
		const sorted = [...out];
		switch (controls.sort) {
			case 'most-followers':
				sorted.sort((a, b) => b.followersCount - a.followersCount);
				break;
			case 'highest-engagement':
				sorted.sort((a, b) => b.engagementRate - a.engagementRate);
				break;
			case 'last-scraped':
				sorted.sort((a, b) => {
					const av = a.lastScrapedAt ? new Date(a.lastScrapedAt).getTime() : 0;
					const bv = b.lastScrapedAt ? new Date(b.lastScrapedAt).getTime() : 0;
					return bv - av;
				});
				break;
			case 'recently-added':
			default:
				sorted.sort(
					(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
				break;
		}
		return sorted;
	}

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

	const visible = $derived(applyControls(trackedProfiles, filterControls));
	const hasAny = $derived(trackedProfiles.length > 0);
	const hasResults = $derived(visible.length > 0);
	const filtersActive = $derived(
		filterControls.platform !== 'all' || filterControls.search.length > 0
	);
</script>

<div class="min-h-full">
	<HeaderControls
		totalCount={trackedProfiles.length}
		visibleCount={visible.length}
		controls={filterControls}
		{onFilterChange}
		{onSortChange}
		{onSearchChange}
		{onAddProfileClick}
	/>

	{#if !hasAny}
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
			{#each visible as profile, idx (profile.id)}
				<div style="animation: card-rise 0.4s ease-out {Math.min(idx, 12) * 0.04}s both;">
					<ProfileCard
						{profile}
						onCardClick={() => onProfileClick?.(profile)}
						onScrapeNow={() => onScrapeNow?.(profile.id)}
						onTogglePaused={(nextActive) => onTogglePaused?.(profile.id, nextActive)}
						onRemove={() => onRemoveProfile?.(profile.id)}
						onRetryScrape={() => onRetryScrape?.(profile.id)}
					/>
				</div>
			{/each}
		</div>

		{#if filtersActive}
			<p
				class="font-mono mt-6 text-center text-[10.5px] uppercase tracking-[0.18em] text-slate-600"
			>
				showing {visible.length} of {trackedProfiles.length} · sort: {sortLabel(
					filterControls.sort
				)}
			</p>
		{/if}
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
