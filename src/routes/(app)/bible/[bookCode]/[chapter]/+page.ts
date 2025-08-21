import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { user } from '$lib/stores/user';

export const prerender = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const accessToken = get(user)?.access_token;
	const req = new Request(
		import.meta.env.VITE_SG_API + '/bible/' + params.bookCode + '/' + params.chapter,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
	if (accessToken) {
		req.headers.set('Authorization', 'Bearer ' + accessToken);
	}
	const res = await fetch(req);
	return await res.json();
};
