import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { BibleExcerptImage } from '$lib/models/bible';

export const prerender = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const refRegex = /([1-9A-Z]{3})\/(\d+)\/(\d+)(-(\d+))?/;
	const match = params.reference.match(refRegex);
	if (!match) {
		console.log(params.reference);
		error(404, 'Not found');
	}

	const req = new Request(import.meta.env.VITE_SG_API + '/image/' + params.reference);
	const res = await fetch(req);
	return {
		image: BibleExcerptImage.fromJSON(await res.json())
	};
};
