<script lang="ts">
	import { goto } from '$app/navigation';
	import { MeditationSummary } from '$lib/models/meditation';
	import { BibleRef } from '$lib/models/bible';
	import PageTitle from '$lib/PageTitle.svelte';
	import { user } from '$lib/stores/user';
	import { BookmarkCheck, BookmarkPlus, NotebookPen, Pen } from '@lucide/svelte';

	let meditations = $state<MeditationSummary[]>([]);
	let newReference = $state('');
	let isSearching = $state(false);
	$effect(() => {
		getAll();
	});

	async function getAll() {
		const raw = await fetch(import.meta.env.VITE_SG_API + '/admin/meditations', {
			headers: {
				Authorization: 'Bearer ' + $user?.access_token
			}
		});
		if (raw.ok) {
			const jsonData: any[] = await raw.json();
			meditations = jsonData.map((v: any) => MeditationSummary.fromJSON(v));
		} else {
			console.error(`HTTP error! Status: ${raw.status}`);
		}
	}

	async function goToNewMeditation() {
		const ref = newReference.trim();
		if (!ref) return;

		const structuredRefRegex = /^[1-9A-Z]{3}\/\d+\/\d+(-\d+)?$/;
		if (structuredRefRegex.test(ref)) {
			goto('/admin/init/' + ref);
			return;
		}

		// Search for the reference using the API
		isSearching = true;
		try {
			const res = await fetch(
				import.meta.env.VITE_SG_API + '/bible/search?ref=' + encodeURIComponent(ref)
			);
			if (res.ok) {
				const data = await res.json();
				const bibleRef = BibleRef.fromJSON(data.reference);
				goto('/admin/init/' + bibleRef.toHash());
			} else {
				console.error(`Search failed: ${res.status}`);
			}
		} catch (err) {
			console.error('Error searching reference:', err);
		} finally {
			isSearching = false;
		}
	}
</script>

<div class="container mx-auto max-w-7xl p-2">
	<PageTitle title="Editer les méditations" />

	<div class="mb-12 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
		<form
			class="mb-6 flex items-center gap-2"
			onsubmit={(e) => {
				e.preventDefault();
				goToNewMeditation();
			}}
		>
			<input
				type="text"
				bind:value={newReference}
				placeholder="Référence (ex: Jean 3.16 ou JHN/3/16)"
				class="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
				disabled={isSearching}
			/>
			<button
				type="submit"
				class="bg-primary hover:bg-primary-strong  inline-flex items-center  rounded-md px-4 py-2 text-white transition duration-300 disabled:opacity-50"
				disabled={isSearching}
			>
				<BookmarkPlus class="mr-2" /> {isSearching ? 'Recherche...' : 'Nouvelle méditation'}
			</button>
		</form>
		<table class="w-full table-auto">
			<thead>
				<tr>
					<th>Status</th>
					<th>Date</th>
					<th>Titre</th>
					<th>Versets</th>
					<th>Action</th>
				</tr>
			</thead>
			<tbody>
				{#each meditations as meditation}
					<tr>
						<td>
							{#if meditation.isActive()}
								<BookmarkCheck />
							{:else}
								<NotebookPen class="text-primary" />
							{/if}
						</td>
						<td>{meditation.formattedDate()}</td>
						<td title={meditation.short}>
							<a href={'/se-ressourcer/' + meditation.slug} class="hover:underline"
								>
								{meditation.title}
							</a>
						</td>
						<td title={meditation.verses.text}>
							<a href={meditation.verses.reference.toHref()} class="hover:underline"
								>
							{meditation.verses.reference.toString()}
							</a>
						</td>
						<td>
							<a
								href={'/admin/editer/' + meditation.slug}
								class="bg-primary hover:bg-primary-strong inline-flex items-center rounded-md px-2 py-1 text-white transition duration-300"
							>
								<Pen class="mr-2" /> Editer
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
