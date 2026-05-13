<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import type {
		AddProfileModalState,
		Pagination,
		Platform,
		PlatformFilter,
		SortOption,
		TrackedProfile
	} from '@pulsetrack/shared-types';
	import TrackedProfilesView from '$lib/components/tracked/TrackedProfilesView.svelte';
	import { createBrowserSupabase } from '$lib/supabase/client';

	let { data } = $props();

	const supabase = createBrowserSupabase();

	// Subscribe to tracked_accounts UPDATE events for the current user so the
	// ProfileCard spinner stops live the moment the server flips scrape_status
	// back to 'idle' (or 'failed'). Without this the card stays in the scraping
	// state until the user hard-refreshes the page.
	$effect(() => {
		const userId = data.user?.id;
		if (!userId) return;
		const channel = supabase
			.channel(`tracked_accounts:${userId}`)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'tracked_accounts',
					filter: `user_id=eq.${userId}`
				},
				() => {
					void invalidateAll();
				}
			)
			.subscribe();
		return () => {
			void supabase.removeChannel(channel);
		};
	});

	let modal = $state<AddProfileModalState>({
		isOpen: false,
		inputValue: '',
		detectedPlatform: null,
		manualPlatform: 'instagram',
		isSubmitting: false
	});
	let addError = $state<string | null>(null);

	function detectPlatform(value: string): Platform | null {
		try {
			const url = new URL(value.startsWith('http') ? value : `https://${value}`);
			const host = url.hostname.replace(/^www\./, '');
			if (host === 'instagram.com') return 'instagram';
			if (host === 'tiktok.com' || host === 'vm.tiktok.com' || host === 'm.tiktok.com')
				return 'tiktok';
		} catch {
			// not a URL
		}
		return null;
	}

	function openModal() {
		modal = {
			isOpen: true,
			inputValue: '',
			detectedPlatform: null,
			manualPlatform: 'instagram',
			isSubmitting: false
		};
		addError = null;
	}

	function closeModal() {
		if (modal.isSubmitting) return;
		modal = { ...modal, isOpen: false };
	}

	function setModalInput(value: string) {
		modal = {
			...modal,
			inputValue: value,
			detectedPlatform: detectPlatform(value)
		};
	}

	function setManualPlatform(platform: Platform) {
		if (modal.detectedPlatform) return;
		modal = { ...modal, manualPlatform: platform };
	}

	async function submitAddProfile(input: { platform: Platform; username: string }) {
		modal = { ...modal, isSubmitting: true };
		addError = null;
		try {
			const fd = new FormData();
			fd.set('input', modal.inputValue || input.username);
			fd.set('platform', input.platform);
			const res = await fetch('?/add', { method: 'POST', body: fd });
			const payload = (await res.json()) as { type: string; status?: number; data?: string };
			if (payload.type === 'failure') {
				const arr = payload.data ? (JSON.parse(payload.data) as unknown[]) : [];
				const errMsg =
					typeof arr[arr.length - 1] === 'string' ? (arr[arr.length - 1] as string) : 'Unable to add profile.';
				addError = extractActionError(payload) ?? errMsg;
				modal = { ...modal, isSubmitting: false };
				return;
			}
			modal = { ...modal, isOpen: false, isSubmitting: false };
			await invalidateAll();
		} catch (err) {
			addError = err instanceof Error ? err.message : 'Unable to add profile.';
			modal = { ...modal, isSubmitting: false };
		}
	}

	function extractActionError(payload: { data?: string }): string | null {
		if (!payload.data) return null;
		try {
			const parsed = JSON.parse(payload.data) as unknown[];
			const head = parsed[1];
			if (head && typeof head === 'object' && 'error' in (head as Record<string, unknown>)) {
				const idx = (head as { error: number }).error;
				const val = parsed[idx];
				if (typeof val === 'string') return val;
			}
		} catch {
			// fall through
		}
		return null;
	}

	async function postAction(action: string, body: FormData) {
		try {
			const res = await fetch(`?/${action}`, { method: 'POST', body });
			if (!res.ok) {
				console.error(`Action ${action} failed`, await res.text());
			}
		} finally {
			await invalidateAll();
		}
	}

	function handleScrapeNow(id: string) {
		const fd = new FormData();
		fd.set('id', id);
		void postAction('scrape', fd);
	}

	function handleTogglePaused(id: string, nextIsActive: boolean) {
		const fd = new FormData();
		fd.set('id', id);
		fd.set('nextIsActive', String(nextIsActive));
		void postAction('pause', fd);
	}

	function handleRemove(id: string) {
		const fd = new FormData();
		fd.set('id', id);
		void postAction('remove', fd);
	}

	async function handlePurge(id: string, username: string, typed: string): Promise<boolean> {
		const fd = new FormData();
		fd.set('id', id);
		fd.set('confirm', typed);
		fd.set('expected', username);
		try {
			const res = await fetch('?/purge', { method: 'POST', body: fd });
			if (!res.ok) return false;
			await invalidateAll();
			return true;
		} catch {
			return false;
		}
	}

	function handleProfileClick(profile: TrackedProfile) {
		void goto(`/profile/${profile.platform}/${profile.username}`);
	}

	function updateFilter(
		patch: Partial<{ platform: PlatformFilter; sort: SortOption; search: string }>
	) {
		const params = new URLSearchParams(page.url.searchParams);
		if (patch.platform !== undefined) {
			if (patch.platform === 'all') params.delete('platform');
			else params.set('platform', patch.platform);
		}
		if (patch.sort !== undefined) {
			if (patch.sort === 'recently-added') params.delete('sort');
			else params.set('sort', patch.sort);
		}
		if (patch.search !== undefined) {
			const trimmed = patch.search.trim();
			if (!trimmed) params.delete('q');
			else params.set('q', trimmed);
		}
		// Any filter change resets to page 1.
		params.delete('page');
		void goto(`/tracked${params.toString() ? `?${params.toString()}` : ''}`, {
			keepFocus: true,
			noScroll: true
		});
	}

	function gotoPage(target: number) {
		const params = new URLSearchParams(page.url.searchParams);
		if (target <= 1) params.delete('page');
		else params.set('page', String(target));
		void goto(`/tracked${params.toString() ? `?${params.toString()}` : ''}`, {
			keepFocus: true,
			noScroll: false
		});
	}

	const filterControls = $derived({
		platform: data.filters.platform,
		sort: data.filters.sort,
		search: data.filters.search
	});
	const profiles = $derived(data.profiles as TrackedProfile[]);
	const pagination = $derived(data.pagination as Pagination);
</script>

<svelte:head>
	<title>Tracked profiles · PulseTrack</title>
</svelte:head>

<TrackedProfilesView
	trackedProfiles={profiles}
	{pagination}
	{filterControls}
	addProfileModalState={modal}
	addProfileError={addError}
	onAddProfileClick={openModal}
	onModalInputChange={setModalInput}
	onModalPlatformChange={setManualPlatform}
	onAddProfileSubmit={submitAddProfile}
	onAddProfileCancel={closeModal}
	onFilterChange={(filter) => updateFilter({ platform: filter })}
	onSortChange={(sort) => updateFilter({ sort })}
	onSearchChange={(query) => updateFilter({ search: query })}
	onPageChange={gotoPage}
	onProfileClick={handleProfileClick}
	onScrapeNow={handleScrapeNow}
	onTogglePaused={handleTogglePaused}
	onRemoveProfile={handleRemove}
	onPurgeProfile={handlePurge}
	onRetryScrape={handleScrapeNow}
/>
