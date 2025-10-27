<script lang="ts">
	let showAdmin = $state(false);

	$effect(() => {
		if (localStorage.getItem('show-admin') === 'true') {
			showAdmin = true;
		}
	});
</script>

{#snippet footer_link(text: string, href: string)}
	<a {href} class="transition duration-300 hover:text-white">{text}</a>
{/snippet}
{#snippet footer_extlink(text: string, href: string)}
	<a
		{href}
		class="transition duration-300 hover:text-white"
		target="_blank"
		rel="noopener noreferrer">{text}</a
	>
{/snippet}

<footer class="bg-bgtertiary text-tertiary-text mt-auto px-4 py-8 sm:px-6 lg:px-8">
	<div class="container mx-auto">
		<nav class="flex place-content-center gap-4">
			{@render footer_link('Mentions légales', '/mentions-legales')}
			{@render footer_extlink('Contact', 'mailto:simon@solagratia.fr')}
			{#if showAdmin}
				{@render footer_link('Admin', '/admin')}
				{@render footer_link('Editeur de méditations', '/admin/editer')}
			{/if}
		</nav>
	</div>
	<div class="text-secondary-text mt-6 text-center text-sm">
		&copy; 2024-2025 Sola Gratia. Tous droits réservés.
	</div>
</footer>
