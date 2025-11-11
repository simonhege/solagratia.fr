<script lang="ts">
	import type { PageProps } from './$types';
	import { isFavorite, addFavorite, removeFavorite, userData } from '$lib/stores/userData';
	import PageTitle from '$lib/PageTitle.svelte';
	import { user, isAdmin } from '$lib/stores/user';
	import { Pen, Share2, Star } from '@lucide/svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<meta property="og:title" content={data.meditation.formattedDate() + ' - ' + data.meditation.title} />
	<meta property="og:type" content="article" />
	<meta property="og:article:published_time" content={data.meditation.publicationDate.toISOString()} />
	<meta property="og:image" content={data.meditation.imageUrl} />
	<meta property="og:image:alt" content={data.meditation.verses.text +
						' - La Bible, ' +
						data.meditation.verses.reference.toString()} />
	<meta property="og:url" content={'https://www.solagratia.fr/se-resourcer/' + data.meditation.slug} />
	<meta property="og:site_name" content="Sola Gratia" />
	<meta property="og:locale" content="fr_FR" />
	<meta property="og:description" content={data.meditation.short} />
	
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@solagratia_fr" />
</svelte:head>

<main class="flex flex-grow items-center justify-center">
	<div class="container mx-auto max-w-3xl p-2">
		<PageTitle title={data.meditation.formattedDate() + ' - ' + data.meditation.title} />

		<div class="mb-4 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
			<div class="prose lg:prose-xl">
				<img
					src={data.meditation.imageUrl}
					alt={data.meditation.verses.text +
						' - La Bible, ' +
						data.meditation.verses.reference.toString()}
					class="mb-4 w-full rounded-md object-cover"
				/>

				{#each data.meditation.paragraphs() as paragraph}
					<p class="text-md text-secondary-text mb-4">{paragraph}</p>
				{/each}
				<p class="mb-3 text-2xl leading-relaxed font-normal md:text-3xl">
					«&nbsp;{data.meditation.verses.text}&nbsp;»
				</p>
				<p class="mb-4 text-right text-lg">
					La Bible,
					<a
						class="hover:text-primary mr-auto hover:underline"
						href={data.meditation.verses.reference.toHref()}
					>
						{data.meditation.verses.reference.toString()}
					</a>
					{#if $user}
						{#if isFavorite($userData?.favorites, data.meditation.verses.reference)}
							<button
								class="text-primary inline-block cursor-pointer"
								onclick={() => removeFavorite(data.meditation.verses.reference)}
							>
								<Star class="fill-primary hover:fill-none" />
							</button>
						{:else}
							<button
								class="hover:text-primary inline-block cursor-pointer"
								onclick={() => addFavorite(data.meditation.verses.reference)}
							>
								<Star class="hover:fill-primary" />
							</button>
						{/if}
					{/if}
				</p>
			</div>

			<p class="mt-6 text-center">
				<a
					href={'/partager/' + data.meditation.verses.reference.toHash()}
					class="bg-primary hover:bg-primary-strong mb-4 inline-flex items-center rounded-md px-8 py-3 text-lg font-semibold text-white transition duration-300"
				>
					<Share2 /> Partager ce verset
				</a>

				{#if $isAdmin}
					<a
						href={'/admin/editer/' + data.meditation.slug}
						class="bg-primary hover:bg-primary-strong mb-4 inline-flex items-center rounded-md px-8 py-3 text-lg font-semibold text-white transition duration-300"
					>
						<Pen /> Editer
					</a>
				{/if}
			</p>

			{#if data.meditation.seeAlso.length > 0}
				<h2 class="mt-8 mb-4 text-2xl font-bold">A lire également</h2>
				<hr class="mb-6 border-t border-gray-300" />
				{#each data.meditation.seeAlso as verse (verse.reference)}
					<div class="mb-4">
						<p class="border-primary mb-1 border-l-2 pl-2 lg:text-xl">{verse.text}</p>
						<div class="text-primary-text flex gap-4 text-sm lg:text-lg">
							<a class="hover:text-primary mr-auto hover:underline" href={verse.reference.toHref()}>
								{verse.reference.toString()}
							</a>
							{#if $user}
								{#if isFavorite($userData?.favorites, verse.reference)}
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
							<a class="hover:text-primary" href={'/partager/' + verse.reference.toHash()}>
								<Share2 />
							</a>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</main>
