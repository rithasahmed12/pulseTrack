<script lang="ts">
	import Heart from '@lucide/svelte/icons/heart';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Eye from '@lucide/svelte/icons/eye';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Clock from '@lucide/svelte/icons/clock';
	import type { QuickStat } from '@pulsetrack/shared-types';

	interface Props {
		stats: QuickStat[];
	}

	let { stats }: Props = $props();
</script>

<section class="relative overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl">
	<div class="border-b border-[#1A1A24] px-4 py-3">
		<h2 class="text-[14px] font-semibold tracking-tight text-slate-100">Quick stats</h2>
		<p class="text-[11.5px] text-slate-500">Per-post averages and best posting cadence.</p>
	</div>
	<ul>
		{#each stats as s, idx (s.label)}
			{@const key = s.label.toLowerCase()}
			<li
				class="flex items-center justify-between px-4 py-2.5 {idx > 0
					? 'border-t border-[#1A1A24]'
					: ''}"
			>
				<span class="flex items-center gap-2 text-[12.5px] text-slate-400">
					<span class="flex h-6 w-6 items-center justify-center rounded-md border border-[#1E1E2E] bg-[#16161F]">
						{#if key === 'avg likes'}
							<Heart class="h-3.5 w-3.5 text-rose-400" strokeWidth={1.8} />
						{:else if key === 'avg comments'}
							<MessageCircle class="h-3.5 w-3.5 text-cyan-300" strokeWidth={1.8} />
						{:else if key === 'avg reel plays' || key === 'avg views'}
							<Eye class="h-3.5 w-3.5 text-violet-300" strokeWidth={1.8} />
						{:else if key === 'best posting day'}
							<CalendarDays class="h-3.5 w-3.5 text-amber-300" strokeWidth={1.8} />
						{:else if key === 'best posting hour'}
							<Clock class="h-3.5 w-3.5 text-amber-300" strokeWidth={1.8} />
						{:else}
							<span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-violet-400"></span>
						{/if}
					</span>
					{s.label}
				</span>
				<span class="tabular-nums text-[13px] font-medium text-slate-100">{s.formattedValue}</span>
			</li>
		{/each}
	</ul>
</section>
