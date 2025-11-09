import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { BibleExcerpt } from '$lib/models/bible';

export const prerender = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const refRegex = /([1-9A-Z]{3})\/(\d+)\/(\d+)(-(\d+))?/;
	const match = params.reference.match(refRegex);
	if (!match) {
		console.log(params.reference);
		error(404, 'Not found');
	}

	const req = new Request(import.meta.env.VITE_SG_API + '/bible/' + params.reference);
	const res = await fetch(req);
	const verses = BibleExcerpt.fromJSON(await res.json());
	return {
		verses
	};
};
