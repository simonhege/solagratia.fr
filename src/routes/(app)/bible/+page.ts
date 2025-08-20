import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch(import.meta.env.VITE_SG_API + '/bible');
	return await res.json();
};
