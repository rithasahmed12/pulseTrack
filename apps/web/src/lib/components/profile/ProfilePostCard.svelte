<script lang="ts">
	import Heart from '@lucide/svelte/icons/heart';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Share2 from '@lucide/svelte/icons/share-2';
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import Eye from '@lucide/svelte/icons/eye';
	import Activity from '@lucide/svelte/icons/activity';
	import Camera from '@lucide/svelte/icons/camera';
	import Layers from '@lucide/svelte/icons/layers';
	import Video from '@lucide/svelte/icons/video';
	import Trophy from '@lucide/svelte/icons/trophy';
	import type { ProfilePost } from '@pulsetrack/shared-types';
	import { formatCount } from './chart-utils';

	interface Props {
		post: ProfilePost;
		isTopPost?: boolean;
		onClick?: () => void;
	}

	let { post, isTopPost = false, onClick }: Props = $props();

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onClick?.();
		}
	}

	const hueA = $derived(post.thumbnailHue);
	const hueB = $derived((post.thumbnailHue + 40) % 360);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<article
	onclick={() => onClick?.()}
	onkeydown={handleKey}
	role="button"
	tabindex="0"
	aria-label="Open post"
	class="group relative cursor-pointer overflow-hidden rounded-xl border bg-[#0F0F18] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] {isTopPost
		? 'border-amber-500/30 hover:border-amber-400/50 shadow-[0_0_24px_-12px_rgba(245,158,11,0.45)]'
		: 'border-[#1E1E2E] hover:border-violet-500/30'}"
>
	<div class="relative aspect-[4/5] overflow-hidden">
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
			>
				<div
					class="absolute inset-0 opacity-[0.06] mix-blend-overlay"
					style="background-image: url(&quot;data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.7'/></svg>&quot;);"
				></div>
			</div>
		{/if}

		<div class="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
			<span
				class="inline-flex items-center gap-1 rounded-md bg-black/45 px-1.5 py-[2px] text-[9.5px] font-medium uppercase tracking-wider text-slate-100 ring-1 ring-inset ring-white/15 backdrop-blur"
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
			<span
				class="inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-black/55 px-1.5 py-[2px] text-[10px] font-medium text-violet-100 backdrop-blur"
			>
				<span aria-hidden="true" class="h-1 w-1 rounded-full bg-violet-300"></span>
				<span class="tabular-nums">{post.engagementRate.toFixed(2)}%</span>
			</span>
		</div>

		{#if isTopPost}
			<span
				class="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-amber-500/85 px-1.5 py-[2px] text-[9.5px] font-semibold uppercase tracking-wider text-slate-900 ring-1 ring-inset ring-amber-300/40"
			>
				<Trophy class="h-2.5 w-2.5" strokeWidth={2.4} />
				Top
			</span>
		{/if}

		<div
			class="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/70 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
		>
			<div class="p-3" style="transform: translateY(8px); animation: pp-rise 0.25s ease-out forwards;">
				<p class="mb-2 line-clamp-2 text-[12px] leading-snug text-slate-200">{post.caption}</p>
				<div class="grid grid-cols-3 gap-2 text-[10.5px] text-slate-300">
					<div class="flex flex-col gap-0.5">
						<span class="flex items-center gap-1 text-slate-400">
							<Heart class="h-3 w-3" />
							<span class="tabular-nums font-medium">{formatCount(post.likes)}</span>
						</span>
						<span class="font-mono text-[9px] uppercase tracking-wider text-slate-500">Likes</span>
					</div>
					<div class="flex flex-col gap-0.5">
						<span class="flex items-center gap-1 text-slate-400">
							<MessageCircle class="h-3 w-3" />
							<span class="tabular-nums font-medium">{formatCount(post.comments)}</span>
						</span>
						<span class="font-mono text-[9px] uppercase tracking-wider text-slate-500">Comments</span>
					</div>
					{#if post.shares != null && post.shares > 0}
						<div class="flex flex-col gap-0.5">
							<span class="flex items-center gap-1 text-slate-400">
								<Share2 class="h-3 w-3" />
								<span class="tabular-nums font-medium">{formatCount(post.shares)}</span>
							</span>
							<span class="font-mono text-[9px] uppercase tracking-wider text-slate-500">Shares</span>
						</div>
					{/if}
					{#if post.saves != null && post.saves > 0}
						<div class="flex flex-col gap-0.5">
							<span class="flex items-center gap-1 text-slate-400">
								<Bookmark class="h-3 w-3" />
								<span class="tabular-nums font-medium">{formatCount(post.saves)}</span>
							</span>
							<span class="font-mono text-[9px] uppercase tracking-wider text-slate-500">Saves</span>
						</div>
					{/if}
					{#if post.views != null && post.views > 0}
						<div class="flex flex-col gap-0.5">
							<span class="flex items-center gap-1 text-slate-400">
								<Eye class="h-3 w-3" />
								<span class="tabular-nums font-medium">{formatCount(post.views)}</span>
							</span>
							<span class="font-mono text-[9px] uppercase tracking-wider text-slate-500">Views</span>
						</div>
					{/if}
					<div class="flex flex-col gap-0.5">
						<span class="flex items-center gap-1 text-violet-200">
							<Activity class="h-3 w-3" />
							<span class="tabular-nums font-medium">{post.engagementRate.toFixed(2)}%</span>
						</span>
						<span class="font-mono text-[9px] uppercase tracking-wider text-slate-500">Engagement</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</article>

<style>
	@keyframes pp-rise {
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
