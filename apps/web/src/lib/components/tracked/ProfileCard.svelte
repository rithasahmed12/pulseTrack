<script lang="ts">
	import { onMount } from 'svelte';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Users from '@lucide/svelte/icons/users';
	import ImageIcon from '@lucide/svelte/icons/image';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import type { TrackedProfile } from '@pulsetrack/shared-types';

	interface Props {
		profile: TrackedProfile;
		onCardClick?: () => void;
		onScrapeNow?: () => void;
		onTogglePaused?: (nextIsActive: boolean) => void;
		onRemove?: () => void;
		onPurge?: (typed: string) => Promise<boolean>;
		onRetryScrape?: () => void;
	}

	let {
		profile,
		onCardClick,
		onScrapeNow,
		onTogglePaused,
		onRemove,
		onPurge,
		onRetryScrape
	}: Props = $props();

	let confirmingDelete = $state(false);
	let confirmRef: HTMLDivElement | undefined = $state();
	let typedConfirm = $state('');
	let purging = $state(false);
	let purgeError = $state<string | null>(null);

	const paused = $derived(!profile.isActive);
	const failed = $derived(profile.scrapeStatus === 'failed');
	const scraping = $derived(profile.scrapeStatus === 'scraping');
	const engagementTierValue = $derived(engagementTier(profile.engagementRate));
	const canPurge = $derived(typedConfirm === profile.username);

	function resetConfirm() {
		confirmingDelete = false;
		typedConfirm = '';
		purging = false;
		purgeError = null;
	}

	async function submitPurge() {
		if (!canPurge || purging) return;
		purging = true;
		purgeError = null;
		const ok = (await onPurge?.(typedConfirm)) ?? false;
		if (!ok) {
			purging = false;
			purgeError = 'Delete failed — try again.';
			return;
		}
		// Card will unmount when the page invalidates and the row is gone.
		resetConfirm();
	}

	onMount(() => {
		function onDocClick(e: MouseEvent) {
			if (!confirmingDelete) return;
			if (!confirmRef?.contains(e.target as Node)) resetConfirm();
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') resetConfirm();
		}
		document.addEventListener('mousedown', onDocClick);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDocClick);
			document.removeEventListener('keydown', onKey);
		};
	});

	function handleCardKey(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onCardClick?.();
		}
	}

	function formatCount(n: number): string {
		if (n >= 1_000_000)
			return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '') + 'M';
		if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '') + 'K';
		return String(n);
	}

	function formatRelative(iso: string): string {
		const then = new Date(iso).getTime();
		const now = Date.now();
		const diff = Math.max(0, now - then);
		const m = Math.floor(diff / 60_000);
		if (m < 1) return 'just now';
		if (m < 60) return `${m}m ago`;
		const h = Math.floor(m / 60);
		if (h < 24) return `${h}h ago`;
		const d = Math.floor(h / 24);
		if (d < 30) return `${d}d ago`;
		const mo = Math.floor(d / 30);
		return `${mo}mo ago`;
	}

	function engagementTier(rate: number): 'hot' | 'mid' | 'low' {
		return rate >= 7 ? 'hot' : rate >= 4 ? 'mid' : 'low';
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<article
	onclick={() => onCardClick?.()}
	onkeydown={handleCardKey}
	role="button"
	tabindex="0"
	aria-label={`Open profile for ${profile.displayName} on ${profile.platform}`}
	class="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-[#0F0F18] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] {failed
		? 'border-rose-500/30'
		: paused
			? 'border-amber-500/25'
			: 'border-[#1E1E2E]'} {paused ? 'opacity-90' : ''}"
>
	<span
		aria-hidden="true"
		class="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-200 group-hover:opacity-100"
		style="background: linear-gradient(90deg, transparent, rgba(124,58,237,0.55), rgba(6,182,212,0.45), transparent);"
	></span>

	<div class="flex items-start gap-3 p-4">
		<!-- avatar -->
		<div class="relative shrink-0">
			<div
				class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#16161F] ring-1 ring-inset ring-white/5 {scraping
					? 'card-pulse-ring'
					: ''}"
			>
				{#if profile.avatarUrl}
					<img
						src={profile.avatarUrl}
						alt=""
						class="h-full w-full object-cover"
						loading="lazy"
						referrerpolicy="no-referrer"
					/>
				{:else}
					<span class="font-mono text-[12px] text-slate-500">{profile.username[0]?.toUpperCase()}</span>
				{/if}
			</div>
			{#if profile.platform === 'instagram'}
				<span
					aria-label="Instagram"
					class="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#E1306C] to-[#F77737] ring-2 ring-[#0F0F18]"
				>
					<svg class="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.07 1.25.07 1.63.07 4.85s-.02 3.6-.09 4.85c-.05 1.17-.25 1.8-.41 2.22a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.25.07-1.65.07-4.85.07s-3.6-.02-4.85-.09c-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.17 15.6 2.15 15.22 2.15 12s.02-3.6.09-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.4 2.17 8.78 2.15 12 2.2zm0 4.85a4.95 4.95 0 1 0 0 9.9 4.95 4.95 0 0 0 0-9.9zm0 1.8a3.15 3.15 0 1 1 0 6.3 3.15 3.15 0 0 1 0-6.3zm5.1-2.04a1.16 1.16 0 1 1 0 2.32 1.16 1.16 0 0 1 0-2.32z"
						/>
					</svg>
				</span>
			{:else}
				<span
					aria-label="TikTok"
					class="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black ring-2 ring-[#0F0F18]"
				>
					<svg class="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M19.6 7.3a6.4 6.4 0 0 1-4.1-1.5v8.6a5.3 5.3 0 1 1-4.7-5.3v2.2a3.1 3.1 0 1 0 2.5 3v-11h2.3a4.1 4.1 0 0 0 4 3.6v0z"
						/>
					</svg>
				</span>
			{/if}
		</div>

		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-1.5">
				<h3 class="truncate text-[14.5px] font-semibold tracking-tight text-slate-50">
					{profile.displayName}
				</h3>
				{#if profile.isNew}
					<span
						class="inline-flex shrink-0 items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-[1px] text-[9.5px] font-medium uppercase tracking-wider text-cyan-200"
						aria-label="Newly added"
					>
						<Sparkles class="h-2.5 w-2.5" strokeWidth={2} />
						New
					</span>
				{/if}
			</div>
			<p class="truncate text-[12.5px] text-slate-500">@{profile.username}</p>
		</div>

		<div
			role="presentation"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			class="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity duration-200 sm:opacity-60 sm:group-hover:opacity-100"
		>
			<button
				type="button"
				onclick={() => onScrapeNow?.()}
				disabled={scraping}
				aria-label={scraping ? 'Scrape in progress' : 'Scrape now'}
				title={scraping ? 'Scrape in progress' : 'Scrape now'}
				class="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-white/[0.05] hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
			>
				<RefreshCw class="h-3.5 w-3.5 {scraping ? 'animate-spin' : ''}" strokeWidth={1.8} />
			</button>
			<button
				type="button"
				onclick={() => onTogglePaused?.(paused)}
				aria-label={paused ? 'Resume monitoring' : 'Pause monitoring'}
				title={paused ? 'Resume monitoring' : 'Pause monitoring'}
				class="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-white/[0.05] hover:text-slate-100"
			>
				{#if paused}
					<Play class="h-3.5 w-3.5" strokeWidth={1.8} />
				{:else}
					<Pause class="h-3.5 w-3.5" strokeWidth={1.8} />
				{/if}
			</button>

			<div bind:this={confirmRef} class="relative">
				<button
					type="button"
					onclick={() => {
						if (confirmingDelete) resetConfirm();
						else confirmingDelete = true;
					}}
					aria-label="Delete permanently"
					title="Delete permanently"
					class="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-rose-500/10 hover:text-rose-200"
				>
					<Trash2 class="h-3.5 w-3.5" strokeWidth={1.8} />
				</button>
				{#if confirmingDelete}
					<div
						role="dialog"
						aria-label="Confirm permanent deletion"
						class="absolute right-0 top-[calc(100%+6px)] z-20 w-72 overflow-hidden rounded-lg border border-rose-500/30 bg-[#13131E] p-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
					>
						<header class="mb-2 flex items-start gap-2">
							<span
								class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-rose-500/15 text-rose-200"
							>
								<AlertTriangle class="h-3.5 w-3.5" strokeWidth={2} />
							</span>
							<div class="min-w-0">
								<p class="text-[13px] font-semibold tracking-tight text-rose-100">
									Delete permanently
								</p>
								<p class="mt-0.5 text-[11.5px] leading-snug text-rose-200/70">
									Removes the profile and all its posts, snapshots, and scrape history. Cannot be
									undone.
								</p>
							</div>
						</header>
						<label
							for={`purge-${profile.id}`}
							class="block text-[11.5px] leading-snug text-slate-300"
						>
							Type
							<span
								class="font-mono mx-0.5 rounded bg-rose-500/15 px-1 py-px text-rose-100"
							>@{profile.username}</span> to confirm
						</label>
						<input
							id={`purge-${profile.id}`}
							type="text"
							autocomplete="off"
							spellcheck="false"
							value={typedConfirm}
							oninput={(e) => (typedConfirm = (e.currentTarget as HTMLInputElement).value)}
							placeholder={profile.username}
							disabled={purging}
							class="font-mono mt-1.5 h-8 w-full rounded-md border bg-[#0A0A0F] px-2 text-[12.5px] tracking-[0.06em] text-slate-100 placeholder:text-slate-700 outline-none transition-colors duration-150 {canPurge
								? 'border-rose-500/50 shadow-[0_0_0_3px_rgba(244,63,94,0.15)]'
								: 'border-rose-500/15'}"
						/>
						{#if purgeError}
							<p role="alert" class="mt-1.5 text-[11px] text-rose-300">{purgeError}</p>
						{/if}
						<div class="mt-2.5 flex justify-end gap-1.5">
							<button
								type="button"
								onclick={resetConfirm}
								disabled={purging}
								class="rounded-md px-2 py-1 text-[12px] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onclick={submitPurge}
								disabled={!canPurge || purging}
								class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium transition-colors duration-150 {canPurge
									? 'bg-rose-500 text-white shadow-[0_8px_24px_-12px_rgba(244,63,94,0.6)] hover:bg-rose-400'
									: 'cursor-not-allowed border border-rose-500/20 bg-rose-500/[0.06] text-rose-300/60'}"
							>
								{#if purging}
									<Loader2 class="h-3 w-3 animate-spin" strokeWidth={2} />
									Deleting…
								{:else}
									Delete
								{/if}
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="px-4">
		<p class="line-clamp-2 min-h-[34px] text-[12.5px] leading-snug text-slate-400">
			{#if profile.bio}
				{profile.bio}
			{:else}
				<span class="italic text-slate-600">No bio</span>
			{/if}
		</p>
	</div>

	<div
		class="mt-3 grid grid-cols-3 gap-px overflow-hidden border-y border-[#1A1A24] bg-[#1A1A24]"
	>
		<div class="flex flex-col items-center bg-[#0F0F18] px-2 py-2.5">
			<span class="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
				<Users class="h-3 w-3 text-slate-600" />
				Followers
			</span>
			<span class="tabular-nums mt-0.5 text-[14px] font-medium text-slate-100">
				{formatCount(profile.followersCount)}
			</span>
		</div>
		<div class="flex flex-col items-center bg-[#0F0F18] px-2 py-2.5">
			<span class="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
				<UserPlus class="h-3 w-3 text-slate-600" />
				Following
			</span>
			<span class="tabular-nums mt-0.5 text-[14px] font-medium text-slate-100">
				{formatCount(profile.followingCount)}
			</span>
		</div>
		<div class="flex flex-col items-center bg-[#0F0F18] px-2 py-2.5">
			<span class="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-slate-500">
				<ImageIcon class="h-3 w-3 text-slate-600" />
				Posts
			</span>
			<span class="tabular-nums mt-0.5 text-[14px] font-medium text-slate-100">
				{formatCount(profile.postsCount)}
			</span>
		</div>
	</div>

	<div class="flex items-center justify-between gap-2 px-4 py-3">
		<span
			class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-medium {engagementTierValue ===
			'hot'
				? 'bg-violet-500/15 text-violet-200 ring-1 ring-inset ring-violet-500/25'
				: engagementTierValue === 'mid'
					? 'bg-cyan-500/10 text-cyan-200 ring-1 ring-inset ring-cyan-500/25'
					: 'bg-slate-700/30 text-slate-300 ring-1 ring-inset ring-slate-600/30'}"
		>
			<span
				aria-hidden="true"
				class="h-1.5 w-1.5 rounded-full {engagementTierValue === 'hot'
					? 'bg-violet-300'
					: engagementTierValue === 'mid'
						? 'bg-cyan-300'
						: 'bg-slate-400'}"
			></span>
			<span class="tabular-nums">{profile.engagementRate.toFixed(2)}%</span>
			<span class="text-[10px] uppercase tracking-wider opacity-70">eng</span>
		</span>

		{#if paused}
			<span class="inline-flex items-center gap-1 text-[11.5px] text-amber-200/90">
				<Pause class="h-3 w-3" strokeWidth={2} />
				Paused
			</span>
		{:else if scraping}
			<span class="inline-flex items-center gap-1 text-[11.5px] text-violet-200">
				<Loader2 class="h-3 w-3 animate-spin" strokeWidth={2} />
				Scraping…
			</span>
		{:else if failed}
			<span class="inline-flex items-center gap-1.5 text-[11.5px] text-rose-200">
				<AlertTriangle class="h-3 w-3" strokeWidth={2} />
				Failed
				<button
					type="button"
					onclick={(e) => {
						e.stopPropagation();
						onRetryScrape?.();
					}}
					class="ml-0.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-1.5 py-[1px] text-[10.5px] font-medium uppercase tracking-wider text-rose-100 hover:bg-rose-500/20"
				>
					Retry
				</button>
			</span>
		{:else}
			<span class="inline-flex items-center gap-1.5 text-[11.5px] text-slate-500">
				<span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-emerald-400/80"></span>
				{profile.lastScrapedAt ? formatRelative(profile.lastScrapedAt) : 'Awaiting first scrape'}
			</span>
		{/if}
	</div>
</article>

<style>
	@keyframes card-pulse-ring {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.45);
		}
		50% {
			box-shadow: 0 0 0 6px rgba(124, 58, 237, 0);
		}
	}
	.card-pulse-ring {
		animation: card-pulse-ring 1.8s ease-out infinite;
	}
</style>
