<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import { FilePenLine, Image, BarChart3, History, ArrowRight } from '@lucide/svelte';

	const menuItems = [
		{
			title: 'Éditeur de méditations',
			description: 'Créer et modifier les méditations quotidiennes.',
			href: '/admin/editer',
			icon: FilePenLine
		},
		{
			title: 'Arrière-plans',
			description: 'Gérer les images de fond pour les versets et méditations.',
			href: '/admin/backgrounds',
			icon: Image
		},
		{
			title: 'Statistiques',
			description: "Visualiser les visites et l'engagement des utilisateurs.",
			href: '/admin/statistiques',
			icon: BarChart3
		},
		{
			title: 'Historique',
			description: "Consulter l'historique des recherches Explorer.",
			href: '/admin/historique',
			icon: History
		}
	];
</script>

<div class="container mx-auto max-w-7xl p-4">
	<PageTitle title="Administration" />

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each menuItems as item}
			<a
				href={item.href}
				class="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-primary/50"
			>
				<div>
					<div class="mb-4 inline-flex rounded-lg bg-bgstart p-3 text-primary">
						<item.icon size={28} />
					</div>
					<h3 class="mb-2 text-xl font-bold text-primary-text group-hover:text-primary">
						{item.title}
					</h3>
					<p class="text-secondary-text">
						{item.description}
					</p>
				</div>
				<div
					class="mt-6 flex items-center justify-end text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				>
					<span class="mr-2 text-sm font-medium">Accéder</span>
					<ArrowRight size={16} />
				</div>
			</a>
		{/each}
	</div>
</div>
