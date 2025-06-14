<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import { MessageCircleWarning, MessageCircleX, Share2 } from '@lucide/svelte';

	let question = $state('');
	let loading = $state(false);
	let displayError = $state(false);
	let noAnswer = $state(false);

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

	type verseReference = {
		bookCode: string;
		bookName: string;
		chapter: number;
		verseStart: number;
		verseEnd: number;
	};
	type verse = {
		text: string;
		reference: verseReference;
	};
	function refString(ref: verseReference): string {
		return (
			ref.bookName +
			' ' +
			ref.chapter +
			'.' +
			ref.verseStart +
			(ref.verseEnd !== ref.verseStart ? '-' + ref.verseEnd : '')
		);
	}
	function toHash(ref: verseReference): string {
		return (
			ref.bookCode +
			'/' +
			ref.chapter +
			'/' +
			ref.verseStart +
			(ref.verseEnd !== ref.verseStart ? '-' + ref.verseEnd : '')
		);
	}

	let verses: verse[] = $state([]);

	async function askQuestion(q: string) {
		question = q;
		handleQuestion(null);
	}

	async function handleQuestion(e: SubmitEvent | null) {
		if (e != null) {
			e.preventDefault();
		}
		loading = true;
		displayError = false;
		noAnswer = false;
		verses = [];
		const payload = {
			question: question
		};
		const req = new Request('https://api.solagratia.fr/explorer', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});
		await window
			.fetch(req)
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
						<p class="text-primary-text text-sm lg:text-lg">
							<a
								class="hover:text-primary hover:underline"
								href={'/bible/' + verse.reference.bookCode + '/' + verse.reference.chapter}
							>
								{refString(verse.reference)}
							</a>
							<a
								class="hover:text-primary float-end hover:underline"
								href={'/partager/' + toHash(verse.reference)}
							>
								<Share2 size="20" />
							</a>
						</p>
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
