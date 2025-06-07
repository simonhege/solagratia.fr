import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = false;

type BibleRefType = {
	bookCode: string;
	bookName?: string;
	chapter: number;
	verseStart: number;
	verseEnd: number;
};
type ShareRequestType = {
	reference: BibleRefType;
	backgroundName?: string;
	count?: number;
};

export const load: PageLoad = async ({ params }) => {
	const refRegex = /([1-9A-Z]{3})\/(\d+)\/(\d+)(-(\d+))?/;
	const match = params.reference.match(refRegex);
	if (!match) {
		console.log(params.reference);
		error(404, 'Not found');
	}

	const payload: ShareRequestType = {
		reference: {
			bookCode: match[1],
			chapter: parseInt(match[2]),
			verseStart: parseInt(match[3]),
			verseEnd: match[5] ? parseInt(match[5]) : parseInt(match[3])
		},
		count: 4
	};
	const req = new Request('https://api.solagratia.fr/share', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	const res = await fetch(req);
	return await res.json();
};
