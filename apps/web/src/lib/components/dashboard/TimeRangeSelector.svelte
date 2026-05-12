<script lang="ts">
	import type { TimeRange, TimeRangeOption } from '@pulsetrack/shared-types';

	interface Props {
		value: TimeRange;
		options: TimeRangeOption[];
		onChange?: (range: TimeRange) => void;
	}

	let { value, options, onChange }: Props = $props();
</script>

<div
	role="radiogroup"
	aria-label="Time range"
	class="inline-flex items-center rounded-lg border border-[#1E1E2E] bg-[#0F0F18] p-0.5"
>
	{#each options as opt (opt.id)}
		{@const active = opt.id === value}
		<button
			type="button"
			role="radio"
			aria-checked={active}
			onclick={() => onChange?.(opt.id)}
			title={opt.longLabel}
			class="font-mono relative rounded-md px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors duration-150 {active
				? 'bg-violet-500/15 text-violet-100 shadow-[inset_0_0_0_1px_rgba(124,58,237,0.25)]'
				: 'text-slate-400 hover:text-slate-200'}"
		>
			{opt.label}
		</button>
	{/each}
</div>
