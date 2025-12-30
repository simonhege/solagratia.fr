<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import { user } from '$lib/stores/user';
	import { Sparkles, Trash2 } from '@lucide/svelte';

	type Background = {
		name: string;
		url: string;
		keywords: string[];
		description: string;
	};

	let backgrounds = $state<Background[]>([]);
	let isLoading = $state(true);
	let error = $state('');
	let searchQuery = $state('');
	let deletingName = $state<string | null>(null);

	$effect(() => {
		getAll();
	});

	async function getAll() {
		isLoading = true;
		error = '';
		try {
			const raw = await fetch(import.meta.env.VITE_SG_API + '/admin/backgrounds', {
				headers: {
					Authorization: 'Bearer ' + $user?.access_token
				}
			});
			if (raw.ok) {
				const jsonData = await raw.json();
				backgrounds = jsonData.backgrounds ?? [];
			} else {
				error = `Erreur HTTP: ${raw.status}`;
				console.error(`HTTP error! Status: ${raw.status}`);
			}
		} catch (err) {
			error = 'Erreur lors du chargement des arrière-plans';
			console.error('Error fetching backgrounds:', err);
		} finally {
			isLoading = false;
		}
	}

	let filteredBackgrounds = $derived(() => {
		if (!searchQuery.trim()) return backgrounds;
		const query = searchQuery.toLowerCase();
		return backgrounds.filter(
			(bg) =>
				bg.name.toLowerCase().includes(query) ||
				bg.description?.toLowerCase().includes(query) ||
				bg.keywords?.some((kw) => kw.toLowerCase().includes(query))
		);
	});

	async function deleteBackground(name: string) {
		if (!confirm(`Êtes-vous sûr de vouloir supprimer l'arrière-plan "${name}" ?`)) {
			return;
		}

		deletingName = name;
		try {
			const raw = await fetch(import.meta.env.VITE_SG_API + '/admin/backgrounds/' + encodeURIComponent(name), {
				method: 'DELETE',
				headers: {
					Authorization: 'Bearer ' + $user?.access_token
				}
			});
			if (raw.ok) {
				backgrounds = backgrounds.filter((bg) => bg.name !== name);
			} else {
				const errorData = await raw.json().catch(() => ({}));
				alert(`Erreur lors de la suppression: ${errorData.message || raw.status}`);
			}
		} catch (err) {
			console.error('Error deleting background:', err);
			alert('Erreur lors de la suppression');
		} finally {
			deletingName = null;
		}
	}
</script>

<div class="container mx-auto max-w-7xl p-2">
	<PageTitle title="Gestion des arrière-plans" />

	<div class="mb-12 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
		<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Rechercher par nom, description ou mot-clé..."
				class="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
			/>
			<a
				href="/admin/backgrounds/generer{searchQuery.trim() ? '?text=' + encodeURIComponent(searchQuery.trim()) : ''}"
				class="bg-primary hover:bg-primary-strong inline-flex items-center justify-center rounded-md px-4 py-2 text-white transition duration-300"
			>
				<Sparkles class="mr-2" size={18} />
				Générer un arrière-plan
			</a>
		</div>

		{#if isLoading}
			<div class="flex items-center justify-center py-12">
				<div class="text-gray-500">Chargement...</div>
			</div>
		{:else if error}
			<div class="rounded-md bg-red-50 p-4 text-red-600">{error}</div>
		{:else if filteredBackgrounds().length === 0}
			<div class="py-8 text-center text-gray-500">
				{#if searchQuery}
					Aucun arrière-plan trouvé pour "{searchQuery}"
				{:else}
					Aucun arrière-plan disponible
				{/if}
			</div>
		{:else}
			<div class="mb-4 text-sm text-gray-500">
				{filteredBackgrounds().length} arrière-plan{filteredBackgrounds().length > 1 ? 's' : ''}
				{#if searchQuery}sur {backgrounds.length}{/if}
			</div>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{#each filteredBackgrounds() as background (background.url)}
					<div class="group overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
						<div class="relative aspect-square overflow-hidden bg-gray-100">
							<img
								src={background.url}
								alt={background.name}
								class="h-full w-full object-cover transition-transform group-hover:scale-105"
								loading="lazy"
							/>
							<button
								onclick={() => deleteBackground(background.name)}
								disabled={deletingName === background.name}
								class="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
								title="Supprimer"
							>
								{#if deletingName === background.name}
									<span class="block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
								{:else}
									<Trash2 size={16} />
								{/if}
							</button>
						</div>
						<div class="p-3">
							<h3 class="mb-1 font-semibold text-gray-900">{background.name}</h3>
							{#if background.description}
								<p class="mb-2 line-clamp-2 text-sm text-gray-600" title={background.description}>
									{background.description}
								</p>
							{/if}
							{#if background.keywords && background.keywords.length > 0}
								<div class="flex flex-wrap gap-1">
									{#each background.keywords.slice(0, 5) as keyword}
										<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
											{keyword}
										</span>
									{/each}
									{#if background.keywords.length > 5}
										<span class="text-xs text-gray-400">+{background.keywords.length - 5}</span>
									{/if}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
