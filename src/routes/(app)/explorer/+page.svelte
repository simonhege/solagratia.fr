<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import { user } from '$lib/stores/user';
	import {
		userData,
		addFavorite,
		removeFavorite,
		type BibleRef,
		bibleRefEquals,
		bibleRefToString,
		bibleRefToHash,

		bibleRefToHref

	} from '$lib/stores/userData';
	import { MessageCircleWarning, MessageCircleX, Share2, Star } from '@lucide/svelte';
	import { getCachedResponse, setCachedResponse } from '$lib/stores/explorerCache';
	import { goto } from '$app/navigation';
	import type { PageProps } from '../$types';

	let { data }: PageProps = $props();

	let question = $state(data.question);
	let loading = $state(false);
	let displayError = $state(false);
	let noAnswer = $state(false);
	let isInitialLoad = $state(true);

	// Execute search when component mounts with a question parameter
	$effect(() => {
		if (isInitialLoad && data.question) {
			handleQuestion(null);
			isInitialLoad = false;
		}
	});

	function shuffle(array: string[]): string[] {
		for (let i = array.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	let questions = shuffle([
		'Qui est Jésus ?',
		'Parle moi de joie',
		'Donne moi un encouragement pour ma journée de travail.',
		"Qu'y a-t-il après la mort ?",
		'Comment être sauvé ?',
		'Quels versets sont en lien avec le Psaume 118.24',
		"Que dit la Bible sur l'amour ?",
		'Comment prier ?',
		'Pourquoi Dieu permet-il la souffrance ?',
		'Que dit la Bible sur le pardon ?',
		'Jean 3.16',
		'Dieu et le travail'
	]).slice(0, 6);

	type verse = {
		text: string;
		reference: BibleRef;
	};

	let verses: verse[] = $state([]);

	function setUrlQuestion(q: string) {
		const url = new URL(window.location.href);
		if (q) {
			url.searchParams.set('question', q);
		} else {
			url.searchParams.delete('question');
		}
		goto(url.toString(), { replaceState: true });
	}

	async function askQuestion(q: string) {
		question = q;
		setUrlQuestion(q);
		handleQuestion(null);
	}

	async function handleQuestion(e: SubmitEvent | null) {
		if (e != null) {
			e.preventDefault();
			// Update URL only on explicit form submission
			setUrlQuestion(question);
		}
		loading = true;
		displayError = false;
		noAnswer = false;
		verses = [];

		// Check cache first
		const cached = getCachedResponse(question);
		if (cached) {
			verses = cached.verses;
			loading = false;
			return;
		}

		const payload = {
			question: question
		};
		const req = new Request(import.meta.env.VITE_SG_API + '/explorer', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});
		await fetch(req)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((response) => {
				verses = response.verses;
				if (verses == null || verses.length == 0) {
					noAnswer = true;
				} else {
					// Cache successful responses
					setCachedResponse(question, verses);
				}
			})
			.catch((error) => {
				displayError = true;
				console.log(payload, error);
			})
			.finally(() => {
				loading = false;
			});
	}

	function isFavorite(reference: BibleRef): boolean {
		if (!$userData) return false;
		return $userData.favorites.some((fav) => bibleRefEquals(fav.ref, reference));
	}
</script>

<div class="container mx-auto max-w-5xl p-2">
	<PageTitle title="Explorer la Bible" />

	<div class="mb-12 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
		<form
			onsubmit={handleQuestion}
			class="focus-within:ring-primary focus-within:border-primary flex items-stretch overflow-hidden rounded-lg border border-gray-300 focus-within:ring-2"
		>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				type="text"
				autocomplete="off"
				required
				minlength="5"
				maxlength="300"
				autofocus
				bind:value={question}
				placeholder="Rechercher un verset, un thème, un personnage..."
				class="focus:ring-none text-primary-text w-full border-none bg-transparent px-5 py-3 text-lg focus:outline-none"
			/>
			<button
				type="submit"
				disabled={loading}
				aria-label="Soumettre"
				class="bg-primary hover:bg-primary-strong inline-flex items-center overflow-hidden px-4 py-2 text-white hover:cursor-pointer"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class:animate-spin={loading}
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-circle-arrow-right-icon lucide-circle-arrow-right"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M8 12h8" />
					<path d="m12 16 4-4-4-4" />
				</svg>
			</button>
		</form>
	</div>

	{#if question.length == 0}
		<h2 class="text-primary-text mb-8 text-center text-2xl font-bold md:text-3xl">
			Suggestions de recherche
		</h2>
		<div class="mb-12 flex flex-wrap justify-center gap-4">
			{#each questions as q (q)}
				<button
					type="button"
					class="text-primary-text hover:bg-bgsecondary cursor-pointer rounded-full bg-white px-5 py-2 font-medium shadow-lg hover:text-white"
					onclick={() => askQuestion(q)}
				>
					{q}
				</button>
			{/each}
		</div>
	{/if}
</div>

{#if displayError || noAnswer || verses?.length > 0}
	<div class="container mx-auto max-w-5xl p-2">
		<div class="mb-12 rounded-xl bg-white p-8 shadow-lg">
			{#if displayError}
				<p class="text-md inline-flex items-center gap-4 lg:text-xl">
					<MessageCircleX class="text-primary" />
					Au commencement était le bug...<br />
					Parfois, même les serveurs ont besoin de repos. <br />
					Revenez bientôt, et peut-être que tout sera remis en ordre.
				</p>
			{/if}
			{#if noAnswer}
				<p class="text-md inline-flex items-center gap-4 lg:text-xl">
					<MessageCircleWarning class="text-primary" />
					Je suis désolé, mais je ne peux pas répondre à cette question.
				</p>
			{/if}
			{#if verses?.length > 0}
				{#each verses as verse (verse.reference)}
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

				<p class="mx-auto my-6 max-w-prose pt-12 text-center text-sm text-gray-500">
					Textes bibliques issus de la <em>Bible Louis Segond (1910)</em>. Domaine public. <br />
					L'intelligence artificielle est un outil puissant, mais elle peut se tromper. <br />
					Vérifiez toujours les informations fournies.
				</p>
			{/if}
		</div>
	</div>
{/if}
