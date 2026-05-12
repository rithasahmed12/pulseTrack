<script lang="ts">
	import Clock from '@lucide/svelte/icons/clock';
	import type { Heatmap, HeatmapCell } from '@pulsetrack/shared-types';

	interface Props {
		heatmap: Heatmap;
		onCellClick?: (cell: HeatmapCell) => void;
	}

	let { heatmap, onCellClick }: Props = $props();

	let hovered = $state<HeatmapCell | null>(null);

	const grid = $derived.by(() => {
		const byDay = new Map<number, HeatmapCell[]>();
		for (const cell of heatmap.cells) {
			const row = byDay.get(cell.day) ?? [];
			row.push(cell);
			byDay.set(cell.day, row);
		}
		for (const row of byDay.values()) row.sort((a, b) => a.hour - b.hour);
		return byDay;
	});

	const stats = $derived.by(() => {
		if (heatmap.cells.length === 0) return null;
		let min = heatmap.cells[0].value;
		let max = heatmap.cells[0].value;
		let best = heatmap.cells[0];
		for (const cell of heatmap.cells) {
			if (cell.value < min) min = cell.value;
			if (cell.value > max) max = cell.value;
			if (cell.value > best.value) best = cell;
		}
		return { min, max, best };
	});

	function formatHour(h: number): string {
		if (h === 0) return '12 AM';
		if (h < 12) return `${h} AM`;
		if (h === 12) return '12 PM';
		return `${h - 12} PM`;
	}

	function opacityFor(value: number): number {
		if (!stats) return 0.08;
		const t = (value - stats.min) / Math.max(0.01, stats.max - stats.min);
		return 0.08 + t * 0.85;
	}
</script>

<section
	class="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl"
>
	<div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A24] px-4 py-3">
		<div class="flex items-center gap-2">
			<Clock class="h-3.5 w-3.5 text-cyan-300" strokeWidth={1.8} />
			<h2 class="text-[14px] font-semibold tracking-tight text-slate-100">Best posting times</h2>
		</div>
		<div class="font-mono text-[10.5px] uppercase tracking-wider text-slate-500">
			{#if stats}
				Peak ·
				<span class="font-medium text-slate-200">
					{heatmap.weekdays[stats.best.day]} {formatHour(stats.best.hour)}
				</span>
				<span class="tabular-nums ml-2 text-amber-300">{stats.best.value.toFixed(2)}%</span>
			{:else}
				No data yet
			{/if}
		</div>
	</div>

	<div class="overflow-x-auto p-4">
		<div class="min-w-[640px]">
			<div
				class="mb-2 grid items-end gap-[2px] pl-10"
				style="grid-template-columns: repeat(24, minmax(0, 1fr));"
			>
				{#each Array.from({ length: 24 }, (_, h) => h) as h (h)}
					<div class="text-center">
						{#if h % 6 === 0}
							<span class="font-mono text-[9px] uppercase tracking-wider text-slate-500">
								{h.toString().padStart(2, '0')}
							</span>
						{:else}
							<span class="text-[8px] text-slate-700">·</span>
						{/if}
					</div>
				{/each}
			</div>

			<div class="flex flex-col gap-[2px]">
				{#each heatmap.weekdays as label, dayIdx (dayIdx)}
					<div class="flex items-center gap-2">
						<span
							class="font-mono w-8 shrink-0 text-right text-[10px] uppercase tracking-wider text-slate-500"
							>{label}</span
						>
						<div
							class="grid flex-1 gap-[2px]"
							style="grid-template-columns: repeat(24, minmax(0, 1fr));"
						>
							{#each grid.get(dayIdx) ?? [] as cell (cell.hour)}
								{@const isHovered =
									hovered?.day === cell.day && hovered?.hour === cell.hour}
								<button
									type="button"
									onclick={() => onCellClick?.(cell)}
									onmouseenter={() => (hovered = cell)}
									onmouseleave={() => (hovered = null)}
									aria-label={`${heatmap.weekdays[cell.day]} ${formatHour(cell.hour)} — ${cell.value.toFixed(2)}% engagement`}
									class="relative h-5 rounded-sm transition-all duration-100 {isHovered
										? 'ring-1 ring-violet-300 ring-offset-1 ring-offset-[#0F0F18]'
										: ''}"
									style="background: rgba(124, 58, 237, {opacityFor(cell.value)});"
								></button>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-4 flex items-center justify-between">
				<div class="flex items-center gap-2 text-[10.5px] text-slate-500">
					<span class="font-mono uppercase tracking-wider">Low</span>
					<span
						class="flex h-2 w-32 overflow-hidden rounded-full ring-1 ring-inset ring-[#1A1A24]"
					>
						{#each [0.08, 0.18, 0.32, 0.48, 0.64, 0.78, 0.93] as op, i (i)}
							<span class="flex-1" style="background: rgba(124,58,237,{op});"></span>
						{/each}
					</span>
					<span class="font-mono uppercase tracking-wider">High</span>
				</div>

				<div
					class="rounded-md border border-[#252535] bg-[#13131E] px-2.5 py-1 text-[11px] transition-opacity duration-150 {hovered
						? 'opacity-100'
						: 'pointer-events-none opacity-0'}"
					role="status"
					aria-live="polite"
				>
					{#if hovered}
						<span class="text-slate-200">
							<span class="font-medium">{heatmap.weekdays[hovered.day]}</span>
							<span class="font-mono ml-1.5 text-slate-400">{formatHour(hovered.hour)}</span>
							<span class="mx-2 text-slate-700">·</span>
							<span class="tabular-nums font-medium text-violet-200"
								>{hovered.value.toFixed(2)}%</span
							>
							<span class="font-mono ml-1 text-[9px] uppercase tracking-wider text-slate-500"
								>avg eng</span
							>
						</span>
					{:else}
						<span class="text-slate-500">Hover a cell</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>
