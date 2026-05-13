<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import Bell from '@lucide/svelte/icons/bell';
	import Menu from '@lucide/svelte/icons/menu';
	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';
	import MainNav from './MainNav.svelte';
	import UserMenu from './UserMenu.svelte';
	import type { NavItem, UserMenuUser } from './types';

	interface Props {
		children: Snippet;
		navigationItems?: NavItem[];
		user?: UserMenuUser;
		pageTitle?: string;
		pageEyebrow?: string;
		notificationCount?: number;
		onNavigate?: (href: string) => void;
		onSearch?: (query: string) => void;
		onLogout?: () => void;
	}

	const DEFAULT_NAV: NavItem[] = [
		{ label: 'Dashboard', href: '/dashboard', isActive: true },
		{ label: 'Posts', href: '/posts' },
		{ label: 'Trending', href: '/trending' },
		{ label: 'Tracked', href: '/tracked' },
		{ label: 'App Profile', href: '/app-profile' },
		{ label: 'Settings', href: '/settings' }
	];

	const DEFAULT_USER: UserMenuUser = { name: 'Analyst', handle: undefined };

	let {
		children,
		navigationItems = DEFAULT_NAV,
		user = DEFAULT_USER,
		pageTitle,
		pageEyebrow = 'Workspace',
		notificationCount = 0,
		onNavigate,
		onSearch,
		onLogout
	}: Props = $props();

	let collapsed = $state(false);
	let mobileOpen = $state(false);
	let mobileSearchOpen = $state(false);
	// svelte-ignore state_referenced_locally
	let searchValue = $state(page.url.searchParams.get('q') ?? '');
	let searchInputEl: HTMLInputElement | undefined = $state();
	let mobileSearchInputEl: HTMLInputElement | undefined = $state();

	$effect(() => {
		searchValue = page.url.searchParams.get('q') ?? '';
	});

	const activeItem = $derived(navigationItems.find((i) => i.isActive));
	const computedTitle = $derived(pageTitle ?? activeItem?.label ?? 'Dashboard');

	function handleNavigate(href: string) {
		mobileOpen = false;
		onNavigate?.(href);
	}

	function submitSearch(event: SubmitEvent) {
		event.preventDefault();
		mobileSearchOpen = false;
		onSearch?.(searchValue);
	}

	async function openMobileSearch() {
		mobileSearchOpen = true;
		await tick();
		mobileSearchInputEl?.focus();
	}

	function clearSearch() {
		searchValue = '';
		searchInputEl?.focus();
	}

	function handleSidebarSearchClick() {
		if (typeof window !== 'undefined' && window.innerWidth >= 768) {
			searchInputEl?.focus();
		} else {
			void openMobileSearch();
		}
	}

	$effect(() => {
		if (!mobileOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});

	onMount(() => {
		function onKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				if (typeof window !== 'undefined' && window.innerWidth < 768) {
					void openMobileSearch();
				} else {
					searchInputEl?.focus();
					searchInputEl?.select();
				}
			} else if (e.key === 'Escape' && mobileSearchOpen) {
				mobileSearchOpen = false;
			}
		}
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') document.body.style.overflow = '';
	});
</script>

<div
	class="relative min-h-screen overflow-hidden bg-[#0A0A0F] font-sans text-slate-200"
	style='font-feature-settings: "ss01", "cv11";'
>
	<div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
		<div
			class="absolute -left-32 -top-40 h-[480px] w-[480px] rounded-full bg-violet-600/15 blur-[140px]"
		></div>
		<div
			class="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[140px]"
		></div>
		<div
			class="absolute bottom-[-15%] left-[35%] h-[420px] w-[420px] rounded-full bg-fuchsia-600/[0.08] blur-[160px]"
		></div>
		<div
			class="absolute inset-0 opacity-[0.04] mix-blend-overlay"
			style="background-image:url(&quot;data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.6'/></svg>&quot;);"
		></div>
	</div>

	<div class="relative flex min-h-screen">
		<aside
			aria-label="Sidebar"
			class="hidden shrink-0 border-r border-[#1E1E2E] bg-[#0B0B12]/85 backdrop-blur-xl transition-[width] duration-300 ease-out lg:flex lg:flex-col {collapsed
				? 'lg:w-[68px]'
				: 'lg:w-[240px]'}"
		>
			<div class="flex h-full flex-col">
				<div class="flex-1 overflow-y-auto">
					<MainNav
						items={navigationItems}
						{collapsed}
						onToggleCollapsed={() => (collapsed = !collapsed)}
						onNavigate={handleNavigate}
						onSearchClick={handleSidebarSearchClick}
					/>
				</div>
				<div class="border-t border-[#1E1E2E]/70">
					<UserMenu
						{user}
						variant="sidebar"
						{collapsed}
						onNavigate={handleNavigate}
						{onLogout}
					/>
				</div>
			</div>
		</aside>

		{#if mobileOpen}
			<button
				type="button"
				aria-label="Close menu"
				onclick={() => (mobileOpen = false)}
				class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
			></button>
			<aside
				aria-label="Sidebar"
				class="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#1E1E2E] bg-[#0B0B12] backdrop-blur-xl lg:hidden"
			>
				<div class="flex-1 overflow-y-auto">
					<MainNav
					items={navigationItems}
					collapsed={false}
					onNavigate={handleNavigate}
					onSearchClick={handleSidebarSearchClick}
				/>
				</div>
				<div class="border-t border-[#1E1E2E]/70">
					<UserMenu
						{user}
						variant="sidebar"
						collapsed={false}
						onNavigate={handleNavigate}
						{onLogout}
					/>
				</div>
			</aside>
		{/if}

		<div class="relative flex min-w-0 flex-1 flex-col">
			<header
				class="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-[#1E1E2E] bg-[#0A0A0F]/75 px-4 backdrop-blur-xl sm:px-6"
			>
				<button
					type="button"
					aria-label="Open menu"
					onclick={() => (mobileOpen = true)}
					class="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-100 lg:hidden"
				>
					<Menu class="h-5 w-5" />
				</button>

				<div class="flex min-w-0 flex-1 items-center gap-4">
					<div class="hidden min-w-0 sm:block">
						<p class="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
							{pageEyebrow}
						</p>
						<h1 class="truncate text-[15px] font-semibold tracking-tight text-slate-100">
							{computedTitle}
						</h1>
					</div>

					<form
						role="search"
						onsubmit={submitSearch}
						class="relative ml-auto hidden w-full max-w-md md:block"
					>
						<Search
							class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
							aria-hidden="true"
						/>
						<input
							bind:this={searchInputEl}
							bind:value={searchValue}
							type="search"
							name="q"
							aria-label="Search posts"
							placeholder="Search posts by caption or hashtag…"
							class="h-9 w-full rounded-lg border border-[#1E1E2E] bg-[#0F0F18] pl-9 pr-14 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-[#13131E] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
						/>
						{#if searchValue}
							<button
								type="button"
								aria-label="Clear search"
								onclick={clearSearch}
								class="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-white/5 hover:text-slate-200"
							>
								<X class="h-3.5 w-3.5" />
							</button>
						{:else}
							<kbd
								class="font-mono pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-[#252535] bg-[#16161F] px-1.5 py-0.5 text-[10px] text-slate-500"
								>⌘K</kbd
							>
						{/if}
					</form>
				</div>

				<div class="flex items-center gap-1.5">
					<button
						type="button"
						aria-label="Search"
						onclick={openMobileSearch}
						class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-100 md:hidden"
					>
						<Search class="h-4 w-4" />
					</button>

					<button
						type="button"
						aria-label={`Notifications${notificationCount ? ` (${notificationCount} unread)` : ''}`}
						class="group relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-slate-100"
					>
						<Bell class="h-[18px] w-[18px]" strokeWidth={1.75} />
						{#if notificationCount > 0}
							<span
								class="absolute right-1.5 top-1.5 inline-flex h-2 w-2 rounded-full bg-rose-400"
								style="animation: pulse-soft 2.4s ease-in-out infinite;"
								aria-hidden="true"
							></span>
							<span
								class="font-mono absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500/90 px-1 text-[9px] font-semibold text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]"
							>
								{notificationCount > 9 ? '9+' : notificationCount}
							</span>
						{/if}
					</button>

					<div class="mx-1.5 hidden h-6 w-px bg-[#1E1E2E] sm:block"></div>

					<UserMenu {user} variant="header" onNavigate={handleNavigate} {onLogout} />
				</div>
			</header>

			{#if mobileSearchOpen}
				<div
					class="sticky top-16 z-20 border-b border-[#1E1E2E] bg-[#0A0A0F]/95 px-4 py-2 backdrop-blur-xl md:hidden"
				>
					<form role="search" onsubmit={submitSearch} class="relative flex items-center gap-2">
						<Search
							class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
							aria-hidden="true"
						/>
						<input
							bind:this={mobileSearchInputEl}
							bind:value={searchValue}
							type="search"
							name="q"
							aria-label="Search posts"
							placeholder="Search posts by caption or hashtag…"
							class="h-9 w-full rounded-lg border border-[#1E1E2E] bg-[#0F0F18] pl-9 pr-3 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-violet-500/50 focus:bg-[#13131E] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
						/>
						<button
							type="button"
							aria-label="Close search"
							onclick={() => (mobileSearchOpen = false)}
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-100"
						>
							<X class="h-4 w-4" />
						</button>
					</form>
				</div>
			{/if}

			<main class="relative flex-1 overflow-y-auto">
				<div class="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
					{@render children()}
				</div>
			</main>
		</div>
	</div>
</div>
