<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import ArrowDownRight from '@lucide/svelte/icons/arrow-down-right';
	import type { PlatformSeries } from '@pulsetrack/shared-types';
	import PlatformSparkline from './PlatformSparkline.svelte';

	interface Props {
		comparison: PlatformSeries[];
	}

	let { comparison }: Props = $props();
</script>

<section class="grid grid-cols-1 gap-3 sm:grid-cols-2">
	{#each comparison as data (data.platform)}
		{@const isIG = data.platform === 'instagram'}
		{@const accent = isIG ? '#E1306C' : '#06B6D4'}
		{@const accentSecondary = isIG ? '#F77737' : '#7C3AED'}
		{@const up = data.deltaPercent >= 0}
		<div
			class="group relative overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 p-4 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/25"
		>
			<div
				aria-hidden="true"
				class="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl"
				style="background: radial-gradient(circle, {accent}30, transparent 70%);"
			></div>

			<div class="relative flex items-start justify-between">
				<div class="flex items-center gap-2">
					{#if isIG}
						<span
							class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#E1306C] to-[#F77737] shadow-[0_0_18px_-4px_rgba(225,48,108,0.7)]"
						>
							<svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.07 1.25.07 1.63.07 4.85s-.02 3.6-.09 4.85c-.05 1.17-.25 1.8-.41 2.22a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.25.07-1.65.07-4.85.07s-3.6-.02-4.85-.09c-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.17 15.6 2.15 15.22 2.15 12s.02-3.6.09-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.4 2.17 8.78 2.15 12 2.2zm0 4.85a4.95 4.95 0 1 0 0 9.9 4.95 4.95 0 0 0 0-9.9zm0 1.8a3.15 3.15 0 1 1 0 6.3 3.15 3.15 0 0 1 0-6.3zm5.1-2.04a1.16 1.16 0 1 1 0 2.32 1.16 1.16 0 0 1 0-2.32z"
								/>
							</svg>
						</span>
					{:else}
						<span
							class="flex h-8 w-8 items-center justify-center rounded-lg bg-black ring-1 ring-inset ring-white/15"
						>
							<svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M19.6 7.3a6.4 6.4 0 0 1-4.1-1.5v8.6a5.3 5.3 0 1 1-4.7-5.3v2.2a3.1 3.1 0 1 0 2.5 3v-11h2.3a4.1 4.1 0 0 0 4 3.6v0z"
								/>
							</svg>
						</span>
					{/if}
					<div>
						<p class="text-[14px] font-semibold tracking-tight text-slate-100">{data.label}</p>
						<p class="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
							Avg engagement · 7d
						</p>
					</div>
				</div>

				<span
					class="tabular-nums inline-flex items-center gap-1 rounded-full px-1.5 py-[1px] text-[10.5px] font-medium ring-1 ring-inset {up
						? 'bg-emerald-500/10 ring-emerald-500/20 text-emerald-300'
						: 'bg-rose-500/10 ring-rose-500/20 text-rose-300'}"
				>
					{#if up}
						<ArrowUpRight class="h-2.5 w-2.5" strokeWidth={2.2} />
					{:else}
						<ArrowDownRight class="h-2.5 w-2.5" strokeWidth={2.2} />
					{/if}
					{Math.abs(data.deltaPercent).toFixed(2)}%
				</span>
			</div>

			<div class="relative mt-4 flex items-baseline gap-2">
				<p class="tabular-nums text-[28px] font-semibold leading-none tracking-tight text-slate-50">
					{data.currentAvgEngagement.toFixed(2)}%
				</p>
				<p class="font-mono text-[10.5px] text-slate-500">
					prev {data.previousAvgEngagement.toFixed(2)}%
				</p>
			</div>

			<div class="relative mt-4">
				<PlatformSparkline series={data.series} {accent} {accentSecondary} />
			</div>
		</div>
	{/each}
</section>
