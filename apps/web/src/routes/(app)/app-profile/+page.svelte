<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import type {
		AppUser,
		AppUserDraft,
		Connection,
		Platform,
		WorkspaceStat
	} from '@pulsetrack/shared-types';
	import AppProfileView from '$lib/components/app-profile/AppProfileView.svelte';
	import { createBrowserSupabase } from '$lib/supabase/client';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	let user = $state<AppUser>(data.profile.user);
	// svelte-ignore state_referenced_locally
	let stats = $state<WorkspaceStat[]>(data.profile.stats);
	// svelte-ignore state_referenced_locally
	let connections = $state<Connection[]>(data.profile.connections);
	// svelte-ignore state_referenced_locally
	let draft = $state<AppUserDraft>({
		displayName: data.profile.user.displayName,
		bio: data.profile.user.bio,
		avatarUrl: data.profile.user.avatarUrl
	});
	let isSaving = $state(false);
	let saveError = $state<string | null>(null);

	$effect(() => {
		user = data.profile.user;
		stats = data.profile.stats;
		connections = data.profile.connections;
		draft = {
			displayName: data.profile.user.displayName,
			bio: data.profile.user.bio,
			avatarUrl: data.profile.user.avatarUrl
		};
	});

	const isDirty = $derived(
		draft.displayName !== user.displayName ||
			draft.bio !== user.bio ||
			draft.avatarUrl !== user.avatarUrl
	);

	let supabase: ReturnType<typeof createBrowserSupabase> | null = null;
	onMount(() => {
		supabase = createBrowserSupabase();
	});

	async function handleAvatarChange(file: File) {
		if (!supabase) return;
		saveError = null;
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === 'string') draft = { ...draft, avatarUrl: reader.result };
		};
		reader.readAsDataURL(file);

		const ext = (file.name.split('.').pop() ?? 'png').toLowerCase();
		const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : 'png';
		const path = `avatars/${user.id}/${Date.now()}.${safeExt}`;
		const { error: uploadError } = await supabase.storage
			.from('media')
			.upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
		if (uploadError) {
			saveError = `Avatar upload failed: ${uploadError.message}`;
			draft = { ...draft, avatarUrl: user.avatarUrl };
			return;
		}
		const { data: publicData } = supabase.storage.from('media').getPublicUrl(path);
		draft = { ...draft, avatarUrl: publicData.publicUrl };
	}

	async function handleSave() {
		if (!isDirty || isSaving) return;
		isSaving = true;
		saveError = null;
		try {
			const fd = new FormData();
			fd.set('displayName', draft.displayName);
			fd.set('bio', draft.bio);
			fd.set('avatarUrl', draft.avatarUrl);
			const res = await fetch('?/save', { method: 'POST', body: fd });
			if (!res.ok) {
				saveError = 'Save failed.';
			}
			await invalidateAll();
		} finally {
			isSaving = false;
		}
	}

	function handleDiscard() {
		draft = {
			displayName: user.displayName,
			bio: user.bio,
			avatarUrl: user.avatarUrl
		};
		saveError = null;
	}

	function handleConnect(_platform: Platform) {
		// OAuth flows are post-MVP.
	}

	function handleDisconnect(_platform: Platform) {
		// OAuth flows are post-MVP.
	}
</script>

<svelte:head>
	<title>Profile · PulseTrack</title>
</svelte:head>

{#if saveError}
	<p
		role="alert"
		class="mb-4 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[12.5px] text-rose-200"
	>
		{saveError}
	</p>
{/if}

<AppProfileView
	{user}
	{draft}
	{isDirty}
	{isSaving}
	{stats}
	{connections}
	onDisplayNameChange={(v) => (draft = { ...draft, displayName: v })}
	onBioChange={(v) => (draft = { ...draft, bio: v })}
	onAvatarChange={handleAvatarChange}
	onSave={handleSave}
	onDiscard={handleDiscard}
	onConnectClick={handleConnect}
	onDisconnectClick={handleDisconnect}
/>
