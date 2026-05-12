<script lang="ts">
	import { onDestroy } from 'svelte';
	import Link2 from '@lucide/svelte/icons/link-2';
	import AtSign from '@lucide/svelte/icons/at-sign';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import X from '@lucide/svelte/icons/x';
	import type { Platform, AddProfileModalState } from '@pulsetrack/shared-types';

	interface Props {
		modalState: AddProfileModalState;
		errorMessage?: string | null;
		onInputChange?: (value: string) => void;
		onPlatformChange?: (platform: Platform) => void;
		onSubmit?: (input: { platform: Platform; username: string }) => void;
		onCancel?: () => void;
	}

	let {
		modalState,
		errorMessage = null,
		onInputChange,
		onPlatformChange,
		onSubmit,
		onCancel
	}: Props = $props();

	let inputEl: HTMLInputElement | undefined = $state();

	function parseInput(value: string): { platform: Platform | null; username: string } {
		const v = value.trim();
		if (!v) return { platform: null, username: '' };
		try {
			const url = new URL(v.startsWith('http') ? v : `https://${v}`);
			const host = url.hostname.replace(/^www\./, '');
			const segs = url.pathname.split('/').filter(Boolean);
			if (host === 'instagram.com' && segs.length > 0) {
				return { platform: 'instagram', username: segs[0].replace(/^@/, '') };
			}
			if (host === 'tiktok.com' && segs.length > 0) {
				return { platform: 'tiktok', username: segs[0].replace(/^@/, '') };
			}
			if (host === 'vm.tiktok.com' || host === 'm.tiktok.com') {
				return { platform: 'tiktok', username: '' };
			}
		} catch {
			// not a URL
		}
		return { platform: null, username: v.replace(/^@/, '') };
	}

	const parsed = $derived(parseInput(modalState.inputValue));
	const isUrlDetected = $derived(!!parsed.platform || !!modalState.detectedPlatform);
	const effectivePlatform = $derived<Platform>(
		modalState.detectedPlatform ?? parsed.platform ?? modalState.manualPlatform
	);
	const effectiveUsername = $derived(parsed.username);
	const canSubmit = $derived(effectiveUsername.length > 0 && !modalState.isSubmitting);

	$effect(() => {
		if (!modalState.isOpen) return;
		inputEl?.focus();
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onCancel?.();
		}
		document.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = prev;
			document.removeEventListener('keydown', onKey);
		};
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') document.body.style.overflow = '';
	});

	function handleSubmit() {
		if (!canSubmit) return;
		onSubmit?.({ platform: effectivePlatform, username: effectiveUsername });
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSubmit();
		}
	}
</script>

{#if modalState.isOpen}
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="add-profile-title"
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
	>
		<button
			type="button"
			aria-label="Close"
			onclick={() => onCancel?.()}
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
		></button>

		<div
			class="relative w-full max-w-[460px] overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
		>
			<div
				aria-hidden="true"
				class="pointer-events-none absolute inset-x-0 top-0 h-px"
				style="background: linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(6,182,212,0.5), transparent);"
			></div>

			<div class="flex items-start justify-between gap-4 px-5 pb-2 pt-5">
				<div>
					<h2 id="add-profile-title" class="text-[16px] font-semibold tracking-tight text-slate-50">
						Track a new profile
					</h2>
					<p class="mt-0.5 text-[12.5px] text-slate-400">
						Paste an Instagram or TikTok URL — or type a username and pick the platform.
					</p>
				</div>
				<button
					type="button"
					onclick={() => onCancel?.()}
					aria-label="Close"
					class="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
				>
					<X class="h-4 w-4" strokeWidth={2} />
				</button>
			</div>

			<div class="px-5 py-3">
				<label
					for="add-profile-input"
					class="mb-1.5 block text-[12px] font-medium text-slate-300"
				>
					Profile URL or username
				</label>
				<div
					class="relative rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] transition-all duration-150 focus-within:border-violet-500/50 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
				>
					<span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
						{#if isUrlDetected}
							<Link2 class="h-4 w-4" strokeWidth={1.8} />
						{:else}
							<AtSign class="h-4 w-4" strokeWidth={1.8} />
						{/if}
					</span>
					<input
						bind:this={inputEl}
						id="add-profile-input"
						type="text"
						autocomplete="off"
						autocorrect="off"
						spellcheck="false"
						value={modalState.inputValue}
						placeholder="https://instagram.com/melodye.haus  ·  or  ·  melodye.haus"
						oninput={(e) => onInputChange?.((e.currentTarget as HTMLInputElement).value)}
						onkeydown={handleKey}
						disabled={modalState.isSubmitting}
						class="h-10 w-full bg-transparent pl-10 pr-3 text-[14px] text-slate-100 placeholder:text-slate-600 outline-none"
					/>
				</div>

				<div class="mt-2 flex items-center gap-2 text-[11.5px] text-slate-500">
					{#if modalState.inputValue}
						{#if effectiveUsername}
							<span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
							<span>
								Will track
								<span class="font-medium text-slate-200">@{effectiveUsername}</span>
								on
								<span class="font-medium text-slate-200"
									>{effectivePlatform === 'instagram' ? 'Instagram' : 'TikTok'}</span
								>
								{#if isUrlDetected}
									<span
										class="ml-1 rounded-sm bg-cyan-400/10 px-1 py-px text-[10px] uppercase tracking-wider text-cyan-300"
										>detected</span
									>
								{/if}
							</span>
						{:else}
							<span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
							Couldn't parse a username from that link.
						{/if}
					{:else}
						&nbsp;
					{/if}
				</div>
			</div>

			<div class="px-5 pb-4">
				<p class="mb-1.5 text-[12px] font-medium text-slate-300">
					Platform
					{#if isUrlDetected}
						<span class="ml-1.5 text-[11px] font-normal text-slate-500">· locked by URL</span>
					{/if}
				</p>
				<div class="grid grid-cols-2 gap-2">
					{#each ['instagram', 'tiktok'] as platform (platform)}
						{@const isIG = platform === 'instagram'}
						{@const active = effectivePlatform === platform}
						{@const locked = isUrlDetected}
						<button
							type="button"
							onclick={() => onPlatformChange?.(platform as Platform)}
							disabled={locked && !active}
							aria-pressed={active}
							class="group relative overflow-hidden rounded-lg border p-3 text-left transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#1E1E2E] {active
								? 'border-violet-500/40 bg-violet-500/[0.06]'
								: 'border-[#1E1E2E] bg-[#0A0A0F] hover:border-violet-500/25'}"
						>
							<div class="flex items-center gap-2.5">
								<span
									class="flex h-8 w-8 items-center justify-center rounded-md {isIG
										? 'bg-gradient-to-br from-[#E1306C] to-[#F77737]'
										: 'bg-black ring-1 ring-inset ring-white/10'}"
								>
									{#if isIG}
										<svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
											<path
												d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.07 1.25.07 1.63.07 4.85s-.02 3.6-.09 4.85c-.05 1.17-.25 1.8-.41 2.22a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.25.07-1.65.07-4.85.07s-3.6-.02-4.85-.09c-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.17 15.6 2.15 15.22 2.15 12s.02-3.6.09-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.4 2.17 8.78 2.15 12 2.2zm0 4.85a4.95 4.95 0 1 0 0 9.9 4.95 4.95 0 0 0 0-9.9zm0 1.8a3.15 3.15 0 1 1 0 6.3 3.15 3.15 0 0 1 0-6.3zm5.1-2.04a1.16 1.16 0 1 1 0 2.32 1.16 1.16 0 0 1 0-2.32z"
											/>
										</svg>
									{:else}
										<svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
											<path
												d="M19.6 7.3a6.4 6.4 0 0 1-4.1-1.5v8.6a5.3 5.3 0 1 1-4.7-5.3v2.2a3.1 3.1 0 1 0 2.5 3v-11h2.3a4.1 4.1 0 0 0 4 3.6v0z"
											/>
										</svg>
									{/if}
								</span>
								<div>
									<p class="text-[13px] font-medium text-slate-100">
										{isIG ? 'Instagram' : 'TikTok'}
									</p>
									<p class="font-mono text-[10.5px] uppercase tracking-wider text-slate-500">
										{isIG ? 'apify · instagram-scraper' : 'apify · tiktok-scraper'}
									</p>
								</div>
							</div>
							{#if active}
								<span
									aria-hidden="true"
									class="absolute right-2 top-2 inline-flex h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(124,58,237,0.7)]"
								></span>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			{#if errorMessage}
				<div class="px-5 pb-3">
					<p
						role="alert"
						class="rounded-md border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-[12px] text-rose-200"
					>
						{errorMessage}
					</p>
				</div>
			{/if}

			<div
				class="flex items-center justify-end gap-2 border-t border-[#1A1A24] bg-[#0B0B12] px-5 py-3"
			>
				<button
					type="button"
					onclick={() => onCancel?.()}
					disabled={modalState.isSubmitting}
					class="rounded-md px-3 py-1.5 text-[12.5px] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 disabled:opacity-50"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handleSubmit}
					disabled={!canSubmit}
					class="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[12.5px] font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.55)] transition-colors duration-150 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-violet-600"
				>
					{#if modalState.isSubmitting}
						<Loader2 class="h-3.5 w-3.5 animate-spin" />
						Adding…
					{:else}
						Add profile
						<ArrowRight class="h-3.5 w-3.5 opacity-70" />
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
