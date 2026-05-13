<script lang="ts">
	import type {
		NotificationPreference,
		PasswordFormValues,
		SecurityState,
		SettingsTab,
		SettingsTabId
	} from '@pulsetrack/shared-types';
	import SettingsNav from './SettingsNav.svelte';
	import SecurityPane from './SecurityPane.svelte';
	import NotificationsPane from './NotificationsPane.svelte';
	import DataPane from './DataPane.svelte';

	interface Props {
		tabs: SettingsTab[];
		activeTab: SettingsTabId;
		security: SecurityState;
		notificationPreferences: NotificationPreference[];
		onTabChange?: (tab: SettingsTabId) => void;
		onPasswordSubmit?: (values: PasswordFormValues) => void;
		onNotificationToggle?: (id: string, enabled: boolean) => void;
		onClearCache?: () => void;
		onExportCsv?: () => void;
		onDeleteAccount?: () => void;
	}

	let {
		tabs,
		activeTab,
		security,
		notificationPreferences,
		onTabChange,
		onPasswordSubmit,
		onNotificationToggle,
		onClearCache,
		onExportCsv,
		onDeleteAccount
	}: Props = $props();

	const tab = $derived(tabs.find((t) => t.id === activeTab) ?? tabs[0]);
</script>

<div class="space-y-6">
	<header>
		<p class="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
			Workspace · Settings
		</p>
		<h1 class="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-slate-50">
			Settings
		</h1>
		<p class="mt-0.5 text-[13px] text-slate-400">
			Tune your workspace — security, notifications, and data controls.
		</p>
	</header>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
		<SettingsNav {tabs} {activeTab} {onTabChange} />

		<div class="min-w-0">
			<div class="mb-4 hidden lg:block">
				<h2 class="text-[16px] font-semibold tracking-tight text-slate-100">{tab.label}</h2>
				<p class="mt-0.5 text-[12.5px] text-slate-500">{tab.description}</p>
			</div>

			{#key activeTab}
				<div style="animation: pane-rise 0.25s ease-out both;">
					{#if activeTab === 'security'}
						<SecurityPane {security} {onPasswordSubmit} />
					{:else if activeTab === 'notifications'}
						<NotificationsPane
							preferences={notificationPreferences}
							onToggle={onNotificationToggle}
						/>
					{:else}
						<DataPane {onClearCache} {onExportCsv} {onDeleteAccount} />
					{/if}
				</div>
			{/key}
		</div>
	</div>
</div>

<style>
	@keyframes pane-rise {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
