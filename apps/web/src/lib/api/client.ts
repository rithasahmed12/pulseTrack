import { PUBLIC_API_URL } from '$env/static/public';

export interface ApiRequestInit extends Omit<RequestInit, 'body'> {
	jwt: string;
	body?: unknown;
	fetch?: typeof fetch;
}

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		public readonly statusText: string,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export async function api<T>(path: string, init: ApiRequestInit): Promise<T> {
	const { jwt, body, fetch: customFetch, headers, ...rest } = init;
	const fetchFn = customFetch ?? fetch;
	const finalHeaders = new Headers(headers);
	finalHeaders.set('Authorization', `Bearer ${jwt}`);
	if (body !== undefined && !finalHeaders.has('Content-Type')) {
		finalHeaders.set('Content-Type', 'application/json');
	}

	const response = await fetchFn(`${PUBLIC_API_URL}${path}`, {
		...rest,
		headers: finalHeaders,
		body: body === undefined ? undefined : JSON.stringify(body)
	});

	if (!response.ok) {
		let detail = response.statusText;
		try {
			const data = (await response.json()) as { message?: string | string[] };
			if (Array.isArray(data?.message)) detail = data.message.join(', ');
			else if (typeof data?.message === 'string') detail = data.message;
		} catch {
			// body wasn't JSON — keep statusText
		}
		throw new ApiError(response.status, response.statusText, detail);
	}

	if (response.status === 204) return undefined as T;
	return (await response.json()) as T;
}
