<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import { BookmarkPlus, ImagePlus, Send, Share2, Star } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import { isAdmin, user, userManager } from '$lib/stores/user';
	import Generate from './Generate.svelte';
	import {
		computeSlug,
		formattedDate,
		MeditationStatus,
		type MeditationObject
	} from '$lib/models/meditation';
	import { goto } from '$app/navigation';
	import { BibleExcerpt } from '$lib/models/bible';
	import { page } from '$app/state';
	import Button from './Button.svelte';
	import { addFavorite, isFavorite, removeFavorite, userData } from '$lib/stores/userData';

	let { data }: PageProps = $props();

	let mainIdeas = $state('');
	let mainIdeasFeedback = $state('');
	let mainIdeasLoading = $state(false);

	$effect(() => {
		if (!$user) {
			userManager.signinRedirect({ state: { returnTo: page.url.href } });
		}

		if (!mainIdeas) {
			mainIdeasLoading = true;
			generateMainIdeas('', '').then(() => {
				mainIdeasLoading = false;
				if (!meditation.imageUrl) {
					generateImages();
				}
			});
		}
	});

	const pubDate = new Date();
	pubDate.setMinutes(0, 0, 0);
	pubDate.setTime(pubDate.getTime() + 3_600_000);
	const meditation: MeditationObject = $state({
		id: crypto.randomUUID(),
		slug: '',

		title: '',
		// svelte-ignore state_referenced_locally
		verses: data.verses,
		imageUrl: '',

		short: '',
		full: '',

		status: MeditationStatus.Draft,
		publicationDate: pubDate.toISOString(),

		tags: [],
		seeAlso: []
	});

	// Format date for datetime-local input (YYYY-MM-DDThh:mm)
	const dateTimeInput = $derived(meditation.publicationDate.slice(0, 16));
	const tagsList = $derived(meditation.tags ? meditation.tags.join(', ') : '');

	let fullContentFeedback = $state('');
	let shortContentFeedback = $state('');
	let titleFeedback = $state('');

	type GeneratedImage = {
		imageUrl: string;
		alt: string;
		tags: string[];
	};
	let images: GeneratedImage[] = $state([]);

	async function generate(path: string, requestBody: any): Promise<any> {
		console.log('request body', requestBody);
		const req = new Request(import.meta.env.VITE_SG_API + path, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + $user?.access_token
			},
			body: JSON.stringify(requestBody)
		});
		const res = await fetch(req);
		return await res.json();
	}

	async function generateMainIdeas(content: string, feedback: string) {
		const json = await generate('/admin/meditations/ideas', {
			reference: data.verses.reference.toJSON(),
			current: content,
			feedback: feedback
		});
		mainIdeasFeedback = '';
		mainIdeas = json.content;
	}

	async function generateFullContent(content: string, feedback: string) {
		console.log('Going to generate full content', mainIdeas, meditation.full, fullContentFeedback);
		const json = await generate('/admin/meditations/full', {
			reference: data.verses.reference.toJSON(),
			ideas: mainIdeas,
			current: content,
			feedback: feedback
		});
		fullContentFeedback = '';
		meditation.full = json.content;
	}

	async function generateShortContent(content: string, feedback: string) {
		console.log(
			'Going to generate short content',
			mainIdeas,
			meditation.full,
			meditation.short,
			shortContentFeedback
		);
		const json = await generate('/admin/meditations/short', {
			reference: data.verses.reference.toJSON(),
			ideas: mainIdeas,
			full: meditation.full,
			current: content,
			feedback: feedback
		});
		shortContentFeedback = '';
		meditation.short = json.content;
	}

	async function generateTitle(content: string, feedback: string) {
		console.log('Going to generate title', meditation.full);
		const json = await generate('/admin/meditations/titles', {
			reference: data.verses.reference.toJSON(),
			ideas: mainIdeas,
			full: meditation.full,
			short: meditation.short,
			current: content,
			feedback: feedback
		});
		titleFeedback = '';
		meditation.title = json.content;
		computeSlug(meditation);
	}

	async function generateVerses() {
		console.log('Going to generate other verses', meditation);
		const json = await generate('/admin/meditations/verses', {
			reference: data.verses.reference.toJSON(),
			ideas: mainIdeas,
			full: meditation.full,
			short: meditation.short
		});
		meditation.seeAlso = json.verses.map((v: any) => BibleExcerpt.fromJSON(v));
	}

	async function generateTags() {
		console.log('Going to generate tags', meditation);
		const json = await generate('/admin/meditations/tags', {
			reference: data.verses.reference.toJSON(),
			ideas: mainIdeas,
			full: meditation.full,
			short: meditation.short
		});
		meditation.tags = json.tags;
	}

	async function generateImages() {
		console.log('Going to generate images');
		const json = await generate('/share', {
			reference: data.verses.reference.toJSON(),
			count: 5
		});
		images = json.images;
		meditation.imageUrl = images[0].imageUrl;
	}

	async function publish() {
		console.log('Going to publish', meditation);

		const res = await fetch(import.meta.env.VITE_SG_API + '/admin/meditations/' + meditation.id, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + $user?.access_token
			},
			body: JSON.stringify(meditation)
		});

		if (res.ok) {
			await res.json();
			goto('/se-ressourcer/' + meditation.slug);
		}
	}
</script>

<div class="container mx-auto max-w-3xl p-2">
	<PageTitle title={'Nouvelle méditation - ' + data.verses.reference.toString()} />

	<div class="mb-4 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
		<div class="">
			<p class="mb-3 text-2xl leading-relaxed font-normal md:text-3xl">
				«&nbsp;{data.verses.text}&nbsp;»
			</p>
			<p class="mb-4 text-right text-lg">
				La Bible,
				<a class="hover:text-primary mr-auto hover:underline" href={data.verses.reference.toHref()}>
					{data.verses.reference.toString()}
				</a>
			</p>

			<h3>Idées principales</h3>
			<Generate
				bind:content={mainIdeas}
				bind:feedback={mainIdeasFeedback}
				bind:loading={mainIdeasLoading}
				generate={generateMainIdeas}
				rows="5"
				text="Générer les idées principales"
			/>

			<h3>Méditation longue</h3>
			<Generate
				bind:content={meditation.full}
				bind:feedback={fullContentFeedback}
				generate={generateFullContent}
				rows="12"
				text="Générer la méditation longue"
			/>

			<h3>Méditation courte</h3>
			<Generate
				bind:content={meditation.short}
				bind:feedback={shortContentFeedback}
				generate={generateShortContent}
				rows="4"
				text="Générer la méditation courte"
			/>

			<h3>Titre</h3>
			<Generate
				bind:content={meditation.title}
				bind:feedback={titleFeedback}
				generate={generateTitle}
				rows="1"
				text="Générer le titre"
			/>

			<h3>Illustration</h3>
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{#each images as image}
					<div class="mb-2 text-center">
						<img src={image.imageUrl} alt={image.alt} class="rounded" />
						<input
							type="radio"
							value={image.imageUrl}
							name="selectedImage"
							bind:group={meditation.imageUrl}
						/>
					</div>
				{/each}
			</div>
			<div class="flex flex-wrap gap-2">
				<Button text="Générer l'illustration" onclick={generateImages} />
				<a
					href="/admin/backgrounds/generer?text={encodeURIComponent(data.verses.text)}"
					target="_blank"
					class="bg-primary hover:bg-primary-strong inline-flex items-center rounded-md px-4 py-2 text-white transition duration-300"
				>
					<ImagePlus class="mr-2" size={18} />
					Créer un nouvel arrière-plan
				</a>
			</div>

			<h3>Versets complémentaires</h3>

			{#each meditation.seeAlso as verse (verse.reference)}
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
						{#if $isAdmin}
							<a class="hover:text-primary" href={'/admin/init/' + verse.reference.toHash()}>
								<BookmarkPlus />
							</a>
						{/if}
					</div>
				</div>
			{/each}
			<Button text="Générer les versets complémentaires" onclick={generateVerses} />

			<h3>Publication</h3>
			<div class="mb-4">
				<label class="mb-1 block text-sm font-medium text-gray-700" for="publicationDate"
					>Date de publication</label
				>
				<input
					id="publicationDate"
					type="datetime-local"
					value={dateTimeInput}
					oninput={(e) => {
						meditation.publicationDate = new Date(e.currentTarget.value).toISOString();
						computeSlug(meditation);
					}}
					class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
				/>
				<p class="mt-1 text-sm text-gray-500">{formattedDate(meditation)}</p>
			</div>
			<div class="mb-4">
				<label class="mb-1 block text-sm font-medium text-gray-700" for="slug">Slug</label>
				<input
					id="slug"
					type="text"
					bind:value={meditation.slug}
					class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
				/>
			</div>
			<div class="mb-4">
				<label class="mb-1 block text-sm font-medium text-gray-700" for="tags">Tags</label>
				<div class="flex items-stretch gap-2">
					<input
						id="tags"
						type="text"
						value={tagsList}
						oninput={(e) =>
							(meditation.tags = e.currentTarget.value.split(',').map((tag) => tag.trim()))}
						placeholder="Tag1, Tag2, Tag3"
						class="focus:border-primary focus:ring-primary block w-full rounded-md border-gray-300 shadow-sm"
					/>

					<Button onclick={generateTags} />
				</div>
			</div>

			<Button onclick={publish}>
				<Send class="mr-2" /> Publier
			</Button>
		</div>
	</div>
</div>

<style>
	h3 {
		margin-top: calc(var(--spacing) * 4);
		margin-bottom: calc(var(--spacing) * 2);
		font-size: var(--text-2xl);
	}
</style>
