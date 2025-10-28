export const prerender = false;

import type { PageLoad } from './$types';

export const load = (({ url }) => {
    const question = url.searchParams.get('question') || '';
    return {
        question
    };
}) satisfies PageLoad;
