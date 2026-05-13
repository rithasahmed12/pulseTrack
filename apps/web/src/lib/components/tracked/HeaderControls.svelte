<script lang="ts">
	import { onMount } from 'svelte';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import type { PlatformFilter, SortOption } from '@pulsetrack/shared-types';

	interface FilterControls {
		platform: PlatformFilter;
		sort: SortOption;
		search: string;
	}

	interface Props {
		totalCount: number;
		visibleCount: number;
		controls: FilterControls;
		onFilterChange?: (filter: PlatformFilter) => void;
		onSortChange?: (sort: SortOption) => void;
		onSearchChange?: (query: string) => void;
		onAddProfileClick?: () => void;
	}

	let {
		totalCount,
		visibleCount,
		controls,
		onFilterChange,
		onSortChange,
		onSearchChange,
		onAddProfileClick
	}: Props = $props();

	// Local mirror of the search field so typing doesn't trigger a navigation
	// on every keystroke. We debounce the emit by 300ms.
	// svelte-ignore state_referenced_locally
	let searchDraft = $state(controls.search);
	let searchTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		// Sync external (URL) → local when controls.search changes from outside (e.g. clear filters).
		if (controls.search !== searchDraft) {
			searchDraft = controls.search;
		}
	});

	function emitSearch(value: string) {
		searchDraft = value;
		if (searchTimer) clearTimeout(searchTimer);
		searchTimer = setTimeout(() => onSearchChange?.(value), 300);
	}

	function clearSearch() {
		if (searchTimer) clearTimeout(searchTimer);
		searchDraft = '';
		onSearchChange?.('');
	}

	const SORT_LABELS: Record<SortOption, string> = {
		'recently-added': 'Recently added',
		'most-followers': 'Most followers',
		'highest-engagement': 'Highest engagement',
		'last-scraped': 'Last scraped'
	};
	const SORT_KEYS: SortOption[] = [
		'recently-added',
		'most-followers',
		'highest-engagement',
		'last-scraped'
	];
	const FILTERS: { id: PlatformFilter; label: string }[] = [
		{ id: 'all', label: 'All' },
		{ id: 'instagram', label: 'Instagram' },
		{ id: 'tiktok', label: 'TikTok' }
	];

	const isFiltered = $derived(visibleCount !== totalCount);

	let sortOpen = $state(false);
	let sortRef: HTMLDivElement | undefined = $state();

	onMount(() => {
		function onDocClick(e: MouseEvent) {
			if (!sortOpen) return;
			if (!sortRef?.contains(e.target as Node)) sortOpen = false;
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') sortOpen = false;
		}
		document.addEventListener('mousedown', onDocClick);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDocClick);
			document.removeEventListener('keydown', onKey);
		};
	});
</script>

<div
	class="sticky top-0 z-20 -mx-4 mb-6 border-b border-[#1A1A24] bg-[#0A0A0F]/85 px-4 pb-4 pt-2 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
>
	<div class="flex flex-col gap-3">
		<div class="flex flex-wrap items-baseline justify-between gap-3">
			<div class="flex items-baseline gap-2.5">
				<h1 class="text-[20px] font-semibold tracking-tight text-slate-50">Tracked profiles</h1>
				<span class="font-mono tabular-nums text-[12px] text-slate-500">
					{#if isFiltered}
						<span class="text-slate-300">{visibleCount}</span>
						<span class="text-slate-600"> / {totalCount}</span>
					{:else}
						<span>{totalCount}</span>
					{/if}
				</span>
			</div>

			<button
				type="button"
				onclick={() => onAddProfileClick?.()}
				class="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[12.5px] font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.55)] transition-colors duration-150 hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
			>
				<Plus class="h-3.5 w-3.5" strokeWidth={2.2} />
				Add profile
			</button>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<div class="relative min-w-[200px] flex-1">
				<Search
					class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
					strokeWidth={1.8}
					aria-hidden="true"
				/>
				<input
					type="search"
					value={searchDraft}
					placeholder="Search by name or @username"
					oninput={(e) => emitSearch((e.currentTarget as HTMLInputElement).value)}
					class="h-8 w-full rounded-lg border border-[#1E1E2E] bg-[#0F0F18] pl-8 pr-7 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none transition-all duration-150 focus:border-violet-500/50 focus:bg-[#13131E] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
				/>
				{#if searchDraft}
					<button
						type="button"
						onclick={clearSearch}
						aria-label="Clear search"
						class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
					>
						<X class="h-3 w-3" strokeWidth={2} />
					</button>
				{/if}
			</div>

			<div
				class="flex shrink-0 items-center rounded-lg border border-[#1E1E2E] bg-[#0F0F18] p-0.5"
			>
				{#each FILTERS as filter (filter.id)}
					{@const active = controls.platform === filter.id}
					<button
						type="button"
						onclick={() => onFilterChange?.(filter.id)}
						aria-pressed={active}
						class="relative rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors duration-150 {active
							? 'bg-violet-500/15 text-violet-100'
							: 'text-slate-400 hover:text-slate-200'}"
					>
						{filter.label}
					</button>
				{/each}
			</div>

			<div class="ml-auto">
				<div bind:this={sortRef} class="relative shrink-0">
					<button
						type="button"
						onclick={() => (sortOpen = !sortOpen)}
						aria-haspopup="listbox"
						aria-expanded={sortOpen}
						class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#1E1E2E] bg-[#0F0F18] px-2.5 text-[12.5px] text-slate-300 transition-colors duration-150 hover:border-violet-500/30 hover:text-slate-100"
					>
						<span class="text-slate-500">Sort:</span>
						<span class="font-medium">{SORT_LABELS[controls.sort]}</span>
						<ChevronDown
							class="h-3 w-3 text-slate-500 transition-transform duration-150 {sortOpen
								? 'rotate-180'
								: ''}"
							strokeWidth={2}
						/>
					</button>
					{#if sortOpen}
						<ul
							role="listbox"
							class="absolute right-0 top-[calc(100%+6px)] z-30 w-52 overflow-hidden rounded-lg border border-[#252535] bg-[#13131E] p-1 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
						>
							{#each SORT_KEYS as key (key)}
								{@const selected = controls.sort === key}
								<li>
									<button
										type="button"
										onclick={() => {
											onSortChange?.(key);
											sortOpen = false;
										}}
										role="option"
										aria-selected={selected}
										class="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors duration-100 {selected
											? 'bg-violet-500/15 text-violet-100'
											: 'text-slate-300 hover:bg-white/[0.04] hover:text-slate-100'}"
									>
										<span>{SORT_LABELS[key]}</span>
										{#if selected}
											<Check class="h-3 w-3" strokeWidth={2.2} />
										{/if}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
