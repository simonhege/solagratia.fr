<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import type { PageProps } from './$types';
	import { ChevronLeft, ChevronRight, Star, X, Share2, BookmarkPlus } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { user, isAdmin } from '$lib/stores/user';
	import { userData, addFavorite, removeFavorite, isFavorite } from '$lib/stores/userData';
	import { BibleRef } from '$lib/models/bible';

	let { data }: PageProps = $props();

	const title = $derived(
		data.book.name + (data.book.chapters == 1 ? '' : ', chapitre ' + data.chapter)
	);

	// Selected verse range for the toolbar
	let selectionStart = $state<number | null>(null);
	let selectionEnd = $state<number | null>(null);

	// Check if a verse is in the current selection
	function isSelected(verse: number): boolean {
		if (selectionStart === null || selectionEnd === null) return false;
		return verse >= selectionStart && verse <= selectionEnd;
	}

	// Toggle selection on verse click - extend if adjacent, otherwise start new selection
	function onVerseClick(verse: number) {
		if (!$user) return; // Only allow selection if logged in
		
		// If no selection, start a new one
		if (selectionStart === null || selectionEnd === null) {
			selectionStart = verse;
			selectionEnd = verse;
			return;
		}

		// If clicking on selected verse, deselect
		if (selectionStart === verse && selectionEnd === verse) {
			selectionStart = null;
			selectionEnd = null;
			return;
		}

		// If clicking on verse adjacent to selection, extend it
		if (verse === selectionStart - 1) {
			selectionStart = verse;
			return;
		}
		if (verse === selectionEnd + 1) {
			selectionEnd = verse;
			return;
		}

		// If clicking within selection, shrink to that verse
		if (verse >= selectionStart && verse <= selectionEnd) {
			selectionStart = verse;
			selectionEnd = verse;
			return;
		}

		// Otherwise, start a new selection
		selectionStart = verse;
		selectionEnd = verse;
	}

	// Add the selected verses to favorites
	function addToFavorites() {
		if (selectionStart === null || selectionEnd === null) return;
		const ref = new BibleRef(data.book.code, data.book.name, data.chapter, selectionStart, selectionEnd);
		addFavorite(ref);
		const newVerses = [...Array(selectionEnd - selectionStart + 1).keys()].map((n) => n + selectionStart!);
		data.favorites = (data.favorites ?? []).concat(newVerses);
		selectionStart = null;
		selectionEnd = null;
	}

	// Remove the selected verses from favorites
	function removeFromFavorites() {
		if (selectionStart === null || selectionEnd === null) return;
		const ref = new BibleRef(data.book.code, data.book.name, data.chapter, selectionStart, selectionEnd);
		removeFavorite(ref);
		data.favorites = (data.favorites ?? []).filter(
			(v: number) => v < selectionStart! || v > selectionEnd!
		);
		selectionStart = null;
		selectionEnd = null;
	}

	// Close toolbar
	function closeToolbar() {
		selectionStart = null;
		selectionEnd = null;
	}

	// Format selection display
	function formatSelection(): string {
		if (selectionStart === null || selectionEnd === null) return '';
		if (selectionStart === selectionEnd) {
			return `${data.book.name} ${data.chapter}:${selectionStart}`;
		}
		return `${data.book.name} ${data.chapter}:${selectionStart}-${selectionEnd}`;
	}

	// Check if entire selection is in favorites
	function isSelectionFavorite(): boolean {
		if (selectionStart === null || selectionEnd === null) return false;
		const ref = new BibleRef(data.book.code, data.book.name, data.chapter, selectionStart, selectionEnd);
		return isFavorite($userData?.favorites, ref) ?? false;
	}

	// Get selection hash for sharing/init URLs
	function getSelectionHash(): string {
		if (selectionStart === null || selectionEnd === null) return '';
		const ref = new BibleRef(data.book.code, data.book.name, data.chapter, selectionStart, selectionEnd);
		return ref.toHash();
	}

	// reactive hash and derived highlighted set (runes mode: use $effect)
	let hash = $state('');
	let highlighted = $state(new Set<number>());
	$effect(() => {
		highlighted = parseHash(hash);
	});

	function isFavorited(verse: number): boolean {
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
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<span
						id={'v' + (i + 1)}
						class="rounded px-1"
						class:bg-primary-strong={isFavorited(i + 1) && highlighted.has(i + 1)}
						class:bg-secondary-text={isFavorited(i + 1) && !highlighted.has(i + 1)}
						class:bg-primary={!isFavorited(i + 1) && highlighted.has(i + 1)}
						class:text-white={isFavorited(i + 1) || highlighted.has(i + 1)}
						class:ring-2={isSelected(i + 1)}
						class:ring-primary={isSelected(i + 1)}
						class:cursor-pointer={$user}
						onclick={() => onVerseClick(i + 1)}
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

<!-- Toolbar for favorites - appears when a verse is selected -->
{#if selectionStart !== null && selectionEnd !== null && $user}
	<div
		class="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white px-4 py-3 shadow-lg"
	>
		<div class="mx-auto flex max-w-5xl items-center justify-between">
			<div class="text-primary-text">
				<span class="font-medium">{formatSelection()}</span>
			</div>
			<div class="flex items-center gap-2">
				{#if isSelectionFavorite()}
					<button
						onclick={removeFromFavorites}
						class="text-primary hover:bg-primary-strong flex cursor-pointer items-center gap-2 rounded-full p-2 transition-colors hover:text-white"
						aria-label="Retirer des favoris"
					>
						<Star class="fill-current" size={24} />
					</button>
				{:else}
					<button
						onclick={addToFavorites}
						class="text-primary-text hover:bg-primary flex cursor-pointer items-center gap-2 rounded-full p-2 transition-colors hover:text-white"
						aria-label="Ajouter aux favoris"
					>
						<Star size={24} />
					</button>
				{/if}
				<a
					href={'/partager/' + getSelectionHash()}
					class="text-primary-text hover:bg-primary flex cursor-pointer items-center rounded-full p-2 transition-colors hover:text-white"
					aria-label="Partager"
				>
					<Share2 size={24} />
				</a>
				{#if $isAdmin}
					<a
						href={'/admin/init/' + getSelectionHash()}
						class="text-primary-text hover:bg-primary flex cursor-pointer items-center rounded-full p-2 transition-colors hover:text-white"
						aria-label="Initialiser une méditation"
					>
						<BookmarkPlus size={24} />
					</a>
				{/if}
				<button
					onclick={closeToolbar}
					class="text-secondary-text hover:bg-gray-200 cursor-pointer rounded-full p-2 transition-colors"
					aria-label="Fermer"
				>
					<X size={24} />
				</button>
			</div>
		</div>
	</div>
{/if}
