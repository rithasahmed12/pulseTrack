<script lang="ts">
	import { onMount } from 'svelte';
	import UserCircle2 from '@lucide/svelte/icons/user-circle-2';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import LogOut from '@lucide/svelte/icons/log-out';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import type { UserMenuUser } from './types';

	interface Props {
		user: UserMenuUser;
		variant?: 'header' | 'sidebar';
		collapsed?: boolean;
		onNavigate?: (href: string) => void;
		onLogout?: () => void;
	}

	let {
		user,
		variant = 'header',
		collapsed = false,
		onNavigate,
		onLogout
	}: Props = $props();

	let open = $state(false);
	let rootEl: HTMLDivElement | undefined = $state();

	const initials = $derived(
		user.name
			.split(' ')
			.map((p) => p[0])
			.filter(Boolean)
			.slice(0, 2)
			.join('')
			.toUpperCase()
	);
	const firstName = $derived(user.name.split(' ')[0]);

	onMount(() => {
		function handleClick(e: MouseEvent) {
			if (!open) return;
			if (!rootEl?.contains(e.target as Node)) open = false;
		}
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') open = false;
		}
		document.addEventListener('mousedown', handleClick);
		document.addEventListener('keydown', handleKey);
		return () => {
			document.removeEventListener('mousedown', handleClick);
			document.removeEventListener('keydown', handleKey);
		};
	});

	function navigate(href: string) {
		open = false;
		onNavigate?.(href);
	}

	function logout() {
		open = false;
		onLogout?.();
	}

	const sidebarPos = $derived(collapsed ? 'right' : 'top');
</script>

{#snippet avatar(size: 'sm' | 'md')}
	{@const dim = size === 'sm' ? 'h-8 w-8 text-[11px]' : 'h-10 w-10 text-[12px]'}
	<span
		class="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500/80 to-cyan-400/80 font-semibold text-white shadow-[0_0_18px_-4px_rgba(124,58,237,0.6)] {dim}"
		aria-label={user.name}
	>
		{#if user.avatarUrl}
			<img src={user.avatarUrl} alt="" class="h-full w-full object-cover" />
		{:else}
			<span class="font-mono tracking-tight">{initials || '·'}</span>
		{/if}
		<span
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10"
		></span>
	</span>
{/snippet}

{#snippet dropdown(position: 'top' | 'right' | 'bottom-right')}
	{@const positionClass =
		position === 'top'
			? 'bottom-[calc(100%+8px)] left-0 right-0'
			: position === 'right'
				? 'left-[calc(100%+8px)] bottom-0 w-56'
				: 'right-0 top-[calc(100%+8px)] w-56'}
	<div
		role="menu"
		tabindex="-1"
		class="absolute z-50 overflow-hidden rounded-xl border border-[#252535] bg-[#13131E]/95 p-1 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl {positionClass}"
	>
		<button
			type="button"
			role="menuitem"
			onclick={() => navigate('/app-profile')}
			class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-slate-300 transition-colors duration-150 hover:bg-white/[0.04] hover:text-slate-100"
		>
			<span class="text-slate-500"><UserCircle2 class="h-4 w-4" /></span>
			<span>App profile</span>
		</button>
		<button
			type="button"
			role="menuitem"
			onclick={() => navigate('/settings')}
			class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-slate-300 transition-colors duration-150 hover:bg-white/[0.04] hover:text-slate-100"
		>
			<span class="text-slate-500"><SettingsIcon class="h-4 w-4" /></span>
			<span>Settings</span>
		</button>
		<div class="my-1 h-px bg-[#252535]"></div>
		<button
			type="button"
			role="menuitem"
			onclick={logout}
			class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-rose-300 transition-colors duration-150 hover:bg-rose-500/10 hover:text-rose-200"
		>
			<span class="text-rose-400"><LogOut class="h-4 w-4" /></span>
			<span>Log out</span>
		</button>
	</div>
{/snippet}

{#if variant === 'sidebar'}
	<div
		bind:this={rootEl}
		class="relative mx-2 mb-3 mt-1 {collapsed ? 'flex justify-center' : ''}"
	>
		<button
			type="button"
			onclick={() => (open = !open)}
			class="group flex w-full items-center gap-3 rounded-xl border border-[#1E1E2E] bg-[#0F0F18] p-2 text-left transition-all duration-200 hover:border-violet-500/30 hover:bg-[#13131E] {collapsed
				? 'w-auto justify-center p-1.5'
				: ''}"
		>
			{@render avatar('md')}
			{#if !collapsed}
				<div class="min-w-0 flex-1">
					<p class="truncate text-[13px] font-semibold text-slate-100">{user.name}</p>
					{#if user.handle}
						<p class="font-mono truncate text-[11px] text-slate-500">{user.handle}</p>
					{/if}
				</div>
				<ChevronDown
					class="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 group-hover:text-slate-300"
				/>
			{/if}
		</button>
		{#if open}
			{@render dropdown(sidebarPos)}
		{/if}
	</div>
{:else}
	<div bind:this={rootEl} class="relative">
		<button
			type="button"
			onclick={() => (open = !open)}
			aria-haspopup="menu"
			aria-expanded={open}
			class="group flex items-center gap-2 rounded-full border border-transparent p-1 pr-2 transition-all duration-200 hover:border-[#1E1E2E] hover:bg-white/[0.03]"
		>
			{@render avatar('sm')}
			<span class="hidden text-[13px] font-medium text-slate-200 sm:inline">{firstName}</span>
			<ChevronDown
				class="h-3.5 w-3.5 text-slate-500 transition-transform duration-200 group-hover:text-slate-300"
			/>
		</button>
		{#if open}
			{@render dropdown('bottom-right')}
		{/if}
	</div>
{/if}
