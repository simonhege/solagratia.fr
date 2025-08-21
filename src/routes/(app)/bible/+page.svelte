<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import type { PageProps } from './$types';
	import { BookOpen, ChevronRight } from '@lucide/svelte';

	let { data }: PageProps = $props();

	let search = $state('');
	let books = $derived.by(() => {
		let all = data.books;
		let filtered: unknown[] = [];
		all.forEach((book: { name: string; code: string }) => {
			if (
				book.name.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
				book.code.toLowerCase().indexOf(search.toLowerCase()) > -1
			) {
				filtered.push(book);
			}
		});
		return filtered.length == 0 ? all : filtered;
	});
</script>

<div class="container mx-auto max-w-5xl p-2">
	<PageTitle title="Lire la Bible" />

	<div class="mb-4 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
		<div
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
				bind:value={search}
				placeholder="Indiquez le nom du livre à ouvrir ..."
				class="focus:ring-none text-primary-text w-full border-none bg-transparent px-5 py-3 focus:outline-none lg:text-lg"
			/>
			<button
				type="submit"
				class="bg-primary inline-flex items-center overflow-hidden px-4 py-2 text-white"
			>
				<BookOpen />
			</button>
		</div>
	</div>

	<div class="mb-12 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
		{#each books as book (book)}
			<details class="group rounded-xl bg-white p-4 shadow-lg" open={books.length == 1}>
				<summary
					class="hover:text-primary hover:shadow-primary flex cursor-pointer items-center lg:text-lg [&::-webkit-details-marker]:hidden [&::marker]:hidden"
				>
					<span>{book.name}</span>
					<ChevronRight
						class="ml-auto transition-transform duration-200 ease-in-out group-open:rotate-90"
					/>
				</summary>
				<div class="mt-2 flex flex-wrap gap-1">
					{#each { length: book.chapters }, chapter}
						<a
							href="/bible/{book.code}/{chapter + 1}"
							class="hover:bg-primary block min-w-10 rounded border-2 border-black text-center dark:border-gray-200"
							>{chapter + 1}</a
						>
					{/each}
				</div>
			</details>
		{/each}
	</div>
</div>
