<script lang="ts">
	import Activity from '@lucide/svelte/icons/activity';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import PieIcon from '@lucide/svelte/icons/pie-chart';
	import type {
		DetailedProfile,
		PostType,
		PostTypeSlice,
		ProfilePost,
		QuickStat,
		TimePoint
	} from '@pulsetrack/shared-types';
	import LineChart from './LineChart.svelte';
	import AreaChart from './AreaChart.svelte';
	import DonutChart from './DonutChart.svelte';
	import ProfileHero from './ProfileHero.svelte';
	import ProfilePostCard from './ProfilePostCard.svelte';
	import TopPostHighlight from './TopPostHighlight.svelte';
	import QuickStatsPanel from './QuickStatsPanel.svelte';

	interface Props {
		profile: DetailedProfile;
		isTracked: boolean;
		engagementSeries: TimePoint[];
		followerSeries: TimePoint[];
		postTypeBreakdown: PostTypeSlice[];
		recentPosts: ProfilePost[];
		topPost: ProfilePost | null;
		quickStats: QuickStat[];
		onTrackProfile?: () => void;
		onRemoveTracking?: () => void;
		onPostClick?: (post: ProfilePost) => void;
		onTopPostClick?: (post: ProfilePost) => void;
		onPostTypeClick?: (type: PostType) => void;
	}

	let {
		profile,
		isTracked,
		engagementSeries,
		followerSeries,
		postTypeBreakdown,
		recentPosts,
		topPost,
		quickStats,
		onTrackProfile,
		onRemoveTracking,
		onPostClick,
		onTopPostClick,
		onPostTypeClick
	}: Props = $props();

	function formatGrowth(series: TimePoint[]): string {
		if (series.length < 2) return '—';
		const delta = series[series.length - 1].value - series[0].value;
		const sign = delta >= 0 ? '+' : '−';
		const abs = Math.abs(delta);
		const formatted =
			abs >= 1_000_000
				? (abs / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
				: abs >= 1_000
					? (abs / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
					: abs.toFixed(0);
		return `${sign}${formatted}`;
	}
</script>

<div class="space-y-5">
	<ProfileHero {profile} {isTracked} {onTrackProfile} {onRemoveTracking} />

	<div class="grid grid-cols-1 gap-5 lg:grid-cols-3 xl:gap-6">
		<div class="space-y-5 lg:col-span-2">
			<section class="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl">
				<div class="flex items-end justify-between gap-3 border-b border-[#1A1A24] px-4 py-3">
					<div>
						<div class="flex items-center gap-1.5">
							<Activity class="h-3.5 w-3.5 text-violet-300" />
							<h2 class="text-[14px] font-semibold tracking-tight text-slate-100">Engagement rate</h2>
						</div>
						<p class="text-[11.5px] text-slate-500">Last 30 days · daily</p>
					</div>
					<div class="text-right">
						<p class="tabular-nums text-[18px] font-semibold leading-none tracking-tight text-slate-50">
							{profile.engagementRate.toFixed(2)}%
						</p>
						<p class="font-mono mt-0.5 text-[9.5px] uppercase tracking-[0.18em] text-slate-500">Current</p>
					</div>
				</div>
				<div class="px-2 py-3 sm:px-4">
					<LineChart
						series={engagementSeries}
						unitSuffix="%"
						accent="#7C3AED"
						ariaLabel="Engagement rate over the last 30 days"
					/>
				</div>
			</section>

			<section class="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl">
				<div class="flex items-end justify-between gap-3 border-b border-[#1A1A24] px-4 py-3">
					<div>
						<div class="flex items-center gap-1.5">
							<TrendingUp class="h-3.5 w-3.5 text-cyan-300" />
							<h2 class="text-[14px] font-semibold tracking-tight text-slate-100">Follower growth</h2>
						</div>
						<p class="text-[11.5px] text-slate-500">Last 30 days · daily</p>
					</div>
					<div class="text-right">
						<p class="tabular-nums text-[18px] font-semibold leading-none tracking-tight text-slate-50">
							{formatGrowth(followerSeries)}
						</p>
						<p class="font-mono mt-0.5 text-[9.5px] uppercase tracking-[0.18em] text-slate-500">
							30-day net
						</p>
					</div>
				</div>
				<div class="px-2 py-3 sm:px-4">
					<AreaChart
						series={followerSeries}
						accent="#06B6D4"
						ariaLabel="Follower count over the last 30 days"
					/>
				</div>
			</section>

			<section class="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl">
				<div class="flex items-center justify-between border-b border-[#1A1A24] px-4 py-3">
					<div>
						<h2 class="text-[14px] font-semibold tracking-tight text-slate-100">Recent posts</h2>
						<p class="text-[11.5px] text-slate-500">Latest five — hover for full metrics.</p>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
					{#each recentPosts as post, idx (post.id)}
						<div style="animation: pd-rise 0.4s ease-out {Math.min(idx, 6) * 0.05}s both;">
							<ProfilePostCard
								{post}
								isTopPost={topPost ? post.id === topPost.id : false}
								onClick={() => onPostClick?.(post)}
							/>
						</div>
					{:else}
						<p
							class="font-mono col-span-full py-8 text-center text-[11.5px] uppercase tracking-wider text-slate-600"
						>
							No posts scraped yet
						</p>
					{/each}
				</div>
			</section>
		</div>

		<aside class="space-y-5 lg:sticky lg:top-[80px] lg:self-start">
			<section class="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl">
				<div class="flex items-center gap-2 border-b border-[#1A1A24] px-4 py-3">
					<PieIcon class="h-3.5 w-3.5 text-amber-300" strokeWidth={1.8} />
					<h2 class="text-[14px] font-semibold tracking-tight text-slate-100">Post types</h2>
				</div>
				<div class="p-4">
					<DonutChart slices={postTypeBreakdown} onSliceClick={onPostTypeClick} />
				</div>
			</section>

			{#if topPost}
				<TopPostHighlight post={topPost} onClick={() => onTopPostClick?.(topPost)} />
			{/if}

			<QuickStatsPanel stats={quickStats} />
		</aside>
	</div>
</div>

<style>
	@keyframes pd-rise {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
