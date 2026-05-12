<script lang="ts">
	interface Props {
		checked: boolean;
		disabled?: boolean;
		id?: string;
		name?: string;
		ariaLabel?: string;
		onChange?: (next: boolean) => void;
	}

	let {
		checked = $bindable(),
		disabled = false,
		id,
		name,
		ariaLabel,
		onChange
	}: Props = $props();
</script>

<span class="relative inline-flex">
	<input
		{id}
		{name}
		type="checkbox"
		bind:checked
		{disabled}
		aria-label={ariaLabel}
		onchange={(e) => onChange?.((e.currentTarget as HTMLInputElement).checked)}
		class="peer sr-only"
	/>
	<span
		aria-hidden="true"
		class="flex h-4 w-4 items-center justify-center rounded-[5px] border transition-all duration-150 peer-disabled:opacity-50 {checked
			? 'border-violet-400/60 bg-violet-500/80 shadow-[0_0_10px_-2px_rgba(124,58,237,0.6)]'
			: 'border-[#252535] bg-[#0F0F18]'}"
	>
		{#if checked}
			<svg
				viewBox="0 0 16 16"
				class="h-3 w-3 text-white"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
			>
				<path d="M3.5 8.5l3 3 6-7" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		{/if}
	</span>
</span>
