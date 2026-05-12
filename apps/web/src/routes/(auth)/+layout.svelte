<script lang="ts">
	import AuthLayout from '$lib/components/auth/AuthLayout.svelte';
	import { AUTH_BRAND, AUTH_QUOTE, AUTH_STATS } from '$lib/auth/copy';

	let { children } = $props();
</script>

<AuthLayout brand={AUTH_BRAND} quote={AUTH_QUOTE} stats={AUTH_STATS}>
	{@render children()}
</AuthLayout>
