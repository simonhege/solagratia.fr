<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';

	type Stats = {
		headers?: string[];
		values?: Map<string, number[]>;
	};
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

	let inputPeriod = $state('day');
	let inputApiKey = $state('');
	let pageViewedStats: Stats = $state({});
	let historyItems: HistoryItem[] = $state([]);

	$effect(() => {
		if (inputApiKey.length > 0) {
			getPageViewedStats(inputPeriod, inputApiKey);
			getExplorerHistory(inputApiKey);
		}
	});

	async function getPageViewedStats(period: string, apiKey: string) {
		const raw = await window.fetch(
			'https://api.solagratia.fr/admin/pageViewed/stats?period=' + period,
			{
				headers: {
					'X-Api-Key': apiKey
				}
			}
		);
		if (raw.ok) {
			const jsonData: Stats = await raw.json();
			pageViewedStats = jsonData;
		} else {
			console.error(`HTTP error! Status: ${raw.status}`);
		}
	}
	async function getExplorerHistory(apiKey: string) {
		const raw = await window.fetch('https://api.solagratia.fr/admin/explorer/history', {
			headers: {
				'X-Api-Key': apiKey
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

	$effect(() => {
		if (inputApiKey.length > 0) {
			getPageViewedStats(inputPeriod, inputApiKey);
			getExplorerHistory(inputApiKey);
		}
	});
</script>

<div class="container mx-auto max-w-7xl p-2">
	<PageTitle title="Administration" />
	<div class="flex items-center gap-2">
		<label for="api-key">Clé: </label>
		<input type="password" name="api-key" bind:value={inputApiKey} />
	</div>

	<h2 class="text-primary-text mb-8 text-center text-2xl font-bold md:text-3xl">Statistiques</h2>
	{#if pageViewedStats && pageViewedStats.headers && pageViewedStats.values}
		<div class="mb-12 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
			<table class="w-full table-auto">
				<thead>
					<tr>
						<th></th>
						{#each pageViewedStats.headers as header (header)}
							<th>{header}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each Object.entries(pageViewedStats.values) as [page, values] (page)}
						<tr class="hover:bg-tertiary-text text-center">
							<td class="p-1 text-left">{page}</td>
							{#each values as v (v)}
								<td>{v}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<h2 class="text-primary-text mb-8 text-center text-2xl font-bold md:text-3xl">Historique</h2>

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
