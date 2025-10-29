import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const res = await fetch(import.meta.env.VITE_SG_API + '/meditations/' + params.slug);
	return await res.json();
};
