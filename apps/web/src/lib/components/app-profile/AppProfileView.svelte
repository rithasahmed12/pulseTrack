<script lang="ts">
	import Link2 from '@lucide/svelte/icons/link-2';
	import type {
		AppUser,
		AppUserDraft,
		Connection,
		Platform,
		WorkspaceStat
	} from '@pulsetrack/shared-types';
	import IdentityCard from './IdentityCard.svelte';
	import WorkspaceStatTile from './WorkspaceStatTile.svelte';
	import ConnectionCard from './ConnectionCard.svelte';

	interface Props {
		user: AppUser;
		draft: AppUserDraft;
		isDirty: boolean;
		isSaving: boolean;
		stats: WorkspaceStat[];
		connections: Connection[];
		onDisplayNameChange?: (value: string) => void;
		onBioChange?: (value: string) => void;
		onAvatarChange?: (file: File) => void;
		onSave?: () => void;
		onDiscard?: () => void;
		onConnectClick?: (platform: Platform) => void;
		onDisconnectClick?: (platform: Platform) => void;
	}

	let {
		user,
		draft,
		isDirty,
		isSaving,
		stats,
		connections,
		onDisplayNameChange,
		onBioChange,
		onAvatarChange,
		onSave,
		onDiscard,
		onConnectClick,
		onDisconnectClick
	}: Props = $props();
</script>

<div class="space-y-6">
	<header>
		<p class="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
			Workspace · Profile
		</p>
		<h1 class="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-slate-50">
			Your profile
		</h1>
		<p class="mt-0.5 text-[13px] text-slate-400">
			How you appear inside PulseTrack — plus the creator accounts linked to this workspace.
		</p>
	</header>

	<IdentityCard
		{user}
		{draft}
		{isDirty}
		{isSaving}
		{onDisplayNameChange}
		{onBioChange}
		{onAvatarChange}
		{onSave}
		{onDiscard}
	/>

	<section class="grid grid-cols-1 gap-3 sm:grid-cols-3">
		{#each stats as stat (stat.id)}
			<WorkspaceStatTile {stat} />
		{/each}
	</section>

	<section>
		<div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
			<div class="flex items-baseline gap-2">
				<Link2 class="h-3.5 w-3.5 self-center text-cyan-300" strokeWidth={1.8} />
				<h2 class="text-[14px] font-semibold tracking-tight text-slate-100">Connected accounts</h2>
			</div>
			<p class="text-[12px] text-slate-500">
				Link your own creator accounts to unlock first-party analytics.
			</p>
		</div>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			{#each connections as c (c.platform)}
				<ConnectionCard
					connection={c}
					onConnectClick={() => onConnectClick?.(c.platform)}
					onDisconnectClick={() => onDisconnectClick?.(c.platform)}
				/>
			{/each}
		</div>
	</section>
</div>
