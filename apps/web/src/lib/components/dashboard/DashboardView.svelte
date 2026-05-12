<script lang="ts">
	import type {
		ActivityEvent,
		DashboardStat,
		DashboardUser,
		TimeRange,
		TimeRangeOption,
		TopPost
	} from '@pulsetrack/shared-types';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import StatCard from './StatCard.svelte';
	import TopPostCard from './TopPostCard.svelte';
	import ActivityFeed from './ActivityFeed.svelte';
	import TimeRangeSelector from './TimeRangeSelector.svelte';

	interface Props {
		currentUser: DashboardUser;
		timeRange: TimeRange;
		timeRangeOptions: TimeRangeOption[];
		stats: DashboardStat[];
		topPosts: TopPost[];
		activity: ActivityEvent[];
		onTimeRangeChange?: (range: TimeRange) => void;
		onViewAllPostsClick?: () => void;
		onPostClick?: (post: TopPost) => void;
		onActivityProfileClick?: (event: ActivityEvent) => void;
		onViewAllActivityClick?: () => void;
	}

	let {
		currentUser,
		timeRange,
		timeRangeOptions,
		stats,
		topPosts,
		activity,
		onTimeRangeChange,
		onViewAllPostsClick,
		onPostClick,
		onActivityProfileClick,
		onViewAllActivityClick
	}: Props = $props();

	function getGreeting(): string {
		const h = new Date().getHours();
		if (h < 5) return 'Working late';
		if (h < 12) return 'Good morning';
		if (h < 18) return 'Good afternoon';
		return 'Good evening';
	}

	const greeting = getGreeting();
	const currentRangeLong = $derived(
		timeRangeOptions.find((o) => o.id === timeRange)?.longLabel ?? 'Last 7 days'
	);
</script>

<div class="space-y-6">
	<header class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<p class="font-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-500">
				{currentRangeLong}
			</p>
			<h1 class="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-slate-50">
				{greeting},
				<span class="bg-gradient-to-r from-violet-200 to-cyan-200 bg-clip-text text-transparent">
					{currentUser.firstName}
				</span>
			</h1>
			<p class="mt-0.5 text-[13px] text-slate-400">
				Here's what's been moving across your tracked profiles.
			</p>
		</div>

		<TimeRangeSelector value={timeRange} options={timeRangeOptions} onChange={onTimeRangeChange} />
	</header>

	<section class="grid grid-cols-2 gap-3 lg:grid-cols-4">
		{#each stats as stat (stat.id)}
			<StatCard {stat} />
		{/each}
	</section>

	<section class="grid grid-cols-1 gap-5 lg:grid-cols-3 xl:gap-6">
		<div class="lg:col-span-2">
			<div
				class="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl"
			>
				<div class="flex items-center justify-between gap-3 border-b border-[#1A1A24] px-4 py-3">
					<div>
						<h2 class="text-[14px] font-semibold tracking-tight text-slate-100">
							Top performing posts
						</h2>
						<p class="text-[11.5px] text-slate-500">
							Ranked by engagement rate · {currentRangeLong.toLowerCase()}
						</p>
					</div>
					<button
						type="button"
						onclick={() => onViewAllPostsClick?.()}
						class="inline-flex items-center gap-0.5 text-[12px] font-medium text-violet-300 hover:text-violet-200"
					>
						View all
						<ArrowUpRight class="h-3 w-3" strokeWidth={2} />
					</button>
				</div>

				<div class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each topPosts as post, idx (post.id)}
						<div style="animation: dash-rise 0.4s ease-out {Math.min(idx, 8) * 0.05}s both;">
							<TopPostCard {post} rank={idx + 1} onClick={() => onPostClick?.(post)} />
						</div>
					{:else}
						<p class="font-mono col-span-full py-8 text-center text-[11.5px] uppercase tracking-wider text-slate-600">
							No posts in this window yet
						</p>
					{/each}
				</div>
			</div>
		</div>

		<aside class="lg:sticky lg:top-[80px] lg:self-start">
			<ActivityFeed
				events={activity}
				onProfileClick={onActivityProfileClick}
				onViewAllClick={onViewAllActivityClick}
			/>
		</aside>
	</section>
</div>

<style>
	@keyframes dash-rise {
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
