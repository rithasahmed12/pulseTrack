<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	interface Props {
		submitting: boolean;
		idleLabel: string;
		loadingLabel: string;
	}

	let { submitting, idleLabel, loadingLabel }: Props = $props();
</script>

<button
	type="submit"
	disabled={submitting}
	class="group flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-[13.5px] font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.5)] transition-colors duration-150 hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] disabled:cursor-not-allowed disabled:opacity-70"
>
	{#if submitting}
		<Loader2 class="h-4 w-4 animate-spin" />
		<span>{loadingLabel}</span>
	{:else}
		<span>{idleLabel}</span>
		<ArrowRight class="h-4 w-4 opacity-70" />
	{/if}
</button>
