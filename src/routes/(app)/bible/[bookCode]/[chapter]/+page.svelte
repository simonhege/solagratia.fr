<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import type { PageProps } from './$types';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { data }: PageProps = $props();

	const title = $derived(
		data.book.name + (data.book.chapters == 1 ? '' : ', chapitre ' + data.chapter)
	);

	// reactive hash and derived highlighted set (runes mode: use $effect)
	let hash = $state('');
	let highlighted = $state(new Set<number>());
	$effect(() => {
		highlighted = parseHash(hash);
	});

	function isFavorite(verse: number): boolean {
		return data.favorites && data.favorites.includes(verse);
	}

	function parseHash(h: string | null): Set<number> {
		const out = new Set<number>();
		if (!h) return out;
		// Trim leading '#'
		const raw = h.startsWith('#') ? h.slice(1) : h;
		if (!raw) return out;

		// Allow comma separated tokens, each token is either N or N-M
		const parts = raw.split(',');
		for (const p of parts) {
			const tok = p.trim();
			if (!tok) continue;
			const rangeMatch = tok.match(/^(\d+)-(\d+)$/);
			if (rangeMatch) {
				const a = parseInt(rangeMatch[1], 10);
				const b = parseInt(rangeMatch[2], 10);
				if (!Number.isNaN(a) && !Number.isNaN(b)) {
					const start = Math.min(a, b);
					const end = Math.max(a, b);
					for (let n = start; n <= end; n++) out.add(n);
				}
			} else {
				const n = parseInt(tok, 10);
				if (!Number.isNaN(n)) out.add(n);
			}
		}
		return out;
	}

	// On client mount, read initial hash and listen for changes
	onMount(() => {
		if (!browser) return;
		hash = window.location.hash;

		const onHashChange = () => {
			hash = window.location.hash;
		};

		window.addEventListener('hashchange', onHashChange);
		return () => window.removeEventListener('hashchange', onHashChange);
	});
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
					<span
						id={'v' + (i + 1)}
						class="px-1strong rounded"
						class:bg-primary-strong={isFavorite(i + 1) && highlighted.has(i + 1)}
						class:bg-secondary-text={isFavorite(i + 1) && !highlighted.has(i + 1)}
						class:bg-primary={!isFavorite(i + 1) && highlighted.has(i + 1)}
						class:text-white={isFavorite(i + 1) || highlighted.has(i + 1)}
					>
						<span class="ml-1 text-sm"><sup>{i + 1}</sup></span>&nbsp;<span>{verse} </span>
					</span>&puncsp;
				{/each}
			</p>
		</article>

		{@render prevNext()}

		<footer class="mt-4 text-center text-sm">
			Texte biblique tiré de la <em>Bible Louis Segond (1910)</em>. Domaine public.
		</footer>
	</div>
</div>
