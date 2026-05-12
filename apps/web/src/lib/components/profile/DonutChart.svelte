<script lang="ts">
	import type { PostType, PostTypeSlice } from '@pulsetrack/shared-types';
	import { hexAlpha } from './chart-utils';

	interface Props {
		slices: PostTypeSlice[];
		onSliceClick?: (type: PostType) => void;
		size?: number;
		thickness?: number;
	}

	let { slices, onSliceClick, size = 180, thickness = 18 }: Props = $props();

	const TYPE_COLORS: Record<PostType, string> = {
		carousel: '#7C3AED',
		reel: '#06B6D4',
		video: '#06B6D4',
		photo: '#F59E0B'
	};
	const TYPE_LABELS: Record<PostType, string> = {
		carousel: 'Carousel',
		reel: 'Reel',
		video: 'Video',
		photo: 'Photo'
	};

	let hovered = $state<PostType | null>(null);

	const total = $derived(slices.reduce((acc, s) => acc + s.count, 0));
	const radius = $derived(size / 2 - thickness / 2);
	const center = $derived(size / 2);
	const circumference = $derived(2 * Math.PI * radius);

	const arcs = $derived.by(() => {
		let cumulative = 0;
		return slices.map((slice) => {
			const fraction = total > 0 ? slice.count / total : 0;
			const length = fraction * circumference;
			const offset = cumulative;
			cumulative += length;
			return { slice, length, offset, color: TYPE_COLORS[slice.type] ?? '#7C3AED' };
		});
	});

	const dominant = $derived(
		slices.reduce(
			(best, s) => (s.count > (best?.count ?? -1) ? s : best),
			null as PostTypeSlice | null
		)
	);
	const dominantPct = $derived(
		dominant && total > 0 ? Math.round((dominant.count / total) * 100) : 0
	);
	const hoveredSlice = $derived(hovered ? slices.find((s) => s.type === hovered) ?? null : null);
	const hoveredPct = $derived(
		hoveredSlice && total > 0 ? Math.round((hoveredSlice.count / total) * 100) : 0
	);
</script>

<div class="flex flex-col items-center gap-4">
	<div class="relative" style="width: {size}px; height: {size}px;">
		<svg viewBox="0 0 {size} {size}" class="block h-full w-full">
			<circle cx={center} cy={center} r={radius} fill="none" stroke="#1A1A24" stroke-width={thickness} />
			{#each arcs as a (a.slice.type)}
				{@const isHovered = hovered === a.slice.type}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<circle
					cx={center}
					cy={center}
					r={radius}
					fill="none"
					stroke={a.color}
					stroke-width={isHovered ? thickness + 3 : thickness}
					stroke-dasharray="{a.length} {circumference - a.length}"
					stroke-dashoffset={-a.offset}
					stroke-linecap="butt"
					transform="rotate(-90 {center} {center})"
					aria-label={a.slice.type}
					style="cursor: {onSliceClick ? 'pointer' : 'default'}; transition: stroke-width 150ms ease; {isHovered
						? `filter: drop-shadow(0 0 8px ${hexAlpha(a.color, 0.6)});`
						: ''}"
					onmouseenter={() => (hovered = a.slice.type)}
					onmouseleave={() => (hovered = null)}
					onclick={() => onSliceClick?.(a.slice.type)}
				/>
			{/each}
		</svg>
		<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
			{#if hovered && hoveredSlice}
				<p class="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
					{TYPE_LABELS[hovered]}
				</p>
				<p
					class="tabular-nums mt-0.5 text-[24px] font-semibold leading-none tracking-tight text-slate-50"
				>
					{hoveredSlice.count}
				</p>
				<p class="font-mono mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
					{hoveredPct}%
				</p>
			{:else}
				<p class="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
					{dominant ? TYPE_LABELS[dominant.type] : 'Posts'}
				</p>
				<p
					class="tabular-nums mt-0.5 text-[24px] font-semibold leading-none tracking-tight text-slate-50"
				>
					{dominantPct}%
				</p>
				<p class="tabular-nums mt-1 text-[11px] text-slate-500">{total} total</p>
			{/if}
		</div>
	</div>

	<ul class="flex flex-col gap-1.5 self-stretch text-[12px]">
		{#each slices as s (s.type)}
			{@const color = TYPE_COLORS[s.type] ?? '#7C3AED'}
			{@const pct = total > 0 ? Math.round((s.count / total) * 100) : 0}
			{@const active = hovered === s.type}
			<li>
				<button
					type="button"
					onmouseenter={() => (hovered = s.type)}
					onmouseleave={() => (hovered = null)}
					onclick={() => onSliceClick?.(s.type)}
					class="flex w-full items-center justify-between rounded-md px-2 py-1 transition-colors duration-150 {active
						? 'bg-white/[0.04] text-slate-100'
						: 'text-slate-300 hover:bg-white/[0.03]'}"
				>
					<span class="flex items-center gap-2">
						<span aria-hidden="true" class="h-1.5 w-1.5 rounded-full" style="background: {color}"></span>
						{TYPE_LABELS[s.type]}
					</span>
					<span class="font-mono tabular-nums text-slate-500">
						<span class="text-slate-200">{s.count}</span>
						<span class="ml-1 text-slate-600">· {pct}%</span>
					</span>
				</button>
			</li>
		{/each}
	</ul>
</div>
