<script lang="ts">
	import Camera from '@lucide/svelte/icons/camera';
	import Lock from '@lucide/svelte/icons/lock';
	import Save from '@lucide/svelte/icons/save';
	import Undo2 from '@lucide/svelte/icons/undo-2';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import type { AppUser, AppUserDraft } from '@pulsetrack/shared-types';

	interface Props {
		user: AppUser;
		draft: AppUserDraft;
		isDirty: boolean;
		isSaving: boolean;
		onDisplayNameChange?: (value: string) => void;
		onBioChange?: (value: string) => void;
		onAvatarChange?: (file: File) => void;
		onSave?: () => void;
		onDiscard?: () => void;
	}

	let {
		user,
		draft,
		isDirty,
		isSaving,
		onDisplayNameChange,
		onBioChange,
		onAvatarChange,
		onSave,
		onDiscard
	}: Props = $props();

	let fileInput: HTMLInputElement | undefined = $state();

	function formatJoined(iso: string): string {
		try {
			return new Date(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
		} catch {
			return iso;
		}
	}

	const memberSince = $derived(formatJoined(user.joinedAt));
	const initials = $derived(
		user.displayName
			.split(' ')
			.map((p) => p[0])
			.filter(Boolean)
			.slice(0, 2)
			.join('')
			.toUpperCase()
	);
</script>

<section
	class="relative overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl"
>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-x-0 top-0 h-px"
		style="background: linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(6,182,212,0.5), transparent);"
	></div>

	<div class="grid gap-5 p-5 sm:gap-6 sm:p-6 lg:grid-cols-[auto_1fr] lg:items-start">
		<div class="flex flex-col items-center gap-3 lg:items-start">
			<div class="group relative">
				<div class="relative h-[96px] w-[96px] overflow-hidden rounded-full p-[2px] sm:h-[104px] sm:w-[104px]">
					<span
						aria-hidden="true"
						class="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400"
					></span>
					<span class="relative block h-full w-full overflow-hidden rounded-full bg-[#0F0F18]">
						{#if draft.avatarUrl}
							<img
								src={draft.avatarUrl}
								alt=""
								class="h-full w-full object-cover"
								referrerpolicy="no-referrer"
							/>
						{:else}
							<span
								class="font-mono flex h-full w-full items-center justify-center text-[28px] text-slate-500"
								>{initials || '·'}</span
							>
						{/if}
					</span>
				</div>

				<button
					type="button"
					onclick={() => fileInput?.click()}
					aria-label="Change avatar"
					class="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
				>
					<span
						class="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-2.5 py-1 text-[11px] font-medium text-violet-100 ring-1 ring-inset ring-violet-500/40"
					>
						<Camera class="h-3 w-3" strokeWidth={2} />
						Change
					</span>
				</button>

				<input
					bind:this={fileInput}
					type="file"
					accept="image/*"
					class="hidden"
					onchange={(e) => {
						const file = (e.currentTarget as HTMLInputElement).files?.[0];
						if (file) onAvatarChange?.(file);
						(e.currentTarget as HTMLInputElement).value = '';
					}}
				/>
			</div>

			<div class="text-center text-[11px] text-slate-500 lg:text-left">
				<p class="font-mono uppercase tracking-[0.18em]">Member since</p>
				<p class="mt-0.5 font-medium text-slate-300">{memberSince}</p>
			</div>
		</div>

		<div class="flex min-w-0 flex-1 flex-col gap-4">
			<div>
				<div class="mb-1.5 flex items-center justify-between">
					<label for="display-name" class="text-[12.5px] font-medium text-slate-300">
						Display name
					</label>
					<span
						class="font-mono tabular-nums text-[10px] uppercase tracking-wider text-slate-500"
					>
						{draft.displayName.length}/40
					</span>
				</div>
				<div
					class="rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] transition-all duration-150 focus-within:border-violet-500/50 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
				>
					<input
						id="display-name"
						type="text"
						maxlength={40}
						disabled={isSaving}
						value={draft.displayName}
						oninput={(e) => onDisplayNameChange?.((e.currentTarget as HTMLInputElement).value)}
						class="h-10 w-full bg-transparent px-3 text-[14.5px] font-medium text-slate-100 outline-none"
					/>
				</div>
			</div>

			<div>
				<div class="mb-1.5 flex items-center justify-between">
					<label for="email" class="text-[12.5px] font-medium text-slate-300">Email</label>
					<span class="inline-flex items-center gap-1 text-[11px] text-slate-500">
						<Lock class="h-2.5 w-2.5" strokeWidth={2} />
						Managed by sign-in
					</span>
				</div>
				<div
					class="rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] transition-all duration-150"
				>
					<input
						id="email"
						type="email"
						readonly
						value={user.email}
						class="h-10 w-full cursor-default bg-transparent px-3 text-[14px] text-slate-400 outline-none"
					/>
				</div>
			</div>

			<div>
				<div class="mb-1.5 flex items-center justify-between">
					<label for="bio" class="text-[12.5px] font-medium text-slate-300">Bio</label>
					<span
						class="font-mono tabular-nums text-[10px] uppercase tracking-wider text-slate-500"
					>
						{draft.bio.length}/280
					</span>
				</div>
				<div
					class="rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] transition-all duration-150 focus-within:border-violet-500/50 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
				>
					<textarea
						id="bio"
						maxlength={280}
						rows={3}
						disabled={isSaving}
						value={draft.bio}
						oninput={(e) =>
							onBioChange?.((e.currentTarget as HTMLTextAreaElement).value)}
						class="block w-full resize-none bg-transparent px-3 py-2.5 text-[14px] leading-relaxed text-slate-200 outline-none"
					></textarea>
				</div>
			</div>

			{#if isDirty}
				<div class="flex items-center justify-end gap-2 border-t border-[#1A1A24] pt-4">
					<button
						type="button"
						onclick={() => onDiscard?.()}
						disabled={isSaving}
						class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 disabled:opacity-50"
					>
						<Undo2 class="h-3.5 w-3.5" strokeWidth={1.8} />
						Discard
					</button>
					<button
						type="button"
						onclick={() => onSave?.()}
						disabled={isSaving}
						class="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[12.5px] font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-12px_rgba(124,58,237,0.55)] transition-colors duration-150 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{#if isSaving}
							<Loader2 class="h-3.5 w-3.5 animate-spin" />
							Saving…
						{:else}
							<Save class="h-3.5 w-3.5" strokeWidth={1.8} />
							Save changes
						{/if}
					</button>
				</div>
			{/if}
		</div>
	</div>
</section>
