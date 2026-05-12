<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Radar from '@lucide/svelte/icons/radar';

	interface Props {
		variant?: 'no-profiles' | 'no-results';
		searchQuery?: string;
		onAddProfileClick?: () => void;
		onClearFilters?: () => void;
	}

	let {
		variant = 'no-profiles',
		searchQuery,
		onAddProfileClick,
		onClearFilters
	}: Props = $props();
</script>

{#if variant === 'no-results'}
	<div
		class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1E1E2E] bg-[#0F0F18]/40 px-6 py-14 text-center"
	>
		<Radar class="mb-3 h-7 w-7 text-slate-600" strokeWidth={1.5} />
		<h3 class="text-[15px] font-semibold tracking-tight text-slate-100">No matches</h3>
		<p class="mt-1 max-w-md text-[13px] text-slate-400">
			{#if searchQuery}
				Nothing tracked matches "{searchQuery}". Try a different name or clear the filters.
			{:else}
				No tracked profiles match the current filters.
			{/if}
		</p>
		<button
			type="button"
			onclick={() => onClearFilters?.()}
			class="mt-4 rounded-md border border-[#1E1E2E] bg-[#0F0F18] px-3 py-1.5 text-[12.5px] text-slate-300 hover:border-violet-500/30 hover:text-slate-100"
		>
			Clear filters
		</button>
	</div>
{:else}
	<div
		class="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/50 px-6 py-16 text-center"
	>
		<div aria-hidden="true" class="relative mb-6 h-28 w-28">
			<div class="absolute inset-0 rounded-full border border-violet-500/20"></div>
			<div class="absolute inset-3 rounded-full border border-violet-500/15"></div>
			<div class="absolute inset-6 rounded-full border border-violet-500/10"></div>
			<div
				class="absolute inset-[40%] rounded-full bg-violet-500/30 shadow-[0_0_12px_rgba(124,58,237,0.6)]"
			></div>
			<span
				class="absolute left-1/2 top-1/2 h-1/2 w-px origin-top -translate-x-1/2 bg-gradient-to-b from-violet-300/70 to-transparent"
				style="animation: tracked-sweep 4s linear infinite;"
			></span>
		</div>

		<h3 class="text-[18px] font-semibold tracking-tight text-slate-50">
			No profiles tracked yet
		</h3>
		<p class="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-slate-400">
			Add an Instagram or TikTok profile to start collecting posts, engagement, and follower
			history. PulseTrack will keep scraping every six hours in the background.
		</p>
		<button
			type="button"
			onclick={() => onAddProfileClick?.()}
			class="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-[13px] font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.55)] transition-colors duration-150 hover:bg-violet-500"
		>
			<Plus class="h-4 w-4" strokeWidth={2.2} />
			Add your first profile
		</button>
	</div>
{/if}

<style>
	@keyframes tracked-sweep {
		from {
			transform: translate(-50%, 0) rotate(0deg);
		}
		to {
			transform: translate(-50%, 0) rotate(360deg);
		}
	}
</style>
