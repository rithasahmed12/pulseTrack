<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import SignupForm from '$lib/components/auth/SignupForm.svelte';
	import { SIGNUP_COPY, SOCIAL_PROVIDERS, LEGAL_LINKS } from '$lib/auth/copy';
	import type { SocialProviderId } from '$lib/auth/types';

	let { data } = $props();

	function handleProvider(id: SocialProviderId) {
		const redirectTo = page.url.searchParams.get('redirectTo') ?? '/dashboard';
		void goto(`/auth/oauth/${id}?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	function switchToLogin() {
		const redirectTo = page.url.searchParams.get('redirectTo');
		void goto(redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : '/login');
	}
</script>

<svelte:head>
	<title>Create your workspace · PulseTrack</title>
</svelte:head>

<SignupForm
	data={data.form}
	copy={SIGNUP_COPY}
	providers={SOCIAL_PROVIDERS}
	legal={LEGAL_LINKS}
	onProviderClick={handleProvider}
	onSwitchToLogin={switchToLogin}
/>
