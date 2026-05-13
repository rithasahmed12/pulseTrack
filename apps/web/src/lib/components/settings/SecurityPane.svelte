<script lang="ts">
	import Lock from '@lucide/svelte/icons/lock';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import type { PasswordFormValues, SecurityState } from '@pulsetrack/shared-types';

	interface Props {
		security: SecurityState;
		onPasswordSubmit?: (values: PasswordFormValues) => void;
	}

	let { security, onPasswordSubmit }: Props = $props();

	let values = $state<PasswordFormValues>({ current: '', next: '', confirm: '' });
	let show = $state(false);
	let submitted = $state<'idle' | 'saved'>('idle');

	const strength = $derived.by(() => {
		const pw = values.next;
		if (!pw) return { score: 0 as 0 | 1 | 2 | 3 | 4, label: 'Empty' };
		let s = 0;
		if (pw.length >= 8) s++;
		if (/[A-Z]/.test(pw)) s++;
		if (/[0-9]/.test(pw)) s++;
		if (/[^A-Za-z0-9]/.test(pw)) s++;
		const labels = ['Too short', 'Weak', 'Fair', 'Strong', 'Excellent'];
		return { score: s as 0 | 1 | 2 | 3 | 4, label: labels[s] };
	});
	const mismatch = $derived(values.confirm.length > 0 && values.next !== values.confirm);
	const canSubmit = $derived(
		values.current.length > 0 &&
			values.next.length >= 8 &&
			values.next === values.confirm &&
			!mismatch
	);

	const STRENGTH_COLORS = [
		'bg-slate-700',
		'bg-rose-500',
		'bg-amber-500',
		'bg-cyan-500',
		'bg-emerald-500'
	] as const;

	function formatLong(iso: string): string {
		if (!iso) return 'never';
		try {
			return new Date(iso).toLocaleDateString(undefined, {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			});
		} catch {
			return iso;
		}
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!canSubmit) return;
		onPasswordSubmit?.(values);
		submitted = 'saved';
		values = { current: '', next: '', confirm: '' };
		setTimeout(() => (submitted = 'idle'), 2200);
	}
</script>

<div class="space-y-5">
	<form
		onsubmit={handleSubmit}
		class="relative overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 p-5 backdrop-blur-xl"
	>
		<header class="mb-4">
			<h2 class="text-[15px] font-semibold tracking-tight text-slate-100">Change password</h2>
			<p class="mt-0.5 text-[12.5px] text-slate-500">
				Last changed {formatLong(security.lastPasswordChangeAt)}
			</p>
		</header>

		<div class="space-y-3">
			{#snippet field(
				id: string,
				label: string,
				value: string,
				onInput: (v: string) => void,
				placeholder?: string,
				error?: string
			)}
				{@const hasError = !!error}
				<div>
					<label for={id} class="mb-1.5 block text-[12.5px] font-medium text-slate-300">
						{label}
					</label>
					<div
						class="relative rounded-lg border bg-[#0A0A0F] transition-all duration-150 {hasError
							? 'border-rose-500/60 shadow-[0_0_0_3px_rgba(244,63,94,0.12)]'
							: 'border-[#1E1E2E] focus-within:border-violet-500/50 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]'}"
					>
						<span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
							<Lock class="h-4 w-4" strokeWidth={1.8} />
						</span>
						<input
							{id}
							type={show ? 'text' : 'password'}
							autocomplete={id === 'current-pw' ? 'current-password' : 'new-password'}
							{value}
							placeholder={placeholder ?? '••••••••'}
							oninput={(e) => onInput((e.currentTarget as HTMLInputElement).value)}
							class="h-10 w-full bg-transparent pl-10 pr-11 text-[14px] text-slate-100 placeholder:text-slate-600 outline-none"
						/>
						<button
							type="button"
							onclick={() => (show = !show)}
							aria-label={show ? 'Hide password' : 'Show password'}
							tabindex={-1}
							class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-300"
						>
							{#if show}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</button>
					</div>
					{#if hasError}
						<p class="mt-1 text-[11.5px] text-rose-300">{error}</p>
					{/if}
				</div>
			{/snippet}

			{@render field('current-pw', 'Current password', values.current, (v) =>
				(values = { ...values, current: v })
			)}
			<div>
				{@render field(
					'new-pw',
					'New password',
					values.next,
					(v) => (values = { ...values, next: v }),
					'At least 8 characters'
				)}
				{#if values.next.length > 0}
					<div class="mt-2 flex items-center gap-2">
						<div class="flex flex-1 gap-1">
							{#each [0, 1, 2, 3] as i (i)}
								<span
									class="h-1 flex-1 rounded-full transition-colors duration-150 {i < strength.score
										? STRENGTH_COLORS[strength.score]
										: 'bg-[#1E1E2E]'}"
								></span>
							{/each}
						</div>
						<span class="text-[11.5px] text-slate-500">{strength.label}</span>
					</div>
				{/if}
			</div>
			{@render field(
				'confirm-pw',
				'Confirm new password',
				values.confirm,
				(v) => (values = { ...values, confirm: v }),
				undefined,
				mismatch ? "Passwords don't match." : undefined
			)}
		</div>

		<div class="mt-5 flex items-center justify-between gap-3 border-t border-[#1A1A24] pt-4">
			<p
				role="status"
				aria-live="polite"
				class="text-[12px] transition-opacity duration-150 {submitted === 'saved'
					? 'text-emerald-300 opacity-100'
					: 'text-slate-500 opacity-0'}"
			>
				Password updated.
			</p>
			<button
				type="submit"
				disabled={!canSubmit}
				class="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[12.5px] font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.55)] transition-colors duration-150 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-violet-600"
			>
				<Lock class="h-3.5 w-3.5" strokeWidth={1.8} />
				Update password
			</button>
		</div>
	</form>
</div>
