import { MeditationSummary } from '$lib/models/meditation.js';

export const prerender = false;

export const load = async ({ fetch }) => {
	const res = await fetch(import.meta.env.VITE_SG_API + '/meditations');
	const json = await res.json();
	const meditations: MeditationSummary[] = json.map((v: any) => MeditationSummary.fromJSON(v));
	return {
		meditations
	};
};
