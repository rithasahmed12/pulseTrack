<script lang="ts">
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Users from '@lucide/svelte/icons/users';
	import ImageIcon from '@lucide/svelte/icons/image';
	import type { Component } from 'svelte';
	import type { StatTone, WorkspaceStat } from '@pulsetrack/shared-types';

	interface Props {
		stat: WorkspaceStat;
	}

	let { stat }: Props = $props();

	const ICON_MAP: Record<WorkspaceStat['icon'], Component> = {
		calendar: CalendarDays,
		users: Users,
		image: ImageIcon
	};
	const TONE_MAP: Record<StatTone, { text: string; ring: string; glow: string }> = {
		violet: {
			text: 'text-violet-200',
			ring: 'from-violet-500/30 to-violet-500/0',
			glow: 'shadow-[0_0_30px_-14px_rgba(124,58,237,0.55)]'
		},
		cyan: {
			text: 'text-cyan-200',
			ring: 'from-cyan-500/30 to-cyan-500/0',
			glow: 'shadow-[0_0_30px_-14px_rgba(6,182,212,0.55)]'
		},
		amber: {
			text: 'text-amber-200',
			ring: 'from-amber-500/30 to-amber-500/0',
			glow: 'shadow-[0_0_30px_-14px_rgba(245,158,11,0.5)]'
		},
		rose: {
			text: 'text-rose-200',
			ring: 'from-rose-500/30 to-rose-500/0',
			glow: 'shadow-[0_0_30px_-14px_rgba(244,63,94,0.5)]'
		}
	};

	const Icon = $derived(ICON_MAP[stat.icon]);
	const tone = $derived(TONE_MAP[stat.tone]);
</script>

<div
	class="group relative overflow-hidden rounded-xl border border-[#1E1E2E] bg-[#0F0F18]/85 p-4 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/25 {tone.glow}"
>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br {tone.ring} blur-2xl"
	></div>
	<div class="relative flex items-center justify-between">
		<span
			class="flex h-7 w-7 items-center justify-center rounded-md border border-[#1E1E2E] bg-[#16161F] {tone.text}"
			aria-hidden="true"
		>
			<Icon class="h-3.5 w-3.5" strokeWidth={1.8} />
		</span>
	</div>
	<p class="font-mono relative mt-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
		{stat.label}
	</p>
	<p
		class="tabular-nums relative mt-1 text-[26px] font-semibold leading-none tracking-tight text-slate-50"
	>
		{stat.value}
	</p>
	<p class="relative mt-1.5 text-[11.5px] text-slate-500">{stat.footnote}</p>
</div>
