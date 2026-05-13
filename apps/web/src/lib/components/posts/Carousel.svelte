<script lang="ts">
	import { onMount } from 'svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	interface Props {
		slides: string[];
		alt?: string;
		initialIndex?: number;
	}

	let { slides, alt = '', initialIndex = 0 }: Props = $props();

	// svelte-ignore state_referenced_locally
	let index = $state(Math.min(Math.max(initialIndex, 0), Math.max(slides.length - 1, 0)));

	const hasPrev = $derived(index > 0);
	const hasNext = $derived(index < slides.length - 1);

	function prev() {
		if (hasPrev) index -= 1;
	}

	function next() {
		if (hasNext) index += 1;
	}

	onMount(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === 'ArrowLeft') {
				prev();
			} else if (e.key === 'ArrowRight') {
				next();
			}
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<div class="absolute inset-0 flex flex-col bg-black">
	<div class="relative flex-1 overflow-hidden">
		{#if slides.length > 0}
			<img
				src={slides[index]}
				{alt}
				class="absolute inset-0 h-full w-full object-contain"
				loading="lazy"
				referrerpolicy="no-referrer"
			/>
		{/if}

		{#if slides.length > 1}
			<button
				type="button"
				aria-label="Previous slide"
				onclick={prev}
				disabled={!hasPrev}
				class="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-slate-100 backdrop-blur transition-all duration-200 hover:border-violet-500/50 hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-30"
			>
				<ChevronLeft class="h-4 w-4" strokeWidth={2.2} />
			</button>
			<button
				type="button"
				aria-label="Next slide"
				onclick={next}
				disabled={!hasNext}
				class="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-slate-100 backdrop-blur transition-all duration-200 hover:border-violet-500/50 hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-30"
			>
				<ChevronRight class="h-4 w-4" strokeWidth={2.2} />
			</button>

			<span
				class="font-mono absolute right-3 top-3 z-10 rounded-md border border-white/15 bg-black/55 px-1.5 py-[2px] text-[10.5px] uppercase tracking-wider text-slate-100 backdrop-blur"
			>
				{index + 1}/{slides.length}
			</span>
		{/if}
	</div>

	{#if slides.length > 1}
		<div
			class="flex shrink-0 items-center justify-center gap-1.5 border-t border-white/5 bg-black/40 px-3 py-2"
		>
			{#each slides as _slide, i (i)}
				<button
					type="button"
					aria-label={`Go to slide ${i + 1}`}
					aria-current={i === index}
					onclick={() => (index = i)}
					class="h-1.5 rounded-full transition-all duration-200 {i === index
						? 'w-5 bg-violet-300'
						: 'w-1.5 bg-white/25 hover:bg-white/45'}"
				></button>
			{/each}
		</div>
	{/if}
</div>
