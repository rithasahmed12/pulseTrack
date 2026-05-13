<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import { LOGIN_COPY } from '$lib/auth/copy';

	let { data } = $props();

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
	onSwitchToSignup={switchToSignup}
	onForgotPassword={forgotPassword}
/>
