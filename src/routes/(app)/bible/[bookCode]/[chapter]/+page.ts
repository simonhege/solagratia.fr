import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const res = await fetch(
		import.meta.env.VITE_SG_API + '/bible/' + params.bookCode + '/' + params.chapter
	);
	return await res.json();
};
