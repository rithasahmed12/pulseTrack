import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { signupSchema } from '$lib/auth/schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(signupSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const form = await superValidate(request, zod4(signupSchema));
		if (!form.valid) return fail(400, { form });

		const { error: signupError } = await locals.supabase.auth.signUp({
			email: form.data.email,
			password: form.data.password,
			options: {
				data: { display_name: form.data.name },
				emailRedirectTo: `${url.origin}/auth/callback`
			}
		});

		if (signupError) return message(form, signupError.message, { status: 400 });

		const { error: signinError } = await locals.supabase.auth.signInWithPassword({
			email: form.data.email,
			password: form.data.password
		});

		if (signinError) {
			form.message = 'Account created — check your email to confirm, then sign in.';
			return { form };
		}

		const next = url.searchParams.get('redirectTo') ?? '/dashboard';
		throw redirect(303, next);
	}
};
