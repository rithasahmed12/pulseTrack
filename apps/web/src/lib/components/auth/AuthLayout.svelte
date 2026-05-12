<script lang="ts">
	import type { Snippet } from 'svelte';
	import AuthBranding from './AuthBranding.svelte';
	import type { BrandCopy, BrandStat, Quote } from '$lib/auth/types';

	interface Props {
		brand: BrandCopy;
		quote: Quote;
		stats: BrandStat[];
		children: Snippet;
	}

	let { brand, quote, stats, children }: Props = $props();
</script>

<div
	class="min-h-screen bg-[#0A0A0F] font-sans text-slate-200 lg:h-screen lg:overflow-hidden"
	style='font-feature-settings: "ss01", "cv11";'
>
	<div class="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-2">
		<div
			class="relative h-auto min-h-[260px] border-b border-[#1A1A24] lg:h-full lg:min-h-0 lg:border-b-0 lg:border-r"
		>
			<AuthBranding {brand} {quote} {stats} />
		</div>

		<div
			class="relative flex h-auto items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:h-full lg:overflow-y-auto lg:py-12"
		>
			<div class="w-full max-w-[400px]">
				{@render children()}
			</div>
		</div>
	</div>
</div>
