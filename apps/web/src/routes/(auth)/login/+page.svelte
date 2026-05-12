<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import { LOGIN_COPY, SOCIAL_PROVIDERS } from '$lib/auth/copy';
	import type { SocialProviderId } from '$lib/auth/types';

	let { data } = $props();

	function handleProvider(id: SocialProviderId) {
		const redirectTo = page.url.searchParams.get('redirectTo') ?? '/dashboard';
		void goto(`/auth/oauth/${id}?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	function switchToSignup() {
		const redirectTo = page.url.searchParams.get('redirectTo');
		void goto(redirectTo ? `/signup?redirectTo=${encodeURIComponent(redirectTo)}` : '/signup');
	}

	function forgotPassword() {
		void goto('/login');
	}
</script>

<svelte:head>
	<title>Sign in · PulseTrack</title>
</svelte:head>

<LoginForm
	data={data.form}
	copy={LOGIN_COPY}
	providers={SOCIAL_PROVIDERS}
	onProviderClick={handleProvider}
	onSwitchToSignup={switchToSignup}
	onForgotPassword={forgotPassword}
/>
