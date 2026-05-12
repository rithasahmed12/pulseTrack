<script lang="ts">
	import Crown from '@lucide/svelte/icons/crown';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Activity from '@lucide/svelte/icons/activity';
	import Flame from '@lucide/svelte/icons/flame';
	import type { TrendingPost } from '@pulsetrack/shared-types';

	interface Props {
		post: TrendingPost;
		rank: number;
		onClick?: () => void;
	}

	let { post, rank, onClick }: Props = $props();

	const isTop = $derived(rank === 1);
	const hueA = $derived(post.thumbnailHue);
	const hueB = $derived((post.thumbnailHue + 40) % 360);
	const velocityUp = $derived(post.velocityPercent >= 0);
	const intensity = $derived(Math.min(Math.abs(post.velocityPercent), 300) / 300);
	const velocityShadow = $derived(
		velocityUp
			? `0 0 ${Math.round(intensity * 16)}px -4px rgba(52,211,153,${0.25 + intensity * 0.35})`
			: `0 0 ${Math.round(intensity * 16)}px -4px rgba(244,63,94,${0.25 + intensity * 0.35})`
	);

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onClick?.();
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<article
	onclick={() => onClick?.()}
	onkeydown={handleKey}
	role="button"
	tabindex="0"
	aria-label={`Open trending post by ${post.profileDisplayName}`}
	class="group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border bg-[#0F0F18] px-3 py-2.5 transition-all duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] {isTop
		? 'border-amber-500/30 hover:border-amber-400/50 shadow-[0_0_28px_-14px_rgba(245,158,11,0.55)]'
		: 'border-[#1E1E2E] hover:border-violet-500/30'}"
>
	{#if isTop}
		<span
			aria-hidden="true"
			class="pointer-events-none absolute inset-x-0 top-0 h-px"
			style="background: linear-gradient(90deg, transparent, rgba(245,158,11,0.6), rgba(124,58,237,0.4), transparent);"
		></span>
	{/if}

	<div class="flex w-9 shrink-0 flex-col items-center sm:w-12">
		{#if isTop}
			<span
				class="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-inset ring-amber-500/40"
			>
				<Crown class="h-3.5 w-3.5 text-amber-300" strokeWidth={2} />
			</span>
		{:else}
			<span class="font-mono tabular-nums text-[16px] font-semibold text-slate-600">
				{rank.toString().padStart(2, '0')}
			</span>
		{/if}
	</div>

	<div class="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-lg">
		{#if post.thumbnailUrl}
			<img
				src={post.thumbnailUrl}
				alt=""
				class="absolute inset-0 h-full w-full object-cover"
				loading="lazy"
				referrerpolicy="no-referrer"
			/>
		{:else}
			<div
				class="absolute inset-0"
				aria-hidden="true"
				style="background: radial-gradient(120% 80% at 30% 20%, hsla({hueA}, 80%, 55%, 0.55), transparent 60%), radial-gradient(100% 100% at 80% 80%, hsla({hueB}, 75%, 50%, 0.45), transparent 60%), #0F0F18;"
			></div>
		{/if}
		<div class="absolute left-1 top-1">
			{#if post.platform === 'instagram'}
				<span
					class="rounded-sm bg-gradient-to-br from-[#E1306C] to-[#F77737] px-1 py-px text-[8px] font-semibold uppercase tracking-wider text-white"
					>IG</span
				>
			{:else}
				<span
					class="rounded-sm bg-black px-1 py-px text-[8px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/15"
					>TT</span
				>
			{/if}
		</div>
	</div>

	<div class="min-w-0 flex-1">
		<div class="flex flex-wrap items-baseline gap-1.5">
			{#if isTop}
				<span
					class="font-mono inline-flex items-center gap-1 text-[9.5px] uppercase tracking-[0.18em] text-amber-300"
				>
					<Flame class="h-2.5 w-2.5" strokeWidth={2.2} />
					Top mover
				</span>
			{/if}
			<p class="truncate text-[13.5px] font-medium text-slate-100">{post.profileDisplayName}</p>
			<p class="font-mono truncate text-[11px] text-slate-500">@{post.profileUsername}</p>
		</div>
		<p class="mt-0.5 truncate text-[12.5px] text-slate-400">{post.caption}</p>
	</div>

	<div class="hidden shrink-0 items-center gap-2 sm:flex">
		<span
			class="inline-flex items-center gap-1 rounded-md px-1.5 py-[2px] text-[11px] font-medium ring-1 ring-inset {velocityUp
				? 'bg-emerald-500/10 ring-emerald-500/25 text-emerald-300'
				: 'bg-rose-500/10 ring-rose-500/25 text-rose-300'}"
			style="box-shadow: {velocityShadow};"
		>
			{velocityUp ? '↑' : '↓'}
			<span class="tabular-nums">
				{velocityUp ? '+' : '−'}{Math.abs(post.velocityPercent)}%
			</span>
			<span class="font-mono text-[9px] uppercase tracking-wider opacity-70">/24h</span>
		</span>
		<span
			class="inline-flex items-center gap-1 rounded-md border border-violet-500/25 bg-violet-500/[0.07] px-1.5 py-[2px] text-[11px] font-medium text-violet-200"
		>
			<Activity class="h-3 w-3" strokeWidth={2} />
			<span class="tabular-nums">{post.engagementRate.toFixed(2)}%</span>
		</span>
	</div>

	<ArrowUpRight
		class="h-3.5 w-3.5 shrink-0 text-slate-600 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-violet-300"
		strokeWidth={2}
	/>
</article>
