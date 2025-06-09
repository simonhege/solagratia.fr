import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({fetch}) => {
	const res = await fetch('https://api.solagratia.fr/bible');
	return await res.json();
};
