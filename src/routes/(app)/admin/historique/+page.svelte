<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import { user } from '$lib/stores/user';

	type VerseReference = {
		bookCode: string;
		bookName: string;
		chapter: number;
		verseStart: number;
		verseEnd: number;
	};
	type Verse = {
		text: string;
		reference: VerseReference;
	};
	type HistoryItem = {
		dateTime: string;
		duration: number;
		question: string;
		verses: Verse[];
	};
	type HistoryResponse = {
		items: HistoryItem[];
	};

	let historyItems: HistoryItem[] = $state([]);

	$effect(() => {
		getExplorerHistory();
	});

	async function getExplorerHistory() {
		const raw = await fetch(import.meta.env.VITE_SG_API + '/admin/explorer/history', {
			headers: {
				Authorization: 'Bearer ' + $user?.access_token
			}
		});
		if (raw.ok) {
			const jsonData: HistoryResponse = await raw.json();
			historyItems = jsonData.items;
		} else {
			console.error(`HTTP error! Status: ${raw.status}`);
		}
	}

	function refString(ref: VerseReference): string {
		return (
			ref.bookName +
			' ' +
			ref.chapter +
			'.' +
			ref.verseStart +
			(ref.verseEnd !== ref.verseStart ? '-' + ref.verseEnd : '')
		);
	}
</script>

<div class="container mx-auto max-w-7xl p-2">
	<PageTitle title="Historique" />

	<div class="mb-8 flex justify-center">
		<a
			href="/admin"
			class="bg-primary hover:bg-primary-strong inline-flex items-center rounded-md px-4 py-2 text-white transition duration-300"
		>
			← Retour à l'administration
		</a>
	</div>

	<div class="mb-12 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
		<table class="w-full table-auto">
			<thead>
				<tr>
					<th>Date</th>
					<th>Durée</th>
					<th>Question</th>
					<th>Versets</th>
				</tr>
			</thead>
			<tbody>
				{#each historyItems as item (item)}
					<tr class="hover:bg-tertiary-text">
						<td class="p-1">{new Date(item.dateTime).toISOString()}</td>
						<td class="p-1">{(item.duration / 1000000000).toFixed(2)}s</td>
						<td class="p-1">{item.question}</td>
						<td class="p-1">
							{#each item.verses as verse (verse.reference)}
								<span class="m-1 rounded bg-gray-200 shadow-md" title={verse.text}>
									{refString(verse.reference)}
								</span>
							{/each}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
