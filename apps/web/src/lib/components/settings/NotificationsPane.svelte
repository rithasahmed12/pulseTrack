<script lang="ts">
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import Hash from '@lucide/svelte/icons/hash';
	import Mail from '@lucide/svelte/icons/mail';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import type { Component } from 'svelte';
	import type { NotificationPreference } from '@pulsetrack/shared-types';
	import Switch from './Switch.svelte';

	interface Props {
		preferences: NotificationPreference[];
		onToggle?: (id: string, enabled: boolean) => void;
	}

	let { preferences, onToggle }: Props = $props();

	const ICON_MAP: Record<NotificationPreference['icon'], Component> = {
		sparkles: Sparkles,
		'trending-up': TrendingUp,
		hash: Hash,
		mail: Mail,
		'refresh-cw': RefreshCw,
		'alert-triangle': AlertTriangle
	};
	const TONE_MAP: Record<string, string> = {
		new_post: 'text-cyan-300',
		follower_spike: 'text-violet-300',
		trending_hashtag: 'text-amber-300',
		weekly_report: 'text-emerald-300'
	};
</script>

<div class="space-y-3">
	{#each preferences as pref (pref.id)}
		{@const Icon = ICON_MAP[pref.icon]}
		{@const tone = TONE_MAP[pref.id] ?? 'text-violet-300'}
		<article
			class="group relative flex items-start gap-3 rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 p-4 backdrop-blur-xl transition-colors duration-150 hover:border-violet-500/25"
		>
			<span
				aria-hidden="true"
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1E1E2E] bg-[#16161F] {tone}"
			>
				<Icon class="h-4 w-4" strokeWidth={1.8} />
			</span>
			<div class="min-w-0 flex-1">
				<p class="text-[13.5px] font-medium tracking-tight text-slate-100">{pref.label}</p>
				<p class="mt-0.5 text-[12.5px] leading-snug text-slate-400">{pref.description}</p>
			</div>
			<div class="pt-0.5">
				<Switch
					checked={pref.enabled}
					onChange={(next) => onToggle?.(pref.id, next)}
					label={pref.label}
				/>
			</div>
		</article>
	{/each}
	<p class="pt-2 text-center text-[11.5px] text-slate-500">
		Email alerts go to the address on file.
	</p>
</div>
