import { redirect } from '@sveltejs/kit';

export const load = async ({ fetch }) => {
  const res = await fetch(import.meta.env.VITE_SG_API + '/meditations');
  const meditations = await res.json();
  return { meditations };
};
