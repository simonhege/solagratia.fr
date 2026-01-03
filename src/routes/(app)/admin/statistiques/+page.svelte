<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import { user } from '$lib/stores/user';

	type Stats = {
		headers?: string[];
		values?: Map<string, number[]>;
	};

	let inputPeriod = $state('day');
	let pageViewedStats: Stats = $state({});

	$effect(() => {
		getPageViewedStats(inputPeriod);
	});

	async function getPageViewedStats(period: string) {
		const raw = await fetch(
			import.meta.env.VITE_SG_API + '/admin/pageViewed/stats?period=' + period,
			{
				headers: {
					Authorization: 'Bearer ' + $user?.access_token
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
</script>

<div class="container mx-auto max-w-7xl p-2">
	<PageTitle title="Statistiques" />

	<div class="mb-8 flex justify-center">
		<a
			href="/admin"
			class="bg-primary hover:bg-primary-strong inline-flex items-center rounded-md px-4 py-2 text-white transition duration-300"
		>
			← Retour à l'administration
		</a>
	</div>

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
							{#each values as v}
								<td>{v}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
