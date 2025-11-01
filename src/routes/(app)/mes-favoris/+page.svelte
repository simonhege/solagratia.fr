<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import { user } from '$lib/stores/user';
	import { removeFavorite } from '$lib/stores/userData';
	import { Share2, Trash2 } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { BibleExcerpt, type BibleRef } from '$lib/models/bible';
	import { Favorite } from '$lib/models/user';

	$effect(() => {
		// Ensure user is loaded
		if ($user === null) {
			// Redirect to home page
			goto('/');
		}
	});

	var favorites: BibleExcerpt[] = $state([]);

	$effect(() => {
		loadFavorites()
			.then((data) => {
				favorites = data;
			})
			.catch((err) => {
				console.error('Failed to load favorites:', err);
			});
	});

	async function loadFavorites() {
		const req = new Request(import.meta.env.VITE_SG_API + '/users/me/favorites', {
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + $user?.access_token
			}
		});
		const res = await fetch(req);
		const data = await res.json();
		return data.map((f: any) => BibleExcerpt.fromJSON(f));
	}

	function removeFav(ref: BibleRef) {
		favorites = favorites.filter((fav) => !fav.reference.equals(ref));

		removeFavorite(ref);
	}
</script>

<div class="container mx-auto max-w-5xl p-2">
	<PageTitle title="Mes versets favoris" />
	<div class="mb-12 rounded-xl bg-white p-8 shadow-lg">
		{#if favorites}
			{#each favorites as verse (verse.reference)}
				<div class="mb-4">
					<p class="border-primary mb-1 border-l-2 pl-2 lg:text-xl">{verse.text}</p>
					<div class="text-primary-text flex gap-4 text-sm lg:text-lg">
						<a class="hover:text-primary mr-auto hover:underline" href={verse.reference.toHref()}>
							{verse.reference.toString()}
						</a>
						<button
							class="hover:text-primary cursor-pointer"
							onclick={() => removeFav(verse.reference)}
						>
							<Trash2 />
						</button>
						<a class="hover:text-primary" href={'/partager/' + verse.reference.toHash()}>
							<Share2 />
						</a>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
