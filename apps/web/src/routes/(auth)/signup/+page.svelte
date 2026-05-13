<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import SignupForm from '$lib/components/auth/SignupForm.svelte';
	import { SIGNUP_COPY, LEGAL_LINKS } from '$lib/auth/copy';

	let { data } = $props();

	function switchToLogin() {
		const redirectTo = page.url.searchParams.get('redirectTo');
		void goto(redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : '/login');
	}
</script>

<svelte:head>
	<title>Create your workspace · PulseTrack</title>
</svelte:head>

<SignupForm data={data.form} copy={SIGNUP_COPY} legal={LEGAL_LINKS} onSwitchToLogin={switchToLogin} />
