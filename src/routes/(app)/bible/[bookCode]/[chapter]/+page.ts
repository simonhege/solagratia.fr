import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ params }) => {
	const res = await fetch(
		'https://api.solagratia.fr/bible/' + params.bookCode + '/' + params.chapter
	);
	return await res.json();
};
