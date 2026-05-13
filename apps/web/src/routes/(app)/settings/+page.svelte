<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import type {
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
			description: 'Password.',
			icon: 'lock'
		},
		{
			id: 'notifications',
			label: 'Notifications',
			description: 'What pings you and when.',
			icon: 'bell'
		},
		{
			id: 'data',
			label: 'Data & Privacy',
			description: 'Export, cache, account deletion.',
			icon: 'shield'
		}
	];

	function tabFromHash(hash: string): SettingsTabId {
		const candidate = hash.replace(/^#/, '');
		if (candidate === 'security' || candidate === 'notifications' || candidate === 'data') {
			return candidate;
		}
		return 'security';
	}

	let activeTab = $state<SettingsTabId>(tabFromHash(page.url.hash));
	let saveError = $state<string | null>(null);
	let saveSuccess = $state<string | null>(null);

	$effect(() => {
		activeTab = tabFromHash(page.url.hash);
	});

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

	function handlePasswordSubmit(values: PasswordFormValues) {
		const fd = new FormData();
		fd.set('current', values.current);
		fd.set('next', values.next);
		void postAction('password', fd);
	}

	async function handleClearCache() {
		saveError = null;
		saveSuccess = null;
		try {
			if (typeof window !== 'undefined') {
				let removed = 0;
				try {
					removed += window.localStorage.length;
					window.localStorage.clear();
				} catch {
					// Storage access denied (private mode etc.) — fall through.
				}
				try {
					removed += window.sessionStorage.length;
					window.sessionStorage.clear();
				} catch {
					// Same as above.
				}
				if ('caches' in window) {
					try {
						const keys = await window.caches.keys();
						await Promise.all(keys.map((k) => window.caches.delete(k)));
					} catch {
						// CacheStorage not available — skip.
					}
				}
				await invalidateAll();
				saveSuccess =
					removed > 0
						? `Cleared in-browser cache (${removed} item${removed === 1 ? '' : 's'}) and reloaded server data.`
						: 'Cleared in-browser cache and reloaded server data.';
			}
		} catch (err) {
			saveError = err instanceof Error ? err.message : 'Failed to clear cache.';
		}
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
{#if saveSuccess}
	<p
		role="status"
		class="mb-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[12.5px] text-emerald-200"
	>
		{saveSuccess}
	</p>
{/if}

<SettingsView
	tabs={TABS}
	{activeTab}
	security={data.settings.security}
	notificationPreferences={data.settings.notifications}
	onTabChange={setTab}
	onPasswordSubmit={handlePasswordSubmit}
	onNotificationToggle={handleNotificationToggle}
	onClearCache={handleClearCache}
	onExportCsv={handleExportCsv}
	onDeleteAccount={handleDeleteAccount}
/>
