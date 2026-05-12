<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type {
		AccentColorId,
		AccentOption,
		PasswordFormValues,
		SettingsTab,
		SettingsTabId
	} from '@pulsetrack/shared-types';
	import SettingsView from '$lib/components/settings/SettingsView.svelte';

	let { data } = $props();

	const TABS: SettingsTab[] = [
		{
			id: 'security',
			label: 'Security',
			description: 'Password and 2FA.',
			icon: 'lock'
		},
		{
			id: 'notifications',
			label: 'Notifications',
			description: 'What pings you and when.',
			icon: 'bell'
		},
		{
			id: 'appearance',
			label: 'Appearance',
			description: 'Accent and sidebar defaults.',
			icon: 'palette'
		},
		{
			id: 'data',
			label: 'Data & Privacy',
			description: 'Export, cache, account deletion.',
			icon: 'shield'
		}
	];
	const ACCENT_OPTIONS: AccentOption[] = [
		{ id: 'violet', label: 'Violet', hex: '#7C3AED' },
		{ id: 'cyan', label: 'Cyan', hex: '#06B6D4' },
		{ id: 'rose', label: 'Rose', hex: '#F43F5E' },
		{ id: 'amber', label: 'Amber', hex: '#F59E0B' }
	];

	function tabFromHash(hash: string): SettingsTabId {
		const candidate = hash.replace(/^#/, '');
		if (
			candidate === 'security' ||
			candidate === 'notifications' ||
			candidate === 'appearance' ||
			candidate === 'data'
		) {
			return candidate;
		}
		return 'security';
	}

	let activeTab = $state<SettingsTabId>(tabFromHash(page.url.hash));
	let saveError = $state<string | null>(null);

	$effect(() => {
		activeTab = tabFromHash(page.url.hash);
	});

	onMount(() => {
		applyAccent(data.settings.appearance.accentColor);
	});

	function applyAccent(accent: AccentColorId) {
		const hex = ACCENT_OPTIONS.find((o) => o.id === accent)?.hex;
		if (hex && typeof document !== 'undefined') {
			document.documentElement.style.setProperty('--accent-primary', hex);
		}
	}

	function setTab(id: SettingsTabId) {
		activeTab = id;
		void goto(`#${id}`, { keepFocus: true, noScroll: true, replaceState: true });
	}

	async function postAction(action: string, body: FormData) {
		saveError = null;
		const res = await fetch(`?/${action}`, { method: 'POST', body });
		if (!res.ok) {
			try {
				const payload = (await res.json()) as { data?: string };
				if (payload.data) {
					const parsed = JSON.parse(payload.data) as unknown[];
					const last = parsed.find((v) => typeof v === 'string');
					if (typeof last === 'string') saveError = last;
				}
			} catch {
				saveError = 'Request failed.';
			}
		}
		await invalidateAll();
	}

	function handleNotificationToggle(id: string, enabled: boolean) {
		const fd = new FormData();
		fd.set('id', id);
		fd.set('enabled', String(enabled));
		void postAction('notification', fd);
	}

	function handleAccentChange(accent: AccentColorId) {
		applyAccent(accent);
		const fd = new FormData();
		fd.set('accentColor', accent);
		void postAction('appearance', fd);
	}

	function handleSidebarToggle(collapsed: boolean) {
		const fd = new FormData();
		fd.set('sidebarStartsCollapsed', String(collapsed));
		void postAction('appearance', fd);
	}

	function handleTwoFactorToggle(enabled: boolean) {
		const fd = new FormData();
		fd.set('enabled', String(enabled));
		void postAction('twoFactor', fd);
	}

	function handleSetUp2FA() {
		saveError = 'Authenticator setup ships in a follow-up — the toggle is live and the flag is persisted.';
	}

	function handlePasswordSubmit(values: PasswordFormValues) {
		const fd = new FormData();
		fd.set('current', values.current);
		fd.set('next', values.next);
		void postAction('password', fd);
	}

	function handleClearCache() {
		saveError = 'No cache layer is configured in v0.1 — historical data is the source of truth.';
	}

	function handleExportCsv() {
		if (typeof window !== 'undefined') {
			window.location.href = '/settings/export.csv';
		}
	}

	async function handleDeleteAccount() {
		const fd = new FormData();
		fd.set('confirm', 'DELETE');
		const res = await fetch('?/deleteAccount', { method: 'POST', body: fd });
		if (res.redirected) {
			window.location.href = res.url;
			return;
		}
		if (!res.ok) {
			saveError = 'Account deletion failed.';
		}
	}
</script>

<svelte:head>
	<title>Settings · PulseTrack</title>
</svelte:head>

{#if saveError}
	<p
		role="alert"
		class="mb-4 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[12.5px] text-rose-200"
	>
		{saveError}
	</p>
{/if}

<SettingsView
	tabs={TABS}
	{activeTab}
	security={data.settings.security}
	notificationPreferences={data.settings.notifications}
	accentOptions={ACCENT_OPTIONS}
	appearance={data.settings.appearance}
	onTabChange={setTab}
	onPasswordSubmit={handlePasswordSubmit}
	onTwoFactorToggle={handleTwoFactorToggle}
	onSetUp2FAClick={handleSetUp2FA}
	onNotificationToggle={handleNotificationToggle}
	onAccentChange={handleAccentChange}
	onSidebarDefaultToggle={handleSidebarToggle}
	onClearCache={handleClearCache}
	onExportCsv={handleExportCsv}
	onDeleteAccount={handleDeleteAccount}
/>
