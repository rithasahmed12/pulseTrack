<script lang="ts">
	import { onDestroy } from 'svelte';
	import X from '@lucide/svelte/icons/x';
	import Heart from '@lucide/svelte/icons/heart';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Share2 from '@lucide/svelte/icons/share-2';
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import Eye from '@lucide/svelte/icons/eye';
	import Activity from '@lucide/svelte/icons/activity';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Camera from '@lucide/svelte/icons/camera';
	import Layers from '@lucide/svelte/icons/layers';
	import Video from '@lucide/svelte/icons/video';
	import type { Post } from '@pulsetrack/shared-types';
	import { formatCount } from '$lib/components/profile/chart-utils';
	import MiniLineChart from './MiniLineChart.svelte';

	interface Props {
		post: Post | null;
		onClose?: () => void;
		onHashtagClick?: (tag: string) => void;
	}

	let { post, onClose, onHashtagClick }: Props = $props();

	function formatLong(iso: string): string {
		try {
			return new Date(iso).toLocaleString(undefined, {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: '2-digit'
			});
		} catch {
			return iso;
		}
	}

	function peakDay(series: { day: number; value: number }[]): number {
		if (series.length === 0) return 0;
		let bestIdx = 0;
		for (let i = 1; i < series.length; i += 1) {
			if (series[i].value > series[bestIdx].value) bestIdx = i;
		}
		return series[bestIdx].day;
	}

	$effect(() => {
		if (!post) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose?.();
		}
		document.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = prev;
			document.removeEventListener('keydown', onKey);
		};
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') document.body.style.overflow = '';
	});

	const externalHref = $derived(
		post
			? post.platform === 'instagram'
				? `https://instagram.com/${post.profileUsername}`
				: `https://tiktok.com/@${post.profileUsername}`
			: '#'
	);

	const viewsDim = $derived(!post || post.views == null || post.views === 0);
	const sharesDim = $derived(!post || post.shares == null || post.shares === 0);
	const savesDim = $derived(!post || post.saves == null || post.saves === 0);
</script>

{#if post}
	{@const hueA = post.thumbnailHue}
	{@const hueB = (post.thumbnailHue + 40) % 360}
	{@const peak = peakDay(post.engagementOverTime)}
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="post-detail-title"
		class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
	>
		<button
			type="button"
			aria-label="Close"
			onclick={() => onClose?.()}
			class="absolute inset-0 bg-black/70 backdrop-blur-sm"
		></button>

		<div
			class="relative flex max-h-[100vh] w-full max-w-[920px] flex-col overflow-hidden rounded-t-2xl border border-[#1E1E2E] bg-[#0F0F18]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:rounded-2xl"
		>
			<div
				aria-hidden="true"
				class="pointer-events-none absolute inset-x-0 top-0 h-px"
				style="background: linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(6,182,212,0.5), transparent);"
			></div>

			<div class="flex items-center justify-between gap-3 border-b border-[#1A1A24] px-4 py-3 sm:px-5">
				<div class="flex min-w-0 items-center gap-2.5">
					<div class="flex items-center gap-1.5">
						{#if post.platform === 'instagram'}
							<span
								class="rounded-md bg-gradient-to-br from-[#E1306C] to-[#F77737] px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wider text-white"
								>IG</span
							>
						{:else}
							<span
								class="rounded-md bg-black px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/15"
								>TT</span
							>
						{/if}
						<span
							class="inline-flex items-center gap-1 rounded-md bg-[#16161F] px-1.5 py-[2px] text-[10px] font-medium uppercase tracking-wider text-slate-300 ring-1 ring-inset ring-[#1E1E2E]"
						>
							{#if post.postType === 'photo'}
								<Camera class="h-2.5 w-2.5" strokeWidth={2} />
							{:else if post.postType === 'carousel'}
								<Layers class="h-2.5 w-2.5" strokeWidth={2} />
							{:else}
								<Video class="h-2.5 w-2.5" strokeWidth={2} />
							{/if}
							{post.postType}
						</span>
					</div>
					<div class="min-w-0">
						<p id="post-detail-title" class="truncate text-[13.5px] font-medium text-slate-100">
							@{post.profileUsername}
							<span class="ml-1 text-slate-500"> · {post.profileDisplayName}</span>
						</p>
						<p class="font-mono text-[10.5px] uppercase tracking-wider text-slate-500">
							{formatLong(post.postedAt)}
						</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => onClose?.()}
					aria-label="Close"
					class="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
				>
					<X class="h-4 w-4" strokeWidth={2} />
				</button>
			</div>

			<div class="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[1.1fr_1fr]">
				<div class="flex flex-col">
					<div class="relative aspect-[4/5] sm:aspect-square lg:aspect-auto lg:flex-1">
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
						<div
							class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-black/55 px-2 py-[3px] text-[11px] font-medium text-violet-100 backdrop-blur"
						>
							<span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-violet-300"></span>
							<span class="tabular-nums">{post.engagementRate.toFixed(2)}%</span>
							<span class="font-mono text-[9px] uppercase tracking-wider text-violet-200/80">eng</span>
						</div>
					</div>

					<div class="border-t border-[#1A1A24] p-4 sm:p-5">
						<p class="text-[13.5px] leading-relaxed text-slate-200">{post.caption}</p>
						{#if post.hashtags.length > 0}
							<div class="mt-3 flex flex-wrap gap-1.5">
								{#each post.hashtags as tag (tag)}
									<button
										type="button"
										onclick={() => onHashtagClick?.(tag)}
										class="rounded-full bg-violet-500/10 px-2 py-[2px] text-[11.5px] font-medium text-violet-200 ring-1 ring-inset ring-violet-500/20 transition-colors duration-150 hover:bg-violet-500/20 hover:text-violet-100"
									>
										#{tag}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				<div class="flex flex-col border-t border-[#1A1A24] lg:border-l lg:border-t-0">
					<div class="grid grid-cols-3 gap-px overflow-hidden border-b border-[#1A1A24] bg-[#1A1A24]">
						<div class="flex flex-col items-start bg-[#0F0F18] px-3 py-3">
							<span class="flex items-center gap-1.5">
								<Heart class="h-3.5 w-3.5 text-rose-400" />
								<span class="tabular-nums text-[14px] font-semibold leading-none text-slate-50">
									{formatCount(post.likes)}
								</span>
							</span>
							<span class="font-mono mt-1 text-[9.5px] uppercase tracking-[0.16em] text-slate-500">Likes</span>
						</div>
						<div class="flex flex-col items-start bg-[#0F0F18] px-3 py-3">
							<span class="flex items-center gap-1.5">
								<MessageCircle class="h-3.5 w-3.5 text-cyan-300" />
								<span class="tabular-nums text-[14px] font-semibold leading-none text-slate-50">
									{formatCount(post.comments)}
								</span>
							</span>
							<span class="font-mono mt-1 text-[9.5px] uppercase tracking-[0.16em] text-slate-500">Comments</span>
						</div>
						<div class="flex flex-col items-start bg-[#0F0F18] px-3 py-3">
							<span class="flex items-center gap-1.5 {viewsDim ? 'opacity-40' : ''}">
								<Eye class="h-3.5 w-3.5 text-violet-300" />
								<span class="tabular-nums text-[14px] font-semibold leading-none text-slate-50">
									{viewsDim ? '—' : formatCount(post.views ?? 0)}
								</span>
							</span>
							<span
								class="font-mono mt-1 text-[9.5px] uppercase tracking-[0.16em] {viewsDim
									? 'text-slate-600'
									: 'text-slate-500'}"
								>Views</span
							>
						</div>
						<div class="flex flex-col items-start bg-[#0F0F18] px-3 py-3">
							<span class="flex items-center gap-1.5 {sharesDim ? 'opacity-40' : ''}">
								<Share2 class="h-3.5 w-3.5 text-slate-300" />
								<span class="tabular-nums text-[14px] font-semibold leading-none text-slate-50">
									{sharesDim ? '—' : formatCount(post.shares ?? 0)}
								</span>
							</span>
							<span
								class="font-mono mt-1 text-[9.5px] uppercase tracking-[0.16em] {sharesDim
									? 'text-slate-600'
									: 'text-slate-500'}"
								>Shares</span
							>
						</div>
						<div class="flex flex-col items-start bg-[#0F0F18] px-3 py-3">
							<span class="flex items-center gap-1.5 {savesDim ? 'opacity-40' : ''}">
								<Bookmark class="h-3.5 w-3.5 text-amber-300" />
								<span class="tabular-nums text-[14px] font-semibold leading-none text-slate-50">
									{savesDim ? '—' : formatCount(post.saves ?? 0)}
								</span>
							</span>
							<span
								class="font-mono mt-1 text-[9.5px] uppercase tracking-[0.16em] {savesDim
									? 'text-slate-600'
									: 'text-slate-500'}"
								>Saves</span
							>
						</div>
						<div class="flex flex-col items-start bg-[#0F0F18] px-3 py-3">
							<span class="flex items-center gap-1.5">
								<Activity class="h-3.5 w-3.5 text-violet-200" />
								<span class="tabular-nums text-[14px] font-semibold leading-none text-violet-200">
									{post.engagementRate.toFixed(2)}%
								</span>
							</span>
							<span class="font-mono mt-1 text-[9.5px] uppercase tracking-[0.16em] text-slate-500">Engagement</span>
						</div>
					</div>

					<div class="border-b border-[#1A1A24] p-4 sm:p-5">
						<div class="mb-2 flex items-center justify-between">
							<h3 class="text-[12.5px] font-semibold tracking-tight text-slate-100">
								Engagement · first 7 days
							</h3>
							<span class="font-mono text-[10px] uppercase tracking-wider text-slate-500">
								peak {peak}d
							</span>
						</div>
						<MiniLineChart series={post.engagementOverTime} />
					</div>

					<div class="flex-1 p-4 sm:p-5">
						<a
							href={externalHref}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 rounded-md border border-[#1E1E2E] bg-[#0F0F18] px-2.5 py-1.5 text-[12px] text-slate-300 hover:border-violet-500/30 hover:text-slate-100"
						>
							<ExternalLink class="h-3.5 w-3.5" strokeWidth={1.8} />
							Open on {post.platform === 'instagram' ? 'Instagram' : 'TikTok'}
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
