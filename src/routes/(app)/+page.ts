import { BibleExcerpt, BibleRef } from '$lib/models/bible';
import { MeditationStatus, MeditationSummary } from '$lib/models/meditation';
import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	// Default if fetch fails
	const defaultMeditation = new MeditationSummary(
		'',
		'non-disponible',
		'Jour de joie',
		new BibleExcerpt(
			new BibleRef('PSA', 'Psaumes', 118, 24, 24),
			"C'est ici la journée que l'Eternel a faite: Qu'elle soit pour nous un sujet d'allégresse et de joie!"
		),
		'',
		"Aujourd'hui est un cadeau unique que nous recevons des mains de notre Créateur. C'est une invitation à choisir la joie et l'allégresse, à célébrer cette bénédiction et à vivre pleinement chaque moment avec gratitude.",
		MeditationStatus.Active,
		new Date(),
		[]
	);
	try {
		const res = await fetch(import.meta.env.VITE_SG_API + '/meditation');
		if (!res.ok) throw new Error('Failed to fetch');
		return {
			meditation: MeditationSummary.fromJSON(await res.json())
		};
	} catch (error) {
		console.error(error);
		return {
			meditation: defaultMeditation
		};
	}
};
