<script lang="ts">
	import Trophy from '@lucide/svelte/icons/trophy';
	import Heart from '@lucide/svelte/icons/heart';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Eye from '@lucide/svelte/icons/eye';
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import type { ProfilePost } from '@pulsetrack/shared-types';
	import { formatCount } from './chart-utils';

	interface Props {
		post: ProfilePost;
		onClick?: () => void;
	}

	let { post, onClick }: Props = $props();

	const hueA = $derived(post.thumbnailHue);
	const hueB = $derived((post.thumbnailHue + 40) % 360);
	const hasViews = $derived(post.views != null && post.views > 0);

	function formatRelative(iso: string): string {
		const then = new Date(iso).getTime();
		const now = Date.now();
		const diff = Math.max(0, now - then);
		const m = Math.floor(diff / 60_000);
		if (m < 60) return `${m}m`;
		const h = Math.floor(m / 60);
		if (h < 24) return `${h}h`;
		const d = Math.floor(h / 24);
		return `${d}d`;
	}
</script>

<section
	class="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-[#0F0F18]/85 backdrop-blur-xl"
>
	<div class="flex items-center justify-between border-b border-[#1A1A24] bg-amber-500/[0.06] px-4 py-2.5">
		<div class="flex items-center gap-1.5">
			<Trophy class="h-3.5 w-3.5 text-amber-300" strokeWidth={1.8} />
			<h2 class="text-[12px] font-semibold uppercase tracking-[0.16em] text-amber-200">Top post</h2>
		</div>
		<span class="font-mono text-[10.5px] uppercase tracking-wider text-amber-300/80">
			{post.engagementRate.toFixed(2)}% eng
		</span>
	</div>

	<button type="button" onclick={() => onClick?.()} class="block w-full text-left">
		<div class="relative aspect-[4/3] overflow-hidden">
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
					aria-hidden="true"
					class="absolute inset-0"
					style="background: radial-gradient(120% 80% at 30% 20%, hsla({hueA}, 80%, 55%, 0.55), transparent 60%), radial-gradient(100% 100% at 80% 80%, hsla({hueB}, 75%, 50%, 0.45), transparent 60%), #0F0F18;"
				></div>
			{/if}
			<div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3">
				<p class="line-clamp-2 text-[12.5px] leading-snug text-slate-100">{post.caption}</p>
			</div>
		</div>

		<div class="grid grid-cols-4 gap-px overflow-hidden border-t border-[#1A1A24] bg-[#1A1A24]">
			<div class="flex flex-col items-center bg-[#0F0F18] px-2 py-2.5 text-center">
				<span class="tabular-nums flex items-center gap-1 text-[13px] font-medium text-slate-100">
					<Heart class="h-3 w-3 text-rose-400" />
					{formatCount(post.likes)}
				</span>
				<span class="font-mono mt-0.5 text-[9px] uppercase tracking-wider text-slate-500">Likes</span>
			</div>
			<div class="flex flex-col items-center bg-[#0F0F18] px-2 py-2.5 text-center">
				<span class="tabular-nums flex items-center gap-1 text-[13px] font-medium text-slate-100">
					<MessageCircle class="h-3 w-3 text-cyan-300" />
					{formatCount(post.comments)}
				</span>
				<span class="font-mono mt-0.5 text-[9px] uppercase tracking-wider text-slate-500">Comments</span>
			</div>
			{#if hasViews}
				<div class="flex flex-col items-center bg-[#0F0F18] px-2 py-2.5 text-center">
					<span class="tabular-nums flex items-center gap-1 text-[13px] font-medium text-slate-100">
						<Eye class="h-3 w-3 text-violet-300" />
						{formatCount(post.views ?? 0)}
					</span>
					<span class="font-mono mt-0.5 text-[9px] uppercase tracking-wider text-slate-500">Views</span>
				</div>
			{:else}
				<div class="flex flex-col items-center bg-[#0F0F18] px-2 py-2.5 text-center">
					<span class="tabular-nums flex items-center gap-1 text-[13px] font-medium text-slate-100">
						<Bookmark class="h-3 w-3 text-amber-300" />
						{formatCount(post.saves ?? 0)}
					</span>
					<span class="font-mono mt-0.5 text-[9px] uppercase tracking-wider text-slate-500">Saves</span>
				</div>
			{/if}
			<div class="flex flex-col items-center bg-[#0F0F18] px-2 py-2.5 text-center">
				<span class="tabular-nums text-[13px] font-medium text-slate-300">
					{formatRelative(post.postedAt)}
				</span>
				<span class="font-mono mt-0.5 text-[9px] uppercase tracking-wider text-slate-500">Posted</span>
			</div>
		</div>
	</button>
</section>
