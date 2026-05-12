import { error, json } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';
import { getPost } from '$lib/api/posts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, fetch, params }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw error(401, 'Not signed in');
	try {
		const post = await getPost(params.id, { jwt: session.access_token, fetch });
		return json(post);
	} catch (err) {
		if (err instanceof ApiError) throw error(err.status, err.message);
		throw err;
	}
};
