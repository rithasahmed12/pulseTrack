<script lang="ts">
	import { onMount } from 'svelte';
	import Download from '@lucide/svelte/icons/download';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	interface Props {
		onClearCache?: () => void;
		onExportCsv?: () => void;
		onDeleteAccount?: () => void;
	}

	let { onClearCache, onExportCsv, onDeleteAccount }: Props = $props();

	let confirmingCache = $state(false);
	let deleteText = $state('');
	let exporting = $state(false);
	let cacheConfirmRef: HTMLDivElement | undefined = $state();

	onMount(() => {
		function onDocClick(e: MouseEvent) {
			if (!confirmingCache) return;
			if (!cacheConfirmRef?.contains(e.target as Node)) confirmingCache = false;
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') confirmingCache = false;
		}
		document.addEventListener('mousedown', onDocClick);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDocClick);
			document.removeEventListener('keydown', onKey);
		};
	});

	const canDelete = $derived(deleteText === 'DELETE');

	function handleExport() {
		exporting = true;
		onExportCsv?.();
		setTimeout(() => (exporting = false), 1400);
	}
</script>

<div class="space-y-5">
	<article
		class="flex flex-col gap-4 rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
	>
		<div class="flex items-start gap-3">
			<span
				aria-hidden="true"
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1E1E2E] bg-[#16161F] text-cyan-300"
			>
				<Download class="h-4 w-4" strokeWidth={1.8} />
			</span>
			<div class="min-w-0">
				<p class="text-[13.5px] font-medium tracking-tight text-slate-100">
					Export workspace as CSV
				</p>
				<p class="mt-0.5 text-[12.5px] leading-snug text-slate-400">
					A single CSV containing every tracked profile in your workspace.
				</p>
			</div>
		</div>
		<div class="sm:shrink-0">
			<button
				type="button"
				onclick={handleExport}
				disabled={exporting}
				class="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[12.5px] font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.55)] transition-colors duration-150 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
			>
				{#if exporting}
					<Loader2 class="h-3.5 w-3.5 animate-spin" />
					Preparing…
				{:else}
					<Download class="h-3.5 w-3.5" strokeWidth={1.8} />
					Export CSV
				{/if}
			</button>
		</div>
	</article>

	<article
		class="flex flex-col gap-4 rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
	>
		<div class="flex items-start gap-3">
			<span
				aria-hidden="true"
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1E1E2E] bg-[#16161F] text-amber-300"
			>
				<RefreshCw class="h-4 w-4" strokeWidth={1.8} />
			</span>
			<div class="min-w-0">
				<p class="text-[13.5px] font-medium tracking-tight text-slate-100">Clear scrape cache</p>
				<p class="mt-0.5 text-[12.5px] leading-snug text-slate-400">
					Resets recently-scraped state so the next refresh will refetch from Apify. Historical data
					in Supabase is unaffected.
				</p>
			</div>
		</div>
		<div class="sm:shrink-0">
			<div bind:this={cacheConfirmRef} class="relative">
				<button
					type="button"
					onclick={() => (confirmingCache = !confirmingCache)}
					class="inline-flex items-center gap-1.5 rounded-md border border-[#1E1E2E] bg-[#0F0F18] px-3 py-1.5 text-[12.5px] text-slate-300 transition-colors duration-150 hover:border-violet-500/30 hover:text-slate-100"
				>
					Clear cache
				</button>
				{#if confirmingCache}
					<div
						role="dialog"
						aria-label="Confirm clear cache"
						class="absolute bottom-[calc(100%+6px)] right-0 z-20 w-64 overflow-hidden rounded-lg border border-[#252535] bg-[#13131E] p-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
					>
						<p class="mb-2.5 text-[12px] leading-snug text-slate-300">
							Clear the scrape cache? The next dashboard load will refetch thumbnails and may be
							slightly slower.
						</p>
						<div class="flex justify-end gap-1.5">
							<button
								type="button"
								onclick={() => (confirmingCache = false)}
								class="rounded-md px-2 py-1 text-[12px] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
							>
								Cancel
							</button>
							<button
								type="button"
								onclick={() => {
									confirmingCache = false;
									onClearCache?.();
								}}
								class="rounded-md bg-amber-500/15 px-2 py-1 text-[12px] font-medium text-amber-200 hover:bg-amber-500/25"
							>
								Clear
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</article>

	<section class="relative overflow-hidden rounded-2xl border border-rose-500/25 bg-rose-500/[0.03] p-5">
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-x-0 top-0 h-px"
			style="background: linear-gradient(90deg, transparent, rgba(244,63,94,0.5), transparent);"
		></div>
		<header class="mb-4 flex items-start gap-3">
			<span
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200"
			>
				<AlertTriangle class="h-4 w-4" strokeWidth={1.8} />
			</span>
			<div>
				<h2 class="text-[15px] font-semibold tracking-tight text-rose-100">Danger zone</h2>
				<p class="mt-0.5 text-[12.5px] leading-snug text-rose-200/70">
					Deleting your account removes all tracked profiles, scraped posts, follower snapshots,
					and history. This cannot be undone.
				</p>
			</div>
		</header>

		<div class="space-y-3 border-t border-rose-500/15 pt-4">
			<label for="delete-confirm" class="block text-[12.5px] font-medium text-rose-100">
				Type
				<span class="font-mono rounded bg-rose-500/15 px-1 py-px text-rose-100">DELETE</span>
				to confirm
			</label>
			<div
				class="rounded-lg border bg-[#0A0A0F] transition-all duration-150 {canDelete
					? 'border-rose-500/60 shadow-[0_0_0_3px_rgba(244,63,94,0.18)]'
					: 'border-rose-500/15'}"
			>
				<input
					id="delete-confirm"
					type="text"
					autocomplete="off"
					spellcheck="false"
					value={deleteText}
					oninput={(e) => (deleteText = (e.currentTarget as HTMLInputElement).value)}
					placeholder="DELETE"
					class="font-mono h-10 w-full bg-transparent px-3 text-[14px] tracking-[0.18em] text-slate-100 placeholder:text-slate-700 outline-none"
				/>
			</div>
			<button
				type="button"
				onclick={() => onDeleteAccount?.()}
				disabled={!canDelete}
				class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors duration-150 {canDelete
					? 'bg-rose-500 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_-12px_rgba(244,63,94,0.6)] hover:bg-rose-400'
					: 'cursor-not-allowed border border-rose-500/20 bg-rose-500/[0.06] text-rose-300/60'}"
			>
				<Trash2 class="h-3.5 w-3.5" strokeWidth={2} />
				Delete account permanently
			</button>
		</div>
	</section>
</div>
