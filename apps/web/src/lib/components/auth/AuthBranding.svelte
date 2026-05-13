<script lang="ts">
	import type { BrandCopy, BrandStat, Quote } from '$lib/auth/types';

	interface Props {
		brand: BrandCopy;
		quote: Quote;
		stats: BrandStat[];
	}

	let { brand, quote, stats }: Props = $props();
	const year = new Date().getFullYear();
</script>

<div class="relative h-full overflow-hidden bg-[#08080C]">
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-0"
		style="background-image: radial-gradient(circle at 1px 1px, rgba(241,245,249,0.045) 1px, transparent 0); background-size: 24px 24px; mask-image: radial-gradient(circle at 100% 0%, black 0%, black 30%, transparent 70%); -webkit-mask-image: radial-gradient(circle at 100% 0%, black 0%, black 30%, transparent 70%);"
	></div>

	<div class="relative flex h-full flex-col justify-center gap-6 p-6 sm:p-10 lg:justify-between lg:p-12">
		<div class="flex items-center gap-3">
			<span
				class="relative flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 ring-1 ring-inset ring-violet-500/30"
				aria-hidden="true"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-violet-300"></span>
			</span>
			<div class="leading-tight">
				<p class="text-[14px] font-semibold tracking-tight text-slate-100">{brand.name}</p>
				<p class="text-[11px] text-slate-500">{brand.supporting}</p>
			</div>
		</div>

		<figure class="my-10 hidden max-w-[460px] lg:block">
			<div class="flex gap-5">
				<span
					aria-hidden="true"
					class="mt-[10px] h-7 w-[2px] shrink-0 rounded-full bg-violet-500/60"
				></span>
				<blockquote
					class="text-[20px] font-medium leading-[1.45] tracking-tight text-slate-100 sm:text-[22px] lg:text-[24px]"
				>
					{quote.text}
				</blockquote>
			</div>
			<figcaption class="mt-4 pl-[22px] text-[12.5px] leading-snug text-slate-400">
				<span class="font-medium text-slate-200">{quote.attribution}</span>
				<span class="text-slate-500"> · {quote.role}</span>
			</figcaption>
		</figure>

		<div class="hidden space-y-3 lg:block">
			<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-500">
				{#each stats as stat, i (stat.label)}
					<div class="flex items-center gap-2">
						{#if i > 0}
							<span
								aria-hidden="true"
								class="hidden h-1 w-1 rounded-full bg-slate-700 sm:inline-block"
							></span>
						{/if}
						<span>
							<span class="tabular-nums font-medium text-slate-300">{stat.value}</span>
							{stat.label.toLowerCase()}
						</span>
					</div>
				{/each}
			</div>
			<p class="text-[11px] text-slate-600">
				© {year} PulseTrack · Built for trend researchers
			</p>
		</div>
	</div>
</div>
