<script lang="ts">
	import { MeditationSummary } from '$lib/models/meditation';
	import PageTitle from '$lib/PageTitle.svelte';
	import { user } from '$lib/stores/user';
	import { BookmarkCheck, NotebookPen, Pen } from '@lucide/svelte';

	let meditations = $state<MeditationSummary[]>([]);
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
</script>

<div class="container mx-auto max-w-7xl p-2">
	<PageTitle title="Editer les méditations" />

	<div class="mb-12 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
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
						<td title={meditation.short}>{meditation.title}</td>
						<td title={meditation.verses.text}>{meditation.verses.reference.toString()}</td>
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
