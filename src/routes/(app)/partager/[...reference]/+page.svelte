<script lang="ts">
	import { Share2 } from '@lucide/svelte';

	import type { PageProps } from './$types';
	import { bibleRefToString, type BibleRef } from '$lib/stores/userData';
	import PageTitle from '$lib/PageTitle.svelte';

	type GeneratedImage = {
		imageUrl: string;
		alt: string;
		tags: string[];
	};

	type ShareRequestType = {
		reference: BibleRef;
		backgroundName?: string;
		count?: number;
	};

	let { data }: PageProps = $props();
	const defaultImage: GeneratedImage = {
		imageUrl: data.dataUrl ? data.dataUrl : data.url,
		alt: data.text,
		tags: [bibleRefToString(data.reference)]
	};

	let generatedImages: GeneratedImage[] = $state([]);

	let selected = $state(0);
	let selectedImage = $derived(
		generatedImages.length > selected ? generatedImages[selected] : defaultImage
	);

	$effect(() => {
		const payload: ShareRequestType = {
			reference: data.reference,
			count: 4
		};
		const req = new Request(import.meta.env.VITE_SG_API + '/share', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});
		fetch(req)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((response) => {
				console.log(response);
				generatedImages = response.images;
			});
	});

	function toast(message: string) {
		// TODO display a toast notification instead of basic alert
		alert(message);
	}

	function shareImage() {
		if (navigator.share) {
			navigator
				.share({
					title: `${bibleRefToString(data.reference)} - Sola Gratia`,
					text: selectedImage.alt,
					url: selectedImage.imageUrl
				})
				.then(() => console.log('Successful share'))
				.catch((error) => console.log('Error sharing', error));
		} else if (navigator.clipboard) {
			navigator.clipboard.writeText(selectedImage.imageUrl)
				.then(() => toast('Lien copié dans le presse-papiers !'))
				.catch((error) => console.log('Error copying text', error));
		} else {
			toast('Le partage n\'est pas supporté par votre navigateur. Copiez le lien : ' + selectedImage.imageUrl);
		}
	}

</script>

<svelte:head>
	<title>Partager {bibleRefToString(data.reference)} - Sola Gratia</title>
</svelte:head>

<div class="container mx-auto max-w-5xl">
	<PageTitle title={'Partager ' + bibleRefToString(data.reference)} />

	<div
		class="main-illustration-display mx-auto mb-12 max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl"
	>
		<img
			src={selectedImage.imageUrl}
			alt={selectedImage.alt}
			class="from-primary to-secondary-text aspect-square w-full bg-gradient-to-br object-cover"
		/>
		<div class="flex items-center justify-between p-6">
			<p class="text-primary-text text-xl font-semibold">{selectedImage.tags.join(' ')}</p>
			<button
				class="bg-primary hover:bg-primary-strong dimensional-shadow hover-lift-dimensional inline-flex cursor-pointer items-center rounded-md px-4 py-2 font-medium text-white transition duration-300"
				aria-label="Partager cette illustration"
				disabled={generatedImages.length === 0}
				onclick={shareImage}
			>
				<Share2 class="mr-2" /> Partager
			</button>
		</div>
		<p class="text-secondary-text px-6 pb-6">
			{selectedImage.alt}
		</p>
	</div>

	{#if generatedImages.length > 0}
		<h2 class="text-primary-text mb-8 text-center text-2xl font-bold md:text-3xl">
			Autres illustrations pour ce verset
		</h2>
		<div class="mb-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each generatedImages as image, index (image.imageUrl)}
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
	{/if}
</div>
