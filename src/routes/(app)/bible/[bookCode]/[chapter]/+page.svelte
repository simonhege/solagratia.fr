<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import type { PageProps } from './$types';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	let { data }: PageProps = $props();

	const title = $derived(
		data.book.name + (data.book.chapters == 1 ? '' : ', chapitre ' + data.chapter)
	);

	function isFavorite(verse: number): boolean {
		return data.favorites && data.favorites.includes(verse);
	}
</script>

{#snippet prevNext()}
	{#if data.book.chapters > 1}
		{#if data.chapter == 1}
			<nav class="flex justify-between">
				<div></div>
				<a href="/bible/{data.book.code}/{data.chapter + 1}" class="flex items-center"
					>{data.book.name} {data.chapter + 1} <ChevronRight /></a
				>
			</nav>
		{:else if data.chapter == data.book.chapters}
			<nav class="flex justify-between">
				<a href="/bible/{data.book.code}/{data.chapter - 1}" class="flex items-center"
					><ChevronLeft /> {data.book.name} {data.chapter - 1}</a
				>
			</nav>
		{:else}
			<nav class="flex justify-between">
				<a href="/bible/{data.book.code}/{data.chapter - 1}" class="flex items-center"
					><ChevronLeft /> {data.book.name} {data.chapter - 1}</a
				>
				<a href="/bible/{data.book.code}/{data.chapter + 1}" class="flex items-center"
					>{data.book.name} {data.chapter + 1} <ChevronRight /></a
				>
			</nav>
		{/if}
	{/if}
{/snippet}

<div class="container mx-auto max-w-5xl p-2">
	<PageTitle {title} />

	<div class="mb-12 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
		{@render prevNext()}

		<article class="prose dark:prose-invert lg:prose-xl my-2">
			<p>
				{#each data.verses as verse, i (i)}
					<span id={'' + (i + 1)} class={isFavorite(i + 1) ? 'bg-secondary-text text-white' : ''}>
						<span class="ml-1 text-sm"> <sup>{i + 1}</sup></span>&nbsp;<span>{verse} </span>
					</span>
				{/each}
			</p>
		</article>

		{@render prevNext()}

		<footer class="mt-4 text-center text-sm">
			Texte biblique tiré de la <em>Bible Louis Segond (1910)</em>. Domaine public.
		</footer>
	</div>
</div>
