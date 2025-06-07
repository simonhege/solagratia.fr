<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';

	const nom = 'Simon HEGE';
	const email = 'simon@solagratia.fr';
	const pubDate = '21 octobre 2024';

	let apiVersion = $state('undefined');
	let genAiModel = $state('undefined');

	$effect(() => {
		const myRequest = new Request('https://api.solagratia.fr/info');
		window
			.fetch(myRequest)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((response) => {
				apiVersion = response.version.lastCommit + ' ' + response.version.revision.substr(0, 8);
				genAiModel = response.genModel;
				console.log(response);
			});
	});
</script>

<div class="container mx-auto max-w-3xl p-2">
	<PageTitle title="Mentions légales" />

	<div class="prose lg:prose-xl mb-4 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
		<h2>1. Éditeur du site</h2>
		<p>
			Nom : {nom}<br />
			E-mail : <a href="mailto:{email}">{email}</a>
		</p>

		<h2>2. Hébergement</h2>
		<p>
			Hébergeur : Scaleway SAS<br />
			Adresse : BP 438 75366 PARIS CEDEX 08 FRANCE<br />
			Site web de l'hébergeur :
			<a href="https://www.scaleway.com/" target="_blank">https://www.scaleway.com/</a>
		</p>

		<h2>3. Propriété intellectuelle</h2>

		<p>
			Sauf mention contraire, les contenus présents sur ce site (textes, images, vidéos, etc.) sont
			sous licence Creative Commons Attribution - NonCommercial - ShareAlike (CC BY-NC-SA). Cela
			signifie que vous êtes libres de partager et d'adapter ces contenus à des fins non
			commerciales, à condition de citer l'auteur original et de partager les œuvres dérivées sous
			la même licence.
		</p>
		<p>
			Pour plus d'informations sur cette licence, vous pouvez consulter le site officiel de
			<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank"
				>Creative Commons</a
			>.
		</p>

		<h2>4. Données personnelles</h2>
		<p>
			Vous pouvez visiter notre site sur Internet sans avoir à décliner votre identité ou à fournir
			des informations personnelles vous concernant.
		</p>
		<p>
			Les informations recueillies via les formulaires de contact sont traitées par {nom} dans le cadre
			de vos demandes. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, et de
			suppression de vos données en nous contactant à l'adresse :
			<a href="mailto:{email}">{email}</a>.
		</p>

		<h2>5. Cookies</h2>
		<p>Ce site n'utilise pas de cookies.</p>

		<p class="text-sm">Dernière mise à jour des mentions légales: {pubDate}</p>

		<p class="text-sm">Version de l'api : {apiVersion}<br />Modèle AI : {genAiModel}</p>
	</div>
</div>
