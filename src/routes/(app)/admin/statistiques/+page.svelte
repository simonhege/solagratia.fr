<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import { user } from '$lib/stores/user';
	import {
		TrendingUp,
		Eye,
		Calendar,
		ArrowLeft,
		RefreshCw,
		ChevronDown,
		ChevronUp,
		ChevronRight,
		FolderOpen,
		House,
		Bot,
		Users,
		ChartColumn
	} from '@lucide/svelte';
	import { Chart, registerables } from 'chart.js';

	Chart.register(...registerables);

	type Stats = {
		rawData?: {
			periodStart: string;
			periodEnd: string;
			dimensions: {
				page: string;
				ua_type: string;
			};
			count: number;
		}[];
	};

	type Period = 'day' | 'week' | 'month';
	type TrafficFilter = 'all' | 'humans' | 'bots';

	const periods: { value: Period; label: string; description: string }[] = [
		{ value: 'day', label: 'Jour', description: 'Par jour' },
		{ value: 'week', label: 'Semaine', description: 'Par semaine' },
		{ value: 'month', label: 'Mois', description: 'Par mois' }
	];

	const trafficFilters: { value: TrafficFilter; label: string; icon: typeof Bot }[] = [
		{ value: 'all', label: 'Tout', icon: Eye },
		{ value: 'humans', label: 'Humains', icon: Users },
		{ value: 'bots', label: 'Robots', icon: Bot }
	];

	let selectedPeriod: Period = $state('day');
	let selectedTrafficFilter: TrafficFilter = $state('all');
	let rawStats: Stats = $state({});  // Raw data from API
	let isLoading = $state(false);
	let error: string | null = $state(null);
	let chartCanvas: HTMLCanvasElement;
	let showAllPages = $state(false);
	let currentPathPrefix = $state(''); // For drill-down navigation
	const maxPagesShown = 10;

	// Store chart instance outside reactive system to avoid Svelte proxy conflicts
	const chartRef: { instance: Chart | null } = { instance: null };

	// Filter and aggregate data based on traffic filter
	let filteredStats = $derived.by(() => {
		if (!rawStats.rawData) return { headers: [], values: {}, formattedHeaders: [] };

		// Extract and sort unique time periods
		const periodsSet = new Set<string>();
		for (const item of rawStats.rawData) {
			periodsSet.add(item.periodStart);
		}
		const headers = Array.from(periodsSet).sort();

		// Create user-friendly formatted headers
		const formattedHeaders = headers.map(dateStr => {
			const date = new Date(dateStr);
			if (selectedPeriod === 'month') {
				return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
			}
			return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
		});

		// Filter data based on traffic filter
		const filteredData = rawStats.rawData.filter(item => {
			const uaType = item.dimensions.ua_type.toLowerCase();
			const isBot = uaType.includes('bot');
			
			if (selectedTrafficFilter === 'all') {
				return true;
			} else if (selectedTrafficFilter === 'humans') {
				return !isBot;
			} else if (selectedTrafficFilter === 'bots') {
				return isBot;
			}
			return false;
		});

		// Aggregate by page and time period
		const values: Record<string, number[]> = {};
		
		for (const item of filteredData) {
			const page = item.dimensions.page;
			const periodIndex = headers.indexOf(item.periodStart);
			
			if (!values[page]) {
				values[page] = new Array(headers.length).fill(0);
			}
			
			if (periodIndex >= 0) {
				values[page][periodIndex] += item.count;
			}
		}

		return { headers, values, formattedHeaders };
	});

	// Breadcrumb segments for current path
	let breadcrumbs = $derived.by(() => {
		if (!currentPathPrefix) return [];
		const parts = currentPathPrefix.split('/').filter(Boolean);
		const crumbs: { label: string; path: string }[] = [];
		let accumulated = '';
		for (const part of parts) {
			accumulated += '/' + part;
			crumbs.push({ label: part, path: accumulated });
		}
		return crumbs;
	});

	// Group pages by next path segment for drill-down view
	type GroupedEntry = {
		prefix: string;
		displayName: string;
		isGroup: boolean;
		totalViews: number;
		periodValues: number[];
		childCount: number;
	};

	let groupedEntries = $derived.by(() => {
		if (!filteredStats.values || !filteredStats.headers) return [];

		const entries = Object.entries(filteredStats.values);
		const headerCount = filteredStats.headers.length;

		// Filter entries that match current prefix
		const prefixFilteredEntries = currentPathPrefix
			? entries.filter(([path]) => path.startsWith(currentPathPrefix + '/') || path === currentPathPrefix)
			: entries;

		// Group by next segment
		const groups = new Map<string, { paths: [string, number[]][]; isExact: boolean }>();

		for (const [path, values] of prefixFilteredEntries) {
			const remainder = currentPathPrefix ? path.slice(currentPathPrefix.length) : path;
			const segments = remainder.split('/').filter(Boolean);

			if (segments.length === 0) {
				// Exact match to current prefix
				groups.set(path, { paths: [[path, values]], isExact: true });
			} else {
				// Group by first segment
				const nextSegment = segments[0];
				const groupKey = currentPathPrefix ? `${currentPathPrefix}/${nextSegment}` : `/${nextSegment}`;

				if (!groups.has(groupKey)) {
					groups.set(groupKey, { paths: [], isExact: false });
				}
				groups.get(groupKey)!.paths.push([path, values]);
			}
		}

		// Convert to grouped entries
		const result: GroupedEntry[] = [];

		for (const [prefix, { paths, isExact }] of groups) {
			const periodValues = new Array(headerCount).fill(0);
			let totalViews = 0;

			for (const [, values] of paths) {
				for (let i = 0; i < values.length; i++) {
					periodValues[i] += values[i] ?? 0;
					totalViews += values[i] ?? 0;
				}
			}

			const segments = prefix.split('/').filter(Boolean);
			const displayName = isExact ? prefix : segments[segments.length - 1] || prefix;

			result.push({
				prefix,
				displayName: isExact ? prefix : displayName + '/',
				isGroup: !isExact && paths.length > 1,
				totalViews,
				periodValues,
				childCount: paths.length
			});
		}

		// Sort by total views descending
		return result.sort((a, b) => b.totalViews - a.totalViews);
	});

	let displayedGroupedEntries = $derived(
		showAllPages ? groupedEntries : groupedEntries.slice(0, maxPagesShown)
	);

	// Computed values
	let totalViews = $derived.by(() => {
		if (!filteredStats.values) return 0;
		return Object.values(filteredStats.values).reduce(
			(sum, values) => sum + values.reduce((a, b) => a + b, 0),
			0
		);
	});

	let uniquePages = $derived(Object.keys(filteredStats.values).length);

	let topPage = $derived.by(() => {
		if (!filteredStats.values) return { page: '-', views: 0 };
		const entries = Object.entries(filteredStats.values);
		if (entries.length === 0) return { page: '-', views: 0 };

		const sorted = entries.sort(
			(a, b) => b[1].reduce((s, v) => s + v, 0) - a[1].reduce((s, v) => s + v, 0)
		);
		return {
			page: sorted[0][0],
			views: sorted[0][1].reduce((s, v) => s + v, 0)
		};
	});

	$effect(() => {
		getPageViewedStats(selectedPeriod);
	});

	$effect(() => {
		// Re-run chart when data or traffic filter changes
		if (filteredStats.headers && filteredStats.values && chartCanvas && selectedTrafficFilter) {
			updateChart();
		}

		return () => {
			if (chartRef.instance) {
				chartRef.instance.destroy();
				chartRef.instance = null;
			}
		};
	});

	async function getPageViewedStats(period: string) {
		isLoading = true;
		error = null;
		// Reset path prefix when changing period
		currentPathPrefix = '';
		showAllPages = false;

		try {
			const url = new URL(import.meta.env.VITE_SG_API + '/admin/pageViewed/stats');
			url.searchParams.set('period', period);
			url.searchParams.set('drillDowns', 'page,ua_type');

			const raw = await fetch(url.toString(), {
				headers: {
					Authorization: 'Bearer ' + $user?.access_token
				}
			});
			if (raw.ok) {
				const jsonData: Stats = await raw.json();
				rawStats = jsonData;
			} else {
				error = `Erreur HTTP: ${raw.status}`;
				console.error(`HTTP error! Status: ${raw.status}`);
			}
		} catch (e) {
			error = 'Erreur de connexion au serveur';
			console.error(e);
		} finally {
			isLoading = false;
		}
	}

	function updateChart() {
		if (!filteredStats.headers || !filteredStats.values || !filteredStats.formattedHeaders || !rawStats.rawData) return;

		const formattedHeaders = [...filteredStats.formattedHeaders];
		
		// Calculate humans and bots separately for each time period
		const humansData = new Array(formattedHeaders.length).fill(0);
		const botsData = new Array(formattedHeaders.length).fill(0);
		
		for (const item of rawStats.rawData) {
			const periodIndex = filteredStats.headers.indexOf(item.periodStart);
			if (periodIndex >= 0) {
				const uaType = item.dimensions.ua_type.toLowerCase();
				const isBot = uaType.includes('bot');
				
				if (isBot) {
					botsData[periodIndex] += item.count;
				} else {
					humansData[periodIndex] += item.count;
				}
			}
		}

		// Build datasets based on selected filter
		const datasets = [];
		const isStacked = selectedTrafficFilter === 'all';

		if (selectedTrafficFilter === 'all' || selectedTrafficFilter === 'humans') {
			datasets.push({
				label: 'Humains',
				data: humansData,
				backgroundColor: 'rgba(218, 165, 32, 0.8)',
				borderColor: 'rgba(218, 165, 32, 1)',
				borderWidth: 1
			});
		}

		if (selectedTrafficFilter === 'all' || selectedTrafficFilter === 'bots') {
			datasets.push({
				label: 'Robots',
				data: botsData,
				backgroundColor: 'rgba(98, 125, 152, 0.8)',
				borderColor: 'rgba(98, 125, 152, 1)',
				borderWidth: 1
			});
		}

		if (chartRef.instance) {
			chartRef.instance.destroy();
		}

		chartRef.instance = new Chart(chartCanvas, {
			type: 'bar',
			data: {
				labels: formattedHeaders,
				datasets
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					intersect: false,
					mode: 'index'
				},
				plugins: {
					legend: {
						position: 'bottom',
						labels: {
							usePointStyle: true,
							padding: 20
						}
					},
					tooltip: {
						backgroundColor: 'rgba(26, 46, 64, 0.9)',
						titleColor: '#fff',
						bodyColor: '#fff',
						padding: 12,
						cornerRadius: 8
					}
				},
				scales: {
					x: {
						stacked: isStacked,
						grid: {
							display: false
						}
					},
					y: {
						stacked: isStacked,
						beginAtZero: true,
						grid: {
							color: 'rgba(0, 0, 0, 0.05)'
						}
					}
				}
			}
		});
	}

	function refresh() {
		getPageViewedStats(selectedPeriod);
	}

	function navigateTo(path: string) {
		currentPathPrefix = path;
		showAllPages = false;
	}
</script>

<div class="container mx-auto max-w-7xl p-4">
	<PageTitle title="Statistiques" />

	<!-- Header with navigation and controls -->
	<div class="mb-8 flex flex-wrap items-center justify-between gap-4">
		<a
			href="/admin"
			class="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-primary-text shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
		>
			<ArrowLeft size={18} />
			<span>Retour</span>
		</a>

		<div class="flex flex-wrap items-center gap-3">
			<!-- Traffic filter -->
			<div class="flex rounded-lg bg-white p-1 shadow-md">
				{#each trafficFilters as filter}
					<button
						onclick={() => (selectedTrafficFilter = filter.value)}
						class="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all {selectedTrafficFilter ===
						filter.value
							? 'bg-primary text-white shadow-sm'
							: 'text-primary-text hover:bg-bgstart'}"
					>
						<filter.icon size={16} />
						{filter.label}
					</button>
				{/each}
			</div>

			<!-- Period selector -->
			<div class="flex rounded-lg bg-white p-1 shadow-md">
				{#each periods as period}
					<button
						onclick={() => (selectedPeriod = period.value)}
						class="rounded-md px-4 py-2 text-sm font-medium transition-all {selectedPeriod ===
						period.value
							? 'bg-primary text-white shadow-sm'
							: 'text-primary-text hover:bg-bgstart'}"
						title={period.description}
					>
						{period.label}
					</button>
				{/each}
			</div>

			<!-- Refresh button -->
			<button
				onclick={refresh}
				disabled={isLoading}
				class="rounded-lg bg-white p-2.5 text-primary-text shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
				title="Actualiser"
			>
				<RefreshCw size={18} class={isLoading ? 'animate-spin' : ''} />
			</button>
		</div>
	</div>

	{#if error}
		<div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
			{error}
		</div>
	{/if}

	{#if isLoading && !rawStats.rawData}
		<div class="flex items-center justify-center py-20">
			<div class="flex flex-col items-center gap-4">
				<RefreshCw size={40} class="animate-spin text-primary" />
				<p class="text-secondary-text">Chargement des statistiques...</p>
			</div>
		</div>
	{:else if rawStats.rawData}
		<!-- Summary cards -->
		<div class="mb-8 grid gap-4 md:grid-cols-3">
			<div class="rounded-xl bg-white p-6 shadow-md">
				<div class="flex items-start justify-between">
					<div>
						<p class="text-sm font-medium text-secondary-text">Total des vues</p>
						<p class="mt-2 text-3xl font-bold text-primary-text">{totalViews.toLocaleString()}</p>
					</div>
					<div class="rounded-lg bg-primary/10 p-3 text-primary">
						<Eye size={24} />
					</div>
				</div>
			</div>

			<div class="rounded-xl bg-white p-6 shadow-md">
				<div class="flex items-start justify-between">
					<div>
						<p class="text-sm font-medium text-secondary-text">Pages visitées</p>
						<p class="mt-2 text-3xl font-bold text-primary-text">{uniquePages}</p>
					</div>
					<div class="rounded-lg bg-bgsecondary/10 p-3 text-bgsecondary">
						<ChartColumn size={24} />
					</div>
				</div>
			</div>

			<div class="rounded-xl bg-white p-6 shadow-md">
				<div class="flex items-start justify-between">
					<div>
						<p class="text-sm font-medium text-secondary-text">Page la plus vue</p>
						<p class="mt-2 truncate text-lg font-bold text-primary-text" title={topPage.page}>
							{topPage.page.length > 25 ? topPage.page.substring(0, 25) + '...' : topPage.page}
						</p>
						<p class="text-sm text-secondary-text">{topPage.views.toLocaleString()} vues</p>
					</div>
					<div class="rounded-lg bg-bgtertiary/10 p-3 text-bgtertiary">
						<TrendingUp size={24} />
					</div>
				</div>
			</div>
		</div>

		<!-- Chart -->
		<div class="mb-8 rounded-xl bg-white p-6 shadow-md">
			<div class="mb-4 flex items-center gap-3">
				<Calendar size={20} class="text-primary" />
				<h2 class="text-lg font-semibold text-primary-text">Évolution des visites</h2>
				<span class="text-sm text-secondary-text">
					({periods.find((p) => p.value === selectedPeriod)?.description})
					{#if selectedTrafficFilter !== 'all'}
						- {selectedTrafficFilter === 'humans' ? 'Humains uniquement' : 'Robots uniquement'}
					{/if}
				</span>
			</div>
			<div class="h-80">
				<canvas bind:this={chartCanvas}></canvas>
			</div>
			<p class="mt-4 text-center text-xs text-secondary-text">
				💡 Graphique empilé montrant le trafic humains vs robots
			</p>
		</div>

		<!-- Table -->
		<div class="rounded-xl bg-white shadow-md">
			<div class="border-b border-gray-100 p-6">
				<div class="flex flex-wrap items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<FolderOpen size={20} class="text-primary" />
						<h2 class="text-lg font-semibold text-primary-text">Détails par page</h2>
						{#if selectedTrafficFilter !== 'all'}
							<span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
								{selectedTrafficFilter === 'humans' ? 'Humains' : 'Robots'}
							</span>
						{/if}
					</div>

					<!-- Breadcrumb navigation -->
					<nav class="flex items-center gap-1 text-sm">
						<button
							onclick={() => navigateTo('')}
							class="flex items-center gap-1 rounded px-2 py-1 transition-colors {currentPathPrefix === '' ? 'bg-primary/10 text-primary font-medium' : 'text-secondary-text hover:bg-bgstart hover:text-primary-text'}"
						>
							<House size={14} />
							<span>Toutes</span>
						</button>
						{#each breadcrumbs as crumb, i (crumb.path)}
							<ChevronRight size={14} class="text-tertiary-text" />
							<button
								onclick={() => navigateTo(crumb.path)}
								class="rounded px-2 py-1 transition-colors {i === breadcrumbs.length - 1 ? 'bg-primary/10 text-primary font-medium' : 'text-secondary-text hover:bg-bgstart hover:text-primary-text'}"
							>
								{crumb.label}
							</button>
						{/each}
					</nav>
				</div>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-bgstart">
						<tr>
							<th class="px-6 py-4 text-left text-sm font-semibold text-primary-text">
								Chemin
							</th>
							{#each filteredStats.formattedHeaders as header, i (i)}
								<th class="px-4 py-4 text-center text-sm font-semibold text-primary-text">
									{header}
								</th>
							{/each}
							<th class="px-4 py-4 text-center text-sm font-semibold text-primary-text">Total</th>
							<th class="px-4 py-4 text-center text-sm font-semibold text-primary-text">Pages</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-50">
						{#each displayedGroupedEntries as entry, rowIndex (entry.prefix)}
							<tr
								class="transition-colors {entry.isGroup ? 'cursor-pointer hover:bg-primary/5' : 'hover:bg-bgstart'} {rowIndex === 0 ? 'bg-primary/5' : ''}"
								onclick={() => entry.isGroup && navigateTo(entry.prefix)}
							>
								<td class="px-6 py-3 text-sm" title={entry.prefix}>
									<div class="flex items-center gap-2">
										{#if entry.isGroup}
											<FolderOpen size={16} class="shrink-0 text-primary" />
											<span class="font-medium text-primary">{entry.displayName}</span>
											<span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
												{entry.childCount}
											</span>
										{:else}
											<span class="text-primary-text">
												{entry.displayName.length > 40 ? entry.displayName.substring(0, 40) + '...' : entry.displayName}
											</span>
										{/if}
									</div>
								</td>
								{#each entry.periodValues as v}
									<td class="px-4 py-3 text-center text-sm text-secondary-text">
										{v > 0 ? v.toLocaleString() : '-'}
									</td>
								{/each}
								<td class="px-4 py-3 text-center text-sm font-semibold text-primary">
									{entry.totalViews.toLocaleString()}
								</td>
								<td class="px-4 py-3 text-center text-sm text-secondary-text">
									{entry.childCount}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if groupedEntries.length > maxPagesShown}
				<div class="border-t border-gray-100 p-4 text-center">
					<button
						onclick={() => (showAllPages = !showAllPages)}
						class="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-strong"
					>
						{#if showAllPages}
							<ChevronUp size={16} />
							Afficher moins
						{:else}
							<ChevronDown size={16} />
							Afficher les {groupedEntries.length - maxPagesShown} éléments restants
						{/if}
					</button>
				</div>
			{/if}
		</div>
	{:else}
		<div class="rounded-xl bg-white p-12 text-center shadow-md">
			<ChartColumn size={48} class="mx-auto mb-4 text-tertiary-text" />
			<p class="text-secondary-text">Aucune donnée disponible</p>
		</div>
	{/if}
</div>
