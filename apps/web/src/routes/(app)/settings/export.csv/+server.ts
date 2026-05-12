import { error } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	const { session } = await locals.safeGetSession();
	if (!session) throw error(401, 'Not signed in');

	const upstream = await fetch(`${PUBLIC_API_URL}/settings/export.csv`, {
		headers: { Authorization: `Bearer ${session.access_token}` }
	});
	if (!upstream.ok) throw error(upstream.status, upstream.statusText);
	const csv = await upstream.text();
	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': 'attachment; filename="pulsetrack-export.csv"'
		}
	});
};
