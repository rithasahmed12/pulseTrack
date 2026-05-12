<script lang="ts">
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Hash from '@lucide/svelte/icons/hash';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import type { ActivityEvent, ActivityEventType } from '@pulsetrack/shared-types';

	interface Props {
		events: ActivityEvent[];
		onProfileClick?: (event: ActivityEvent) => void;
		onViewAllClick?: () => void;
	}

	let { events, onProfileClick, onViewAllClick }: Props = $props();

	const TYPE_META: Record<
		ActivityEventType,
		{ dot: string; ring: string; label: string }
	> = {
		new_post: {
			dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.7)]',
			ring: 'ring-cyan-500/25',
			label: 'New post'
		},
		follower_spike: {
			dot: 'bg-violet-400 shadow-[0_0_8px_rgba(124,58,237,0.7)]',
			ring: 'ring-violet-500/25',
			label: 'Follower spike'
		},
		trending_hashtag: {
			dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
			ring: 'ring-amber-500/25',
			label: 'Trending tag'
		},
		scrape_complete: {
			dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
			ring: 'ring-emerald-500/25',
			label: 'Scrape complete'
		},
		scrape_failed: {
			dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
			ring: 'ring-rose-500/25',
			label: 'Scrape failed'
		}
	};

	function formatRelative(iso: string): string {
		const then = new Date(iso).getTime();
		const now = Date.now();
		const diff = Math.max(0, now - then);
		const m = Math.floor(diff / 60_000);
		if (m < 1) return 'now';
		if (m < 60) return `${m}m`;
		const h = Math.floor(m / 60);
		if (h < 24) return `${h}h`;
		const d = Math.floor(h / 24);
		if (d < 30) return `${d}d`;
		const mo = Math.floor(d / 30);
		return `${mo}mo`;
	}
</script>

<section
	aria-label="Recent activity"
	class="relative overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl"
>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-x-0 top-0 h-px"
		style="background: linear-gradient(90deg, transparent, rgba(124,58,237,0.4), rgba(6,182,212,0.35), transparent);"
	></div>

	<div class="flex items-center justify-between border-b border-[#1A1A24] px-4 py-3">
		<div class="flex items-center gap-2">
			<h2 class="text-[14px] font-semibold tracking-tight text-slate-100">Recent activity</h2>
			<span
				class="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-1.5 py-[1px] text-[10px] font-medium uppercase tracking-wider text-emerald-200"
			>
				<span class="relative flex h-1.5 w-1.5">
					<span
						class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70"
					></span>
					<span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
				</span>
				Live
			</span>
		</div>
		{#if events.length > 0}
			<button
				type="button"
				onclick={() => onViewAllClick?.()}
				class="text-[11.5px] text-slate-400 hover:text-violet-300"
			>
				View all
			</button>
		{/if}
	</div>

	<div class="relative">
		<ol class="max-h-[640px] overflow-y-auto px-4 py-3">
			{#each events as event, idx (event.id)}
				{@const meta = TYPE_META[event.type]}
				{@const isLast = idx === events.length - 1}
				{@const clickable = !!event.profileUsername}
				{@const handle = event.profileUsername ? `@${event.profileUsername}` : null}
				{@const handleIdx = handle ? event.message.indexOf(handle) : -1}
				<li
					class="relative flex gap-3 pb-3 last:pb-0"
					style="animation: act-rise 0.4s ease-out {Math.min(idx, 12) * 0.04}s both;"
				>
					<div class="relative flex w-4 shrink-0 flex-col items-center">
						<span aria-hidden="true" class="mt-1.5 h-1.5 w-1.5 rounded-full {meta.dot}"></span>
						{#if !isLast}
							<span aria-hidden="true" class="mt-1 w-px flex-1 bg-[#1E1E2E]"></span>
						{/if}
					</div>
					<div class="min-w-0 flex-1 pb-1">
						<div class="flex flex-wrap items-center gap-1.5">
							<span
								class="inline-flex items-center gap-1 rounded-full bg-white/[0.03] px-1.5 py-[1px] text-[9.5px] font-medium uppercase tracking-wider text-slate-300 ring-1 ring-inset {meta.ring}"
							>
								<span class="opacity-80">
									{#if event.type === 'new_post'}
										<Sparkles class="h-3 w-3" strokeWidth={2} />
									{:else if event.type === 'follower_spike'}
										<ArrowUpRight class="h-3 w-3" strokeWidth={2} />
									{:else if event.type === 'trending_hashtag'}
										<Hash class="h-3 w-3" strokeWidth={2} />
									{:else if event.type === 'scrape_complete'}
										<RefreshCw class="h-3 w-3" strokeWidth={2} />
									{:else}
										<AlertTriangle class="h-3 w-3" strokeWidth={2} />
									{/if}
								</span>
								{meta.label}
							</span>
							{#if event.platform === 'instagram'}
								<span
									class="rounded-sm bg-gradient-to-br from-[#E1306C] to-[#F77737] px-1 py-px text-[8.5px] font-semibold uppercase tracking-wider text-white"
									>IG</span
								>
							{:else if event.platform === 'tiktok'}
								<span
									class="rounded-sm bg-black px-1 py-px text-[8.5px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/15"
									>TT</span
								>
							{/if}
							<span class="font-mono ml-auto shrink-0 tabular-nums text-[10px] text-slate-500">
								{formatRelative(event.createdAt)}
							</span>
						</div>
						<p class="mt-1 text-[12.5px] leading-snug text-slate-300">
							{#if handle && handleIdx >= 0}
								{event.message.slice(0, handleIdx)}<span
									class="font-medium text-slate-100">{handle}</span
								>{event.message.slice(handleIdx + handle.length)}
							{:else}
								{event.message}
							{/if}
						</p>
						{#if clickable}
							<button
								type="button"
								onclick={() => onProfileClick?.(event)}
								class="mt-1 inline-flex items-center gap-0.5 text-[11px] text-violet-300/90 hover:text-violet-200"
							>
								Open profile
								<ArrowUpRight class="h-3 w-3" strokeWidth={2} />
							</button>
						{/if}
					</div>
				</li>
			{/each}
			{#if events.length === 0}
				<li class="px-2 py-8 text-center text-[12.5px] text-slate-500">
					No activity yet. New events stream in here as PulseTrack scrapes profiles.
				</li>
			{/if}
		</ol>
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0F0F18] to-transparent"
		></div>
	</div>
</section>

<style>
	@keyframes act-rise {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
