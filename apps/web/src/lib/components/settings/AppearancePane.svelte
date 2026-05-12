<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import SidebarIcon from '@lucide/svelte/icons/sidebar';
	import type { AccentColorId, AccentOption, AppearanceState } from '@pulsetrack/shared-types';
	import Switch from './Switch.svelte';

	interface Props {
		accentOptions: AccentOption[];
		appearance: AppearanceState;
		onAccentChange?: (accent: AccentColorId) => void;
		onSidebarDefaultToggle?: (collapsed: boolean) => void;
	}

	let { accentOptions, appearance, onAccentChange, onSidebarDefaultToggle }: Props = $props();

	const activeAccent = $derived(
		accentOptions.find((a) => a.id === appearance.accentColor) ?? accentOptions[0]
	);
</script>

<div class="space-y-5">
	<section
		class="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 p-5 backdrop-blur-xl"
	>
		<header class="mb-4">
			<h2 class="text-[15px] font-semibold tracking-tight text-slate-100">Accent color</h2>
			<p class="mt-0.5 text-[12.5px] text-slate-500">
				Used for buttons, links, charts, and active-state highlights.
			</p>
		</header>

		<div class="flex flex-wrap gap-2.5">
			{#each accentOptions as opt (opt.id)}
				{@const active = opt.id === appearance.accentColor}
				<button
					type="button"
					onclick={() => onAccentChange?.(opt.id)}
					aria-pressed={active}
					aria-label={opt.label}
					class="group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-150 {active
						? 'scale-[1.03]'
						: 'hover:scale-[1.02]'}"
					style="background: {opt.hex}; box-shadow: {active
						? `0 0 0 2px #0F0F18, 0 0 0 4px ${opt.hex}, 0 0 24px -4px ${opt.hex}`
						: `0 0 0 1px rgba(255,255,255,0.06), 0 8px 18px -10px ${opt.hex}`};"
				>
					{#if active}
						<Check
							class="h-4 w-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
							strokeWidth={2.6}
						/>
					{/if}
					<span
						class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-slate-500"
						>{opt.label}</span
					>
				</button>
			{/each}
		</div>

		<div class="mt-12 rounded-xl border border-[#1A1A24] bg-[#0A0A0F] p-4">
			<p class="font-mono mb-3 text-[10px] uppercase tracking-[0.22em] text-slate-500">
				Preview · {activeAccent.label}
			</p>
			<div class="flex flex-wrap items-center gap-3">
				<span
					class="inline-flex items-center gap-1.5 rounded-md px-2 py-[3px] text-[11px] font-medium"
					style="background: {activeAccent.hex}20; color: {activeAccent.hex}; border: 1px solid {activeAccent.hex}40;"
				>
					<span aria-hidden="true" class="h-1.5 w-1.5 rounded-full" style="background: {activeAccent.hex};"
					></span>
					Active state
				</span>
				<button
					type="button"
					class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium text-white transition-transform duration-150 hover:scale-[1.02]"
					style="background: {activeAccent.hex}; box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.1), 0 8px 24px -12px {activeAccent.hex};"
				>
					Primary action
				</button>
				<span
					class="inline-flex items-center gap-2 rounded-full px-2 py-[2px] text-[11px]"
					style="background: {activeAccent.hex}15; color: {activeAccent.hex}; border: 1px solid {activeAccent.hex}30;"
				>
					4.82% engagement
				</span>
			</div>
		</div>
	</section>

	<section
		class="flex items-start gap-3 rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 p-5 backdrop-blur-xl"
	>
		<span
			aria-hidden="true"
			class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1E1E2E] bg-[#16161F] text-cyan-300"
		>
			<SidebarIcon class="h-4 w-4" strokeWidth={1.8} />
		</span>
		<div class="min-w-0 flex-1">
			<p class="text-[13.5px] font-medium tracking-tight text-slate-100">Start sidebar collapsed</p>
			<p class="mt-0.5 text-[12.5px] leading-snug text-slate-400">
				When on, the sidebar opens in its icon-only state by default, freeing more horizontal space
				for analytics surfaces.
			</p>
		</div>
		<div class="pt-0.5">
			<Switch
				checked={appearance.sidebarStartsCollapsed}
				onChange={(next) => onSidebarDefaultToggle?.(next)}
				label="Start sidebar collapsed"
			/>
		</div>
	</section>
</div>
