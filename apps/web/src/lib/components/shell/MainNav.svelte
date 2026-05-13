<script lang="ts">
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Images from '@lucide/svelte/icons/images';
	import Flame from '@lucide/svelte/icons/flame';
	import Users from '@lucide/svelte/icons/users';
	import UserCircle2 from '@lucide/svelte/icons/user-circle-2';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import ChevronsLeft from '@lucide/svelte/icons/chevrons-left';
	import ChevronsRight from '@lucide/svelte/icons/chevrons-right';
	import Search from '@lucide/svelte/icons/search';
	import type { Component } from 'svelte';
	import type { NavItem } from './types';

	interface Props {
		items: NavItem[];
		collapsed?: boolean;
		onToggleCollapsed?: () => void;
		onNavigate?: (href: string) => void;
		onSearchClick?: () => void;
	}

	let {
		items,
		collapsed = false,
		onToggleCollapsed,
		onNavigate,
		onSearchClick
	}: Props = $props();

	const ICONS: Record<string, Component> = {
		'/dashboard': LayoutDashboard,
		'/posts': Images,
		'/trending': Flame,
		'/tracked': Users,
		'/app-profile': UserCircle2,
		'/settings': SettingsIcon
	};

	const PRIMARY_HREFS = new Set(['/dashboard', '/posts', '/trending', '/tracked']);

	const groups = $derived.by(() => {
		const primary: NavItem[] = [];
		const secondary: NavItem[] = [];
		for (const item of items) {
			if (PRIMARY_HREFS.has(item.href)) primary.push(item);
			else secondary.push(item);
		}
		return { primary, secondary };
	});

	function navigate(e: MouseEvent, href: string) {
		e.preventDefault();
		onNavigate?.(href);
	}
</script>

{#snippet navLink(item: NavItem)}
	{@const Icon = ICONS[item.href] ?? LayoutDashboard}
	{@const active = !!item.isActive}
	<li class="relative">
		<a
			href={item.href}
			onclick={(e) => navigate(e, item.href)}
			aria-current={active ? 'page' : undefined}
			class="group relative flex items-center gap-3 rounded-lg px-2.5 py-2 transition-all duration-200 {active
				? 'bg-violet-500/10 text-violet-100 shadow-[0_0_24px_-8px_rgba(124,58,237,0.55)]'
				: 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-100'} {collapsed
				? 'justify-center'
				: ''}"
		>
			<span
				aria-hidden="true"
				class="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400 transition-opacity duration-200 {active
					? 'opacity-100'
					: 'opacity-0'}"
			></span>
			<Icon
				class="h-[18px] w-[18px] shrink-0 transition-colors duration-200 {active
					? 'text-violet-300'
					: 'text-slate-500 group-hover:text-slate-200'}"
				strokeWidth={active ? 2.2 : 1.75}
			/>
			{#if !collapsed}
				<span class="flex-1 truncate text-[13.5px] font-medium tracking-tight">{item.label}</span>
				{#if item.badge != null}
					<span
						class="font-mono rounded-md px-1.5 py-[1px] text-[10px] {active
							? 'bg-violet-500/25 text-violet-100'
							: 'bg-white/[0.04] text-slate-400'}"
					>
						{item.badge}
					</span>
				{/if}
			{:else}
				<span
					role="tooltip"
					class="pointer-events-none absolute left-[calc(100%+12px)] z-50 whitespace-nowrap rounded-md border border-[#252535] bg-[#16161F] px-2 py-1 text-[12px] text-slate-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
				>
					{item.label}
				</span>
			{/if}
		</a>
	</li>
{/snippet}

<nav aria-label="Primary" class="flex h-full flex-col">
	<div class="flex items-center justify-between px-3 pb-3 pt-4">
		<a
			href="/dashboard"
			onclick={(e) => navigate(e, '/dashboard')}
			class="group flex items-center gap-2.5 overflow-hidden"
		>
			<span
				class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_24px_rgba(124,58,237,0.45)]"
				aria-hidden="true"
			>
				<span class="absolute inset-[2px] rounded-[8px] bg-[#0A0A0F]"></span>
				<span
					class="relative h-2 w-2 rounded-full bg-gradient-to-br from-violet-300 to-cyan-300 shadow-[0_0_8px_rgba(124,58,237,0.9)]"
				></span>
			</span>
			<span
				class="flex flex-col leading-tight transition-all duration-200 {collapsed
					? 'pointer-events-none w-0 -translate-x-2 opacity-0'
					: 'w-auto opacity-100'}"
			>
				<span class="text-[15px] font-semibold tracking-tight text-slate-100">PulseTrack</span>
				<span class="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500"
					>v0.1 · beta</span
				>
			</span>
		</a>

		<button
			type="button"
			onclick={onToggleCollapsed}
			aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-slate-100 {collapsed
				? 'absolute right-2 top-4'
				: ''}"
		>
			{#if collapsed}
				<ChevronsRight class="h-4 w-4" />
			{:else}
				<ChevronsLeft class="h-4 w-4" />
			{/if}
		</button>
	</div>

	<div class="px-3 pb-3">
		<button
			type="button"
			onclick={onSearchClick}
			aria-label="Search posts"
			class="group flex w-full items-center gap-2.5 rounded-lg border border-[#1E1E2E] bg-[#0F0F18] px-2.5 py-2 text-left transition-all duration-200 hover:border-violet-500/40 hover:bg-[#13131E] {collapsed
				? 'justify-center'
				: ''}"
		>
			<Search class="h-4 w-4 shrink-0 text-slate-500 group-hover:text-slate-300" />
			{#if !collapsed}
				<span class="flex-1 text-[13px] text-slate-500">Search profiles, posts…</span>
				<kbd
					class="font-mono rounded border border-[#252535] bg-[#16161F] px-1.5 py-0.5 text-[10px] text-slate-500"
					>⌘K</kbd
				>
			{/if}
		</button>
	</div>

	<div class="px-3">
		{#if !collapsed}
			<p class="font-mono px-2 pb-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-600">
				Workspace
			</p>
		{/if}
		<ul class="flex flex-col gap-0.5">
			{#each groups.primary as item (item.href)}
				{@render navLink(item)}
			{/each}
		</ul>
	</div>

	<div class="flex-1"></div>

	<div class="px-3 pb-2">
		<div class="mx-2 mb-2 h-px bg-[#1E1E2E] {collapsed ? 'mx-3' : ''}"></div>
		{#if !collapsed}
			<p class="font-mono px-2 pb-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-600">
				Account
			</p>
		{/if}
		<ul class="flex flex-col gap-0.5">
			{#each groups.secondary as item (item.href)}
				{@render navLink(item)}
			{/each}
		</ul>
	</div>
</nav>
