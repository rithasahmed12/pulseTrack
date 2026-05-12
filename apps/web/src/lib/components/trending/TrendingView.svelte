<script lang="ts">
	import Flame from '@lucide/svelte/icons/flame';
	import type {
		Heatmap,
		HeatmapCell,
		PlatformSeries,
		TrendingHashtag,
		TrendingPost
	} from '@pulsetrack/shared-types';
	import TrendingPostRow from './TrendingPostRow.svelte';
	import HashtagBlock from './HashtagBlock.svelte';
	import PlatformCompareCards from './PlatformCompareCards.svelte';
	import PostingTimeHeatmap from './PostingTimeHeatmap.svelte';

	interface Props {
		trendingPosts: TrendingPost[];
		trendingHashtags: TrendingHashtag[];
		platformComparison: PlatformSeries[];
		heatmap: Heatmap;
		onPostClick?: (post: TrendingPost) => void;
		onHashtagClick?: (tag: string) => void;
		onHeatmapCellClick?: (cell: HeatmapCell) => void;
	}

	let {
		trendingPosts,
		trendingHashtags,
		platformComparison,
		heatmap,
		onPostClick,
		onHashtagClick,
		onHeatmapCellClick
	}: Props = $props();
</script>

<div class="space-y-6">
	<header class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<p
				class="font-mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-amber-300"
			>
				<Flame class="h-3 w-3" strokeWidth={2.2} />
				Last 24 hours · live signal
			</p>
			<h1 class="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-slate-50">
				What's
				<span class="bg-gradient-to-r from-amber-200 via-violet-200 to-cyan-200 bg-clip-text text-transparent">
					trending
				</span>
			</h1>
			<p class="mt-0.5 text-[13px] text-slate-400">
				Velocity-ranked posts, growing hashtags, and the best windows to post.
			</p>
		</div>
	</header>

	<section
		class="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl"
	>
		<div class="flex items-center justify-between gap-2 border-b border-[#1A1A24] px-4 py-3">
			<div>
				<h2 class="text-[14px] font-semibold tracking-tight text-slate-100">Trending posts</h2>
				<p class="text-[11.5px] text-slate-500">
					Top 10 by 24-hour engagement velocity across all tracked profiles.
				</p>
			</div>
			<span class="font-mono text-[10.5px] uppercase tracking-wider text-slate-500">
				{trendingPosts.length} {trendingPosts.length === 1 ? 'post' : 'posts'}
			</span>
		</div>
		<div class="flex flex-col gap-1.5 p-3 sm:p-4">
			{#each trendingPosts as post, idx (post.id)}
				<div style="animation: tr-rise 0.35s ease-out {Math.min(idx, 10) * 0.04}s both;">
					<TrendingPostRow {post} rank={idx + 1} onClick={() => onPostClick?.(post)} />
				</div>
			{:else}
				<p
					class="font-mono py-6 text-center text-[10.5px] uppercase tracking-[0.22em] text-slate-600"
				>
					· no trending posts in the last 24h ·
				</p>
			{/each}
		</div>
	</section>

	<HashtagBlock hashtags={trendingHashtags} {onHashtagClick} />

	<section>
		<div class="mb-3 flex items-baseline justify-between">
			<h2 class="text-[14px] font-semibold tracking-tight text-slate-100">Platform comparison</h2>
			<span class="font-mono text-[10.5px] uppercase tracking-wider text-slate-500">
				7-day avg engagement
			</span>
		</div>
		<PlatformCompareCards comparison={platformComparison} />
	</section>

	<PostingTimeHeatmap {heatmap} onCellClick={onHeatmapCellClick} />
</div>

<style>
	@keyframes tr-rise {
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
