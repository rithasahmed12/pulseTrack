<script lang="ts">
	import { superForm, type SuperValidated, type Infer } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import Mail from '@lucide/svelte/icons/mail';
	import Lock from '@lucide/svelte/icons/lock';
	import User from '@lucide/svelte/icons/user';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import { signupSchema } from '$lib/auth/schemas';
	import type { AuthFormCopy, LegalLinks } from '$lib/auth/types';
	import Field from './Field.svelte';
	import Checkbox from './Checkbox.svelte';
	import SubmitButton from './SubmitButton.svelte';

	interface Props {
		data: SuperValidated<Infer<typeof signupSchema>>;
		copy: AuthFormCopy;
		legal: LegalLinks;
		onSwitchToLogin?: () => void;
	}

	let { data, copy, legal, onSwitchToLogin }: Props = $props();

	// svelte-ignore state_referenced_locally
	const sf = superForm(data, {
		validators: zod4Client(signupSchema),
		validationMethod: 'onblur',
		resetForm: false,
		taintedMessage: null
	});
	const { form, errors, message, submitting, enhance } = sf;

	let showPassword = $state(false);

	const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Strong', 'Excellent'] as const;
	const STRENGTH_COLORS = [
		'bg-slate-700',
		'bg-rose-500',
		'bg-amber-500',
		'bg-cyan-500',
		'bg-emerald-500'
	] as const;

	const strength = $derived.by(() => {
		const pw = $form.password ?? '';
		if (!pw) return { score: 0 as 0 | 1 | 2 | 3 | 4, label: STRENGTH_LABELS[0] };
		let score = 0;
		if (pw.length >= 8) score++;
		if (/[A-Z]/.test(pw)) score++;
		if (/[0-9]/.test(pw)) score++;
		if (/[^A-Za-z0-9]/.test(pw)) score++;
		return {
			score: score as 0 | 1 | 2 | 3 | 4,
			label: STRENGTH_LABELS[score as 0 | 1 | 2 | 3 | 4]
		};
	});
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

	<Field id="name" label="Display name" error={$errors.name?.[0]}>
		{#snippet icon()}
			<User class="h-4 w-4" />
		{/snippet}
		<input
			id="name"
			name="name"
			type="text"
			autocomplete="name"
			disabled={$submitting}
			bind:value={$form.name}
			placeholder="Alex Morgan"
			class="h-10 w-full bg-transparent pl-10 pr-3 text-[14px] text-slate-100 placeholder:text-slate-600 outline-none"
		/>
	</Field>

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

	<div>
		<Field id="password" label="Password" error={$errors.password?.[0]}>
			{#snippet icon()}
				<Lock class="h-4 w-4" />
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
				autocomplete="new-password"
				disabled={$submitting}
				bind:value={$form.password}
				placeholder="At least 8 characters"
				class="h-10 w-full bg-transparent pl-10 pr-11 text-[14px] text-slate-100 placeholder:text-slate-600 outline-none"
			/>
		</Field>
		{#if ($form.password?.length ?? 0) > 0}
			<div class="mt-2 flex items-center gap-2">
				<div class="flex flex-1 gap-1">
					{#each [0, 1, 2, 3] as i (i)}
						<span
							class="h-1 flex-1 rounded-full transition-colors duration-200 {i < strength.score
								? STRENGTH_COLORS[strength.score]
								: 'bg-[#1E1E2E]'}"
						></span>
					{/each}
				</div>
				<span class="text-[11.5px] text-slate-500">{strength.label}</span>
			</div>
		{/if}
	</div>

	<Field id="confirmPassword" label="Confirm password" error={$errors.confirmPassword?.[0]}>
		{#snippet icon()}
			<Lock class="h-4 w-4" />
		{/snippet}
		<input
			id="confirmPassword"
			name="confirmPassword"
			type={showPassword ? 'text' : 'password'}
			autocomplete="new-password"
			disabled={$submitting}
			bind:value={$form.confirmPassword}
			placeholder="Re-enter your password"
			class="h-10 w-full bg-transparent pl-10 pr-3 text-[14px] text-slate-100 placeholder:text-slate-600 outline-none"
		/>
	</Field>

	<label class="flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-snug text-slate-300">
		<span class="mt-[2px]">
			<Checkbox name="acceptTerms" bind:checked={$form.acceptTerms} disabled={$submitting} />
		</span>
		<span>
			I agree to PulseTrack's
			<a href={legal.termsUrl} class="font-medium text-violet-300 hover:text-violet-200">Terms</a>
			and
			<a href={legal.privacyUrl} class="font-medium text-violet-300 hover:text-violet-200"
				>Privacy Policy</a
			>.
		</span>
	</label>
	{#if $errors.acceptTerms?.[0]}
		<p class="-mt-2 text-[11.5px] text-rose-300">{$errors.acceptTerms[0]}</p>
	{/if}

	<SubmitButton submitting={$submitting} idleLabel={copy.submitLabel} loadingLabel={copy.loadingLabel} />

	<p class="pt-1 text-center text-[13px] text-slate-400">
		{copy.footerPrompt}
		<button
			type="button"
			onclick={() => onSwitchToLogin?.()}
			class="font-medium text-violet-300 hover:text-violet-200"
		>
			{copy.footerLink}
		</button>
	</p>
</form>
