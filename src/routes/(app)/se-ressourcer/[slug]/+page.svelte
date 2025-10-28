<script lang="ts">

	import type { PageProps } from './$types';
	import { 
		userData,
		addFavorite, 
		bibleRefToHash, 
		bibleRefToString, 
		removeFavorite, 
		type BibleRef, 
		bibleRefEquals,
		bibleRefToHref} from '$lib/stores/userData';
	import PageTitle from '$lib/PageTitle.svelte';
	import { user } from '$lib/stores/user';
	import { Share2, Star } from '@lucide/svelte';

	let { data }: PageProps = $props();

	console.log(data);

	const dateText = new Date(data.publicationDate).toLocaleDateString("fr-FR", {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
	// first character to uppercase
	const date = dateText.charAt(0).toUpperCase() + dateText.slice(1);
	let paragraphs = data.full.split('\n\n');



	const title = data.title ? data.title : bibleRefToString(data.verses.reference);


	function isFavorite(reference: BibleRef): boolean {
		if (!$userData) return false;
		return $userData.favorites.some((fav) => bibleRefEquals(fav.ref, reference));
	}
</script>

<main class="flex flex-grow items-center justify-center">
	<div class="container mx-auto max-w-3xl p-2">
		<PageTitle title={date + ' - ' + title} />

		<div class="mb-4 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
			<div class="prose lg:prose-xl">
				<img src="{data.imageUrl}" 
								alt="{data.verses.text + ' - La Bible, ' + bibleRefToString(data.verses.reference)}" 
								class="w-full object-cover mb-4 rounded-md" />
				
				{#each paragraphs as paragraph}
					<p class="text-md text-secondary-text mb-4">{paragraph}</p>
				{/each}
				<p class="mb-3 text-2xl leading-relaxed font-normal md:text-3xl">
					« {data.verses.text} »
				</p>
				<p class="mb-4 text-lg text-right">
						La Bible,
							<a
								class="hover:text-primary mr-auto hover:underline"
								href={bibleRefToHref(data.verses.reference)}
							>
									{bibleRefToString(data.verses.reference)}
							</a>
						{#if $user}
							{#if isFavorite(data.verses.reference)}
								<button
									class="text-primary cursor-pointer inline-block"
									onclick={() => removeFavorite(data.verses.reference)}
								>
									<Star class="fill-primary hover:fill-none" />
								</button>
							{:else}
								<button
									class="hover:text-primary cursor-pointer inline-block"
									onclick={() => addFavorite(data.verses.reference)}
								>
									<Star class="hover:fill-primary" />
								</button>
							{/if}
						{/if}
					</p>
			</div>

			<p class="mt-6 text-center">
				<a
					href={'/partager/' + bibleRefToHash(data.verses.reference)}
					class="bg-primary hover:bg-primary-strong mb-4 inline-flex items-center rounded-md px-8 py-3 text-lg font-semibold text-white transition duration-300"
				>
					<Share2 /> Partager ce verset
				</a>
			</p>

			{#if data.seeAlso.length > 0}
				<h2 class="mt-8 mb-4 text-2xl font-bold">A lire également</h2>
				<hr class="border-t border-gray-300 mb-6" />
			{#each data.seeAlso as verse (verse.reference)}
					<div class="mb-4">
						<p class="border-primary mb-1 border-l-2 pl-2 lg:text-xl">{verse.text}</p>
						<div class="text-primary-text flex gap-4 text-sm lg:text-lg">
							<a
								class="hover:text-primary mr-auto hover:underline"
								href={bibleRefToHref(verse.reference)}
							>
								{bibleRefToString(verse.reference)}
							</a>
							{#if $user}
								{#if isFavorite(verse.reference)}
									<button
										class="text-primary cursor-pointer"
										onclick={() => removeFavorite(verse.reference)}
									>
										<Star class="fill-primary hover:fill-none" />
									</button>
								{:else}
									<button
										class="hover:text-primary cursor-pointer"
										onclick={() => addFavorite(verse.reference)}
									>
										<Star class="hover:fill-primary" />
									</button>
								{/if}
							{/if}
							<a class="hover:text-primary" href={'/partager/' + bibleRefToHash(verse.reference)}>
								<Share2 />
							</a>
						</div>
					</div>
				{/each}
				{/if}
		</div>
	</div>
</main>

