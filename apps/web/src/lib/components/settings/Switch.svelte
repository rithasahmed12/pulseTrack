<script lang="ts">
	interface Props {
		checked: boolean;
		onChange?: (next: boolean) => void;
		disabled?: boolean;
		label?: string;
	}

	let { checked, onChange, disabled = false, label }: Props = $props();
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	aria-label={label}
	{disabled}
	onclick={() => onChange?.(!checked)}
	class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 {checked
		? 'bg-violet-500/85 shadow-[inset_0_0_0_1px_rgba(124,58,237,0.4),0_0_12px_-2px_rgba(124,58,237,0.6)]'
		: 'bg-[#1E1E2E]'}"
>
	<span
		aria-hidden="true"
		class="inline-block h-3.5 w-3.5 rounded-full bg-slate-50 shadow transition-transform duration-150 {checked
			? 'translate-x-[18px]'
			: 'translate-x-[3px]'}"
	></span>
</button>
