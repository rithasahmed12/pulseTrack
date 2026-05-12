<script lang="ts">
	import { onMount } from 'svelte';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Check from '@lucide/svelte/icons/check';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import type {
		DateRange,
		DateRangeOption,
		PostsPlatformFilter,
		PostTypeFilter
	} from '@pulsetrack/shared-types';

	interface FilterControls {
		postType: PostTypeFilter;
		platform: PostsPlatformFilter;
		dateRange: DateRange;
		minEngagement: number;
	}

	interface Props {
		controls: FilterControls;
		dateRangeOptions: DateRangeOption[];
		totalCount: number;
		visibleCount: number;
		onPostTypeChange?: (type: PostTypeFilter) => void;
		onPlatformChange?: (platform: PostsPlatformFilter) => void;
		onDateRangeChange?: (range: DateRange) => void;
		onMinEngagementChange?: (value: number) => void;
		onResetFilters?: () => void;
	}

	let {
		controls,
		dateRangeOptions,
		totalCount,
		visibleCount,
		onPostTypeChange,
		onPlatformChange,
		onDateRangeChange,
		onMinEngagementChange,
		onResetFilters
	}: Props = $props();

	const POST_TYPE_TABS: { id: PostTypeFilter; label: string }[] = [
		{ id: 'all', label: 'All' },
		{ id: 'photo', label: 'Photos' },
		{ id: 'video', label: 'Videos' },
		{ id: 'carousel', label: 'Carousels' },
		{ id: 'reel', label: 'Reels' }
	];
	const PLATFORM_PILLS: { id: PostsPlatformFilter; label: string }[] = [
		{ id: 'both', label: 'Both' },
		{ id: 'instagram', label: 'Instagram' },
		{ id: 'tiktok', label: 'TikTok' }
	];

	const DEFAULT_CONTROLS: FilterControls = {
		postType: 'all',
		platform: 'both',
		dateRange: '30d',
		minEngagement: 0
	};
	const isDefault = $derived(
		controls.postType === DEFAULT_CONTROLS.postType &&
			controls.platform === DEFAULT_CONTROLS.platform &&
			controls.dateRange === DEFAULT_CONTROLS.dateRange &&
			controls.minEngagement === DEFAULT_CONTROLS.minEngagement
	);
	const filtered = $derived(!isDefault);
	const currentDateLabel = $derived(
		dateRangeOptions.find((o) => o.id === controls.dateRange)?.label ?? 'Last 30 days'
	);
	const sliderFill = $derived(controls.minEngagement * 10);

	let dateOpen = $state(false);
	let dateRef: HTMLDivElement | undefined = $state();

	onMount(() => {
		function onDocClick(e: MouseEvent) {
			if (!dateOpen) return;
			if (!dateRef?.contains(e.target as Node)) dateOpen = false;
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') dateOpen = false;
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
	class="sticky top-0 z-20 -mx-4 mb-5 border-b border-[#1A1A24] bg-[#0A0A0F]/85 px-4 pb-3 pt-2 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
>
	<div class="flex flex-wrap items-baseline justify-between gap-3 pb-3">
		<div class="flex items-baseline gap-2.5">
			<h1 class="text-[20px] font-semibold tracking-tight text-slate-50">Posts</h1>
			<span class="font-mono tabular-nums text-[12px] text-slate-500">
				{#if filtered}
					<span class="text-slate-300">{visibleCount}</span>
					<span class="text-slate-600"> / {totalCount}</span>
				{:else}
					<span>{totalCount}</span>
				{/if}
			</span>
		</div>

		{#if filtered}
			<button
				type="button"
				onclick={() => onResetFilters?.()}
				class="inline-flex items-center gap-1 text-[12px] text-slate-400 hover:text-violet-300"
			>
				<RotateCcw class="h-3 w-3" strokeWidth={2} />
				Reset filters
			</button>
		{/if}
	</div>

	<div class="-mx-1 mb-3 flex items-center gap-1 overflow-x-auto pb-1">
		{#each POST_TYPE_TABS as tab (tab.id)}
			{@const active = controls.postType === tab.id}
			<button
				type="button"
				onclick={() => onPostTypeChange?.(tab.id)}
				aria-pressed={active}
				class="relative shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 {active
					? 'bg-violet-500/12 text-violet-100 shadow-[inset_0_0_0_1px_rgba(124,58,237,0.3)]'
					: 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'}"
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<div class="flex flex-wrap items-center gap-3">
		<div class="flex shrink-0 items-center rounded-lg border border-[#1E1E2E] bg-[#0F0F18] p-0.5">
			{#each PLATFORM_PILLS as p (p.id)}
				{@const active = controls.platform === p.id}
				<button
					type="button"
					onclick={() => onPlatformChange?.(p.id)}
					aria-pressed={active}
					class="rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors duration-150 {active
						? 'bg-violet-500/15 text-violet-100'
						: 'text-slate-400 hover:text-slate-200'}"
				>
					{p.label}
				</button>
			{/each}
		</div>

		<div bind:this={dateRef} class="relative shrink-0">
			<button
				type="button"
				onclick={() => (dateOpen = !dateOpen)}
				aria-haspopup="listbox"
				aria-expanded={dateOpen}
				class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#1E1E2E] bg-[#0F0F18] px-2.5 text-[12px] text-slate-300 transition-colors duration-150 hover:border-violet-500/30 hover:text-slate-100"
			>
				<CalendarDays class="h-3 w-3 text-slate-500" strokeWidth={1.8} />
				<span class="font-medium">{currentDateLabel}</span>
				<ChevronDown
					class="h-3 w-3 text-slate-500 transition-transform duration-150 {dateOpen
						? 'rotate-180'
						: ''}"
					strokeWidth={2}
				/>
			</button>
			{#if dateOpen}
				<ul
					role="listbox"
					class="absolute left-0 top-[calc(100%+6px)] z-30 w-44 overflow-hidden rounded-lg border border-[#252535] bg-[#13131E] p-1 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
				>
					{#each dateRangeOptions as o (o.id)}
						{@const selected = controls.dateRange === o.id}
						<li>
							<button
								type="button"
								role="option"
								aria-selected={selected}
								onclick={() => {
									onDateRangeChange?.(o.id);
									dateOpen = false;
								}}
								class="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors duration-100 {selected
									? 'bg-violet-500/15 text-violet-100'
									: 'text-slate-300 hover:bg-white/[0.04] hover:text-slate-100'}"
							>
								<span>{o.label}</span>
								{#if selected}
									<Check class="h-3 w-3" strokeWidth={2.2} />
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div
			class="flex min-w-[200px] flex-1 items-center gap-2.5 rounded-lg border border-[#1E1E2E] bg-[#0F0F18] px-2.5 py-1.5"
		>
			<span class="font-mono shrink-0 text-[10px] uppercase tracking-[0.18em] text-slate-500">Min eng</span>
			<input
				type="range"
				min={0}
				max={10}
				step={0.5}
				value={controls.minEngagement}
				oninput={(e) =>
					onMinEngagementChange?.(parseFloat((e.currentTarget as HTMLInputElement).value))}
				class="posts-slider flex-1 accent-violet-500"
				style="background: linear-gradient(to right, #7C3AED {sliderFill}%, #1E1E2E {sliderFill}%);"
				aria-label="Minimum engagement rate"
			/>
			<span class="font-mono tabular-nums shrink-0 text-[11px] text-slate-200">
				{controls.minEngagement.toFixed(1)}%
			</span>
		</div>
	</div>
</div>

<style>
	.posts-slider {
		-webkit-appearance: none;
		appearance: none;
		height: 4px;
		border-radius: 9999px;
		outline: none;
	}
	.posts-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 14px;
		height: 14px;
		border-radius: 9999px;
		background: #f1f5f9;
		border: 2px solid #7c3aed;
		box-shadow: 0 0 8px rgba(124, 58, 237, 0.5);
		cursor: pointer;
	}
	.posts-slider::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border-radius: 9999px;
		background: #f1f5f9;
		border: 2px solid #7c3aed;
		box-shadow: 0 0 8px rgba(124, 58, 237, 0.5);
		cursor: pointer;
	}
</style>
