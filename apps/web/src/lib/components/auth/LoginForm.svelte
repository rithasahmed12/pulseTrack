<script lang="ts">
	import { superForm, type SuperValidated, type Infer } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import Mail from '@lucide/svelte/icons/mail';
	import Lock from '@lucide/svelte/icons/lock';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import { loginSchema } from '$lib/auth/schemas';
	import type { AuthFormCopy } from '$lib/auth/types';
	import Field from './Field.svelte';
	import Checkbox from './Checkbox.svelte';
	import SubmitButton from './SubmitButton.svelte';

	interface Props {
		data: SuperValidated<Infer<typeof loginSchema>>;
		copy: AuthFormCopy;
		onForgotPassword?: () => void;
		onSwitchToSignup?: () => void;
	}

	let { data, copy, onForgotPassword, onSwitchToSignup }: Props = $props();

	// svelte-ignore state_referenced_locally
	const sf = superForm(data, {
		validators: zod4Client(loginSchema),
		validationMethod: 'onblur',
		resetForm: false,
		taintedMessage: null
	});
	const { form, errors, message, submitting, enhance } = sf;

	let showPassword = $state(false);
</script>

<form method="POST" use:enhance novalidate class="space-y-4">
	<div class="mb-2">
		<h2 class="text-[22px] font-semibold leading-tight tracking-tight text-slate-50">
			{copy.title}
		</h2>
		<p class="mt-1.5 text-[13.5px] leading-snug text-slate-400">{copy.subtitle}</p>
	</div>

	{#if $message}
		<div
			role="alert"
			class="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[12.5px] text-rose-200"
		>
			{$message}
		</div>
	{/if}

	<Field id="email" label="Email" error={$errors.email?.[0]}>
		{#snippet icon()}
			<Mail class="h-4 w-4" />
		{/snippet}
		<input
			id="email"
			name="email"
			type="email"
			autocomplete="email"
			inputmode="email"
			disabled={$submitting}
			bind:value={$form.email}
			placeholder="you@studio.co"
			class="h-10 w-full bg-transparent pl-10 pr-3 text-[14px] text-slate-100 placeholder:text-slate-600 outline-none"
		/>
	</Field>

	<Field id="password" label="Password" error={$errors.password?.[0]}>
		{#snippet icon()}
			<Lock class="h-4 w-4" />
		{/snippet}
		{#snippet action()}
			<button
				type="button"
				onclick={() => onForgotPassword?.()}
				class="text-[12px] text-slate-400 hover:text-violet-300"
			>
				Forgot password?
			</button>
		{/snippet}
		{#snippet trailing()}
			<button
				type="button"
				onclick={() => (showPassword = !showPassword)}
				aria-label={showPassword ? 'Hide password' : 'Show password'}
				tabindex={-1}
				class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-300"
			>
				{#if showPassword}
					<EyeOff class="h-4 w-4" />
				{:else}
					<Eye class="h-4 w-4" />
				{/if}
			</button>
		{/snippet}
		<input
			id="password"
			name="password"
			type={showPassword ? 'text' : 'password'}
			autocomplete="current-password"
			disabled={$submitting}
			bind:value={$form.password}
			placeholder="••••••••"
			class="h-10 w-full bg-transparent pl-10 pr-11 text-[14px] text-slate-100 placeholder:text-slate-600 outline-none"
		/>
	</Field>

	<label class="flex cursor-pointer select-none items-center gap-2.5 text-[13px] text-slate-300">
		<Checkbox name="remember" bind:checked={$form.remember} disabled={$submitting} />
		Keep me signed in
	</label>

	<SubmitButton submitting={$submitting} idleLabel={copy.submitLabel} loadingLabel={copy.loadingLabel} />

	<p class="pt-1 text-center text-[13px] text-slate-400">
		{copy.footerPrompt}
		<button
			type="button"
			onclick={() => onSwitchToSignup?.()}
			class="font-medium text-violet-300 hover:text-violet-200"
		>
			{copy.footerLink}
		</button>
	</p>
</form>
