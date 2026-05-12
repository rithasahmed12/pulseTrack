import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { loginSchema } from '$lib/auth/schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const form = await superValidate(zod4(loginSchema));
	const errorMessage = url.searchParams.get('error');
	if (errorMessage) form.message = errorMessage;
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const form = await superValidate(request, zod4(loginSchema));
		if (!form.valid) return fail(400, { form });

		const { error } = await locals.supabase.auth.signInWithPassword({
			email: form.data.email,
			password: form.data.password
		});

		if (error) return message(form, error.message, { status: 401 });

		const next = url.searchParams.get('redirectTo') ?? '/dashboard';
		throw redirect(303, next);
	}
};
