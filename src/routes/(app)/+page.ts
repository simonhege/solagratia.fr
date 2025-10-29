import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	// Default if fetch fails
	const defaultMeditation = {
		slug: 'non-disponible',
		verses: {
			reference: {
				bookCode: 'PSA',
				bookName: 'Psaumes',
				chapter: 118,
				verseStart: 24,
				verseEnd: 24
			},
			text: "C'est ici la journée que l'Eternel a faite: Qu'elle soit pour nous un sujet d'allégresse et de joie!"
		},
		short:
			"Aujourd'hui est un cadeau unique que nous recevons des mains de notre Créateur. C'est une invitation à choisir la joie et l'allégresse, à célébrer cette bénédiction et à vivre pleinement chaque moment avec gratitude."
	};
	try {
		const res = await fetch(import.meta.env.VITE_SG_API + '/meditation');
		if (!res.ok) throw new Error('Failed to fetch');
		return await res.json();
	} catch (error) {
		console.error(error);
		return defaultMeditation;
	}
};
