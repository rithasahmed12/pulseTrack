<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		label: string;
		error?: string;
		icon?: Snippet;
		action?: Snippet;
		trailing?: Snippet;
		children: Snippet;
	}

	let { id, label, error, icon, action, trailing, children }: Props = $props();
	const hasError = $derived(!!error);
</script>

<div class="space-y-1.5">
	<div class="flex items-center justify-between">
		<label for={id} class="text-[12.5px] font-medium text-slate-300">{label}</label>
		{#if action}{@render action()}{/if}
	</div>
	<div
		class="relative rounded-lg border bg-[#0F0F18] transition-all duration-200 {hasError
			? 'border-rose-500/60 shadow-[0_0_0_3px_rgba(244,63,94,0.12)]'
			: 'border-[#1E1E2E] focus-within:border-violet-500/60 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.14)]'}"
	>
		{#if icon}
			<span
				class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
				>{@render icon()}</span
			>
		{/if}
		{@render children()}
		{#if trailing}{@render trailing()}{/if}
	</div>
	{#if hasError}
		<p class="flex items-center gap-1.5 text-[11.5px] text-rose-300">
			<span class="inline-block h-1 w-1 rounded-full bg-rose-400"></span>
			{error}
		</p>
	{/if}
</div>
