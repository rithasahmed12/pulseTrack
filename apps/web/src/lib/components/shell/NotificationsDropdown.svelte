<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Bell from '@lucide/svelte/icons/bell';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import Hash from '@lucide/svelte/icons/hash';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import CheckCheck from '@lucide/svelte/icons/check-check';
	import type {
		NotificationEventType,
		NotificationItem
	} from '@pulsetrack/shared-types';

	interface Props {
		items: NotificationItem[];
		unreadCount: number;
		onItemClick?: (item: NotificationItem) => void;
		onMarkAllRead?: () => void;
	}

	let { items, unreadCount, onItemClick, onMarkAllRead }: Props = $props();

	let open = $state(false);
	let panelRef: HTMLDivElement | undefined = $state();
	let buttonRef: HTMLButtonElement | undefined = $state();

	const ICONS: Record<NotificationEventType, typeof Sparkles> = {
		new_post: Sparkles,
		follower_spike: TrendingUp,
		trending_hashtag: Hash,
		scrape_complete: RefreshCw,
		scrape_failed: AlertTriangle
	};

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
	}

	function relativeTime(iso: string): string {
		const now = Date.now();
		const t = new Date(iso).getTime();
		if (!Number.isFinite(t)) return '';
		const diffSec = Math.max(0, Math.round((now - t) / 1000));
		if (diffSec < 60) return 'just now';
		const diffMin = Math.round(diffSec / 60);
		if (diffMin < 60) return `${diffMin}m ago`;
		const diffHr = Math.round(diffMin / 60);
		if (diffHr < 24) return `${diffHr}h ago`;
		const diffDay = Math.round(diffHr / 24);
		if (diffDay < 7) return `${diffDay}d ago`;
		return new Date(iso).toLocaleDateString();
	}

	function handleClickOutside(event: MouseEvent) {
		if (!open) return;
		const target = event.target as Node;
		if (panelRef?.contains(target) || buttonRef?.contains(target)) return;
		close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') close();
	}

	onMount(() => {
		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		}
	});

	function handleItem(item: NotificationItem) {
		close();
		onItemClick?.(item);
	}
</script>

<div class="relative">
	<button
		bind:this={buttonRef}
		type="button"
		onclick={toggle}
		aria-haspopup="dialog"
		aria-expanded={open}
		aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
		class="group relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-slate-100"
	>
		<Bell class="h-[18px] w-[18px]" strokeWidth={1.75} />
		{#if unreadCount > 0}
			<span
				class="absolute right-1.5 top-1.5 inline-flex h-2 w-2 rounded-full bg-rose-400"
				style="animation: pulse-soft 2.4s ease-in-out infinite;"
				aria-hidden="true"
			></span>
			<span
				class="font-mono absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500/90 px-1 text-[9px] font-semibold text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]"
			>
				{unreadCount > 9 ? '9+' : unreadCount}
			</span>
		{/if}
	</button>

	{#if open}
		<div
			bind:this={panelRef}
			role="dialog"
			aria-label="Notifications"
			class="absolute right-0 top-[calc(100%+8px)] z-50 w-[340px] max-w-[calc(100vw-24px)] origin-top-right overflow-hidden rounded-xl border border-[#252535] bg-[#0F0F18] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]"
		>
			<div class="flex items-center justify-between border-b border-[#1E1E2E] px-3.5 py-2.5">
				<div class="flex items-baseline gap-2">
					<p class="text-[13px] font-semibold tracking-tight text-slate-100">Notifications</p>
					{#if unreadCount > 0}
						<span class="font-mono text-[10.5px] uppercase tracking-[0.18em] text-rose-300/80">
							{unreadCount} unread
						</span>
					{/if}
				</div>
				<button
					type="button"
					onclick={() => onMarkAllRead?.()}
					disabled={unreadCount === 0}
					class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] text-slate-400 transition-colors duration-150 hover:bg-white/[0.04] hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
				>
					<CheckCheck class="h-3 w-3" strokeWidth={2} />
					Mark all read
				</button>
			</div>

			<div class="max-h-[400px] overflow-y-auto">
				{#if items.length === 0}
					<div class="px-4 py-10 text-center">
						<div
							class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#16161F] ring-1 ring-inset ring-[#1E1E2E]"
						>
							<Bell class="h-4 w-4 text-slate-500" strokeWidth={1.5} />
						</div>
						<p class="text-[13px] text-slate-300">You're all caught up</p>
						<p class="mt-1 text-[11.5px] text-slate-500">
							New activity from your tracked profiles shows up here.
						</p>
					</div>
				{:else}
					<ul class="divide-y divide-[#1E1E2E]">
						{#each items as item (item.id)}
							{@const Icon = ICONS[item.type] ?? Bell}
							{@const unread = item.readAt == null}
							{@const isFailure = item.type === 'scrape_failed'}
							<li>
								<button
									type="button"
									onclick={() => handleItem(item)}
									class="group flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-white/[0.03] {unread
										? isFailure
											? 'bg-rose-500/[0.05]'
											: 'bg-violet-500/[0.04]'
										: ''}"
								>
									<span
										class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg {unread
											? isFailure
												? 'bg-rose-500/15 text-rose-200'
												: 'bg-violet-500/15 text-violet-200'
											: 'bg-[#16161F] text-slate-400'}"
									>
										<Icon class="h-3.5 w-3.5" strokeWidth={1.8} />
									</span>
									<div class="min-w-0 flex-1">
										<p
											class="truncate text-[12.5px] leading-snug {unread
												? 'text-slate-100'
												: 'text-slate-300'}"
										>
											{item.message}
										</p>
										<p class="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-slate-500">
											{relativeTime(item.createdAt)}
											{#if item.profileUsername}
												<span class="text-slate-600"> · </span>
												<span class="text-slate-400">@{item.profileUsername}</span>
											{/if}
										</p>
									</div>
									{#if unread}
										<span
											aria-hidden="true"
											class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full {isFailure
												? 'bg-rose-400'
												: 'bg-violet-400'}"
										></span>
									{/if}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	{/if}
</div>
