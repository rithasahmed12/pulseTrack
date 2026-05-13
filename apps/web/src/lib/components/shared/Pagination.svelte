<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	interface Props {
		page: number;
		pageCount: number;
		onPageChange: (page: number) => void;
		ariaLabel?: string;
	}

	let { page, pageCount, onPageChange, ariaLabel = 'Pagination' }: Props = $props();

	const items = $derived.by<Array<number | 'gap'>>(() => {
		if (pageCount <= 1) return [];
		const out: Array<number | 'gap'> = [];
		const window = 1;
		const first = 1;
		const last = pageCount;
		const start = Math.max(first + 1, page - window);
		const end = Math.min(last - 1, page + window);
		out.push(first);
		if (start > first + 1) out.push('gap');
		for (let i = start; i <= end; i++) out.push(i);
		if (end < last - 1) out.push('gap');
		if (last > first) out.push(last);
		return out;
	});

	function go(target: number) {
		const clamped = Math.min(Math.max(1, target), pageCount);
		if (clamped !== page) onPageChange(clamped);
	}
</script>

{#if pageCount > 1}
	<nav
		aria-label={ariaLabel}
		class="mt-6 flex flex-wrap items-center justify-center gap-1.5 text-[13px]"
	>
		<button
			type="button"
			onclick={() => go(page - 1)}
			disabled={page <= 1}
			aria-label="Previous page"
			class="flex h-9 items-center gap-1 rounded-lg border border-[#1E1E2E] bg-[#0F0F18] px-2.5 text-slate-300 transition-colors duration-150 hover:border-violet-500/40 hover:bg-[#13131E] hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#1E1E2E] disabled:hover:bg-[#0F0F18] disabled:hover:text-slate-300"
		>
			<ChevronLeft class="h-4 w-4" />
			<span class="hidden sm:inline">Prev</span>
		</button>

		{#each items as item, i (i + '-' + item)}
			{#if item === 'gap'}
				<span aria-hidden="true" class="px-1 text-slate-600">…</span>
			{:else}
				{@const active = item === page}
				<button
					type="button"
					onclick={() => go(item)}
					aria-current={active ? 'page' : undefined}
					aria-label={`Page ${item}`}
					class="flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 transition-colors duration-150 {active
						? 'border-violet-500/40 bg-violet-500/15 text-violet-100 shadow-[0_0_24px_-8px_rgba(124,58,237,0.55)]'
						: 'border-[#1E1E2E] bg-[#0F0F18] text-slate-300 hover:border-violet-500/40 hover:bg-[#13131E] hover:text-slate-100'}"
				>
					<span class="tabular-nums">{item}</span>
				</button>
			{/if}
		{/each}

		<button
			type="button"
			onclick={() => go(page + 1)}
			disabled={page >= pageCount}
			aria-label="Next page"
			class="flex h-9 items-center gap-1 rounded-lg border border-[#1E1E2E] bg-[#0F0F18] px-2.5 text-slate-300 transition-colors duration-150 hover:border-violet-500/40 hover:bg-[#13131E] hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#1E1E2E] disabled:hover:bg-[#0F0F18] disabled:hover:text-slate-300"
		>
			<span class="hidden sm:inline">Next</span>
			<ChevronRight class="h-4 w-4" />
		</button>
	</nav>
{/if}
