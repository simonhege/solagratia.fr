<script lang="ts">
	import { Share2 } from '@lucide/svelte';

	import type { PageProps } from './$types';
	import PageTitle from '$lib/PageTitle.svelte';
	type BibleRefType = {
		bookCode: string;
		bookName?: string;
		chapter: number;
		verseStart: number;
		verseEnd: number;
	};

	let { data }: PageProps = $props();

	function refString(ref: BibleRefType): string {
		return (
			ref.bookName +
			' ' +
			ref.chapter +
			'.' +
			ref.verseStart +
			(ref.verseEnd !== ref.verseStart ? '-' + ref.verseEnd : '')
		);
	}

	let selected = $state(0);
	let selectedImage = $derived(data.images[selected]);
</script>

<svelte:head>
	<title>Partager {refString(data.verses.reference)} - Sola Gratia</title>
</svelte:head>

<div class="container mx-auto max-w-5xl">
	<PageTitle title={'Partager ' + refString(data.verses.reference)} />

	<div
		class="main-illustration-display mx-auto mb-12 max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl"
	>
		<img
			src={selectedImage.imageUrl}
			alt={selectedImage.alt}
			class="aspect-square w-full object-cover"
		/>
		<div class="flex items-center justify-between p-6">
			<p class="text-primary-text text-xl font-semibold">{selectedImage.tags.join(' ')}</p>
			<button
				class="bg-primary hover:bg-primary-strong dimensional-shadow hover-lift-dimensional inline-flex cursor-pointer items-center rounded-md px-4 py-2 font-medium text-white transition duration-300"
				aria-label="Partager cette illustration"
			>
				<Share2 class="mr-2" /> Partager
			</button>
		</div>
		<p class="text-secondary-text px-6 pb-6">
			{selectedImage.alt}
		</p>
	</div>

	<h2 class="text-primary-text mb-8 text-center text-2xl font-bold md:text-3xl">
		Autres illustrations pour ce verset
	</h2>
	<div class="mb-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.images as image, index (image.imageUrl)}
			{#if index != selected}
				<button
					class="cursor-pointer rounded-xl bg-white shadow-2xl transition-transform duration-200 ease-in-out hover:-translate-y-2"
					onclick={() => {
						selected = index;
					}}
				>
					<img src={image.imageUrl} alt={image.alt} class="rounded" />
				</button>
			{/if}
		{/each}
	</div>
</div>
