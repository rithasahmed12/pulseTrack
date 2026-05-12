<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import ArrowDownRight from '@lucide/svelte/icons/arrow-down-right';
	import Hash from '@lucide/svelte/icons/hash';
	import type { TrendingHashtag } from '@pulsetrack/shared-types';

	interface Props {
		hashtags: TrendingHashtag[];
		onHashtagClick?: (tag: string) => void;
	}

	let { hashtags, onHashtagClick }: Props = $props();

	let hovered = $state<string | null>(null);

	const maxUsage = $derived(Math.max(1, ...hashtags.map((h) => h.usageCount)));

	function formatCount(n: number): string {
		if (n >= 1000) return (n / 1000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '') + 'K';
		return String(n);
	}

	function tagColor(growthPercent: number): string {
		const rising = growthPercent >= 0;
		const intensity = Math.min(Math.abs(growthPercent), 300) / 300;
		return rising
			? `rgba(${168 - intensity * 60}, ${158 + intensity * 40}, 237, ${0.6 + intensity * 0.4})`
			: `rgba(248, ${113 - intensity * 30}, ${133 - intensity * 30}, ${0.55 + intensity * 0.35})`;
	}
</script>

<section
	class="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl"
>
	<div class="flex items-center gap-2 border-b border-[#1A1A24] px-4 py-3">
		<Hash class="h-3.5 w-3.5 text-amber-300" strokeWidth={1.8} />
		<h2 class="text-[14px] font-semibold tracking-tight text-slate-100">Trending hashtags</h2>
		<span class="font-mono ml-auto text-[10.5px] uppercase tracking-wider text-slate-500">Last 24h</span>
	</div>

	<div class="grid gap-px bg-[#1A1A24] md:grid-cols-[1.2fr_1fr]">
		<div class="bg-[#0F0F18] p-4">
			<p class="font-mono mb-3 text-[10px] uppercase tracking-[0.22em] text-slate-500">Cloud</p>
			<div class="flex flex-wrap items-baseline gap-x-3 gap-y-2">
				{#each hashtags as h (h.tag)}
					{@const fontSize = 11 + h.weight * 18}
					{@const isHovered = hovered === h.tag}
					{@const color = tagColor(h.growthPercent)}
					{@const fontWeight = 500 + Math.round(h.weight * 200)}
					<button
						type="button"
						onclick={() => onHashtagClick?.(h.tag)}
						onmouseenter={() => (hovered = h.tag)}
						onmouseleave={() => (hovered = null)}
						class="inline-flex items-baseline rounded transition-all duration-150 {isHovered
							? 'scale-105'
							: ''}"
						style="font-size: {fontSize}px; color: {color}; font-weight: {fontWeight}; line-height: 1.05; letter-spacing: -0.01em; text-shadow: {isHovered
							? `0 0 12px ${color}`
							: 'none'};"
					>
						#{h.tag}
					</button>
				{/each}
			</div>
		</div>

		<div class="bg-[#0F0F18]">
			<p class="font-mono px-4 pt-4 text-[10px] uppercase tracking-[0.22em] text-slate-500">
				Top 20 · sorted by usage
			</p>
			<ol class="mt-2 max-h-[420px] overflow-y-auto px-2 pb-3">
				{#each hashtags as h, i (h.tag)}
					{@const pct = h.usageCount / maxUsage}
					{@const rising = h.growthPercent >= 0}
					{@const isHovered = hovered === h.tag}
					<li>
						<button
							type="button"
							onclick={() => onHashtagClick?.(h.tag)}
							onmouseenter={() => (hovered = h.tag)}
							onmouseleave={() => (hovered = null)}
							class="group/row relative flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors duration-100 {isHovered
								? 'bg-white/[0.04]'
								: 'hover:bg-white/[0.03]'}"
						>
							<span class="font-mono tabular-nums w-6 shrink-0 text-[10px] text-slate-600">
								{(i + 1).toString().padStart(2, '0')}
							</span>
							<span
								class="flex-1 truncate text-[13px] {isHovered ? 'text-slate-100' : 'text-slate-300'}"
							>
								#{h.tag}
							</span>
							<span
								class="relative hidden h-1 w-16 overflow-hidden rounded-full bg-[#1A1A24] sm:inline-block"
							>
								<span
									class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500/70 to-cyan-400/60"
									style="width: {pct * 100}%;"
								></span>
							</span>
							<span class="font-mono tabular-nums shrink-0 text-[11px] text-slate-500">
								{formatCount(h.usageCount)}
							</span>
							<span
								class="tabular-nums inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-[1px] text-[10px] font-medium ring-1 ring-inset {rising
									? 'bg-emerald-500/10 ring-emerald-500/25 text-emerald-300'
									: 'bg-rose-500/10 ring-rose-500/25 text-rose-300'}"
							>
								{#if rising}
									<ArrowUpRight class="h-2.5 w-2.5" strokeWidth={2.2} />
								{:else}
									<ArrowDownRight class="h-2.5 w-2.5" strokeWidth={2.2} />
								{/if}
								{Math.abs(h.growthPercent)}%
							</span>
						</button>
					</li>
				{/each}
			</ol>
		</div>
	</div>
</section>
