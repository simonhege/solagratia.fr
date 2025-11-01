<script lang="ts">
	import {
		UserPlus,
		BookOpen,
		GlassWater,
		Facebook,
		Twitter,
		Instagram,
		Link,
		Clock,
		Edit
	} from '@lucide/svelte';
	import { user } from '$lib/stores/user';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Sola Gratia</title>
</svelte:head>

<main class="flex flex-grow items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
	<div class="w-full max-w-3xl text-center">
		<div class="mb-6 rounded-lg bg-white p-8 shadow-lg">
			<p class="text-primary-text mb-4 text-2xl leading-relaxed font-normal md:text-3xl">
				« {data.meditation.verses.text} »
			</p>
			<p class="text-secondary-text mb-4 text-lg">
				La Bible, {data.meditation.verses.reference.toString()}
			</p>
			<p class="text-md text-secondary-text italic">
				{data.meditation.short}
			</p>
			<div class="mt-6 flex justify-center space-x-4 border-t border-gray-200 pt-4">
				<span class="font-medium text-gray-600">Partager :</span>
				<a
					href="/"
					class="hover:text-primary text-gray-600 transition duration-300"
					aria-label="Partager sur Facebook"
				>
					<Facebook />
				</a>
				<a
					href="/"
					class="hover:text-primary text-gray-600 transition duration-300"
					aria-label="Partager sur Twitter"
				>
					<Twitter />
				</a>
				<a
					href="/"
					class="hover:text-primary text-gray-600 transition duration-300"
					aria-label="Partager sur Instagram"
				>
					<Instagram />
				</a>
				<button
					class="hover:text-primary text-gray-600 transition duration-300 focus:outline-none"
					aria-label="Copier le lien"
				>
					<Link />
				</button>
			</div>
		</div>

		<a
			href="/se-ressourcer/{data.meditation.slug}"
			class="bg-primary hover:bg-primary-strong mb-4 inline-flex items-center rounded-md px-8 py-3 text-lg font-semibold text-white transition duration-300"
		>
			<GlassWater class="mr-2" /> Découvrir ce texte en profondeur
		</a>

		{#if !$user}
			<div
				class="flex flex-col items-center justify-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4"
			>
				<a
					href="/inscription"
					class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
				>
					<UserPlus class="mr-2" /> S'inscrire pour Sauvegarder & Annoter
				</a>
			</div>
		{/if}
	</div>
</main>

<section class="bg-bgsecondary px-4 py-16 sm:px-6 lg:px-8">
	<div class="container mx-auto text-center">
		<h2 class="text-primary-text mb-12 text-3xl font-semibold md:text-4xl">
			Explorez la Parole de Dieu avec une perspective nouvelle
		</h2>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			<div class="rounded-lg bg-white p-6 shadow-md">
				<div class="mb-4 flex justify-center">
					<Clock class="text-primary h-14 w-14" />
				</div>
				<h3 class="text-primary-text mb-3 text-xl font-semibold">Un Moment pour Méditer</h3>
				<p class="text-primary-text text-lg">
					Accédez quotidiennement à un nouveau passage des Écritures et à une réflexion, conçus pour
					s'intégrer à votre emploi du temps chargé.
				</p>
			</div>
			<div class="rounded-lg bg-white p-6 shadow-md">
				<div class="mb-4 flex justify-center">
					<BookOpen class="text-primary h-14 w-14" />
				</div>
				<h3 class="text-primary-text mb-3 text-xl font-semibold">
					Explorez des Vérités Plus Profondes
				</h3>
				<p class="text-primary-text text-lg">
					Naviguez facilement vers le chapitre complet pour comprendre le contexte et explorer les
					versets associés.
				</p>
			</div>
			<div class="rounded-lg bg-white p-6 shadow-md">
				<div class="mb-4 flex justify-center">
					<Edit class="text-primary h-14 w-14" />
				</div>
				<h3 class="text-primary-text mb-3 text-xl font-semibold">Sauvegardez Vos Découvertes</h3>
				<p class="text-primary-text text-lg">
					Inscrivez-vous gratuitement pour sauvegarder des notes, surligner des versets et
					construire votre bibliothèque personnelle de réflexions.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="bg-white px-4 py-16 sm:px-6 lg:px-8">
	<div class="container mx-auto flex flex-col items-center justify-between gap-12 md:flex-row">
		<div class="flex justify-center md:w-1/2">
			<img src="/bible.jpeg" alt="Illustration stylisée de mains tenant une Bible" />
		</div>
		<div class="text-center md:w-1/2 md:text-left">
			<h2 class="text-primary-text mb-6 text-3xl font-semibold md:text-4xl">
				Allez Plus Loin : Sauvegardez, Annotez, Illustrez et Réfléchissez
			</h2>
			<p class="text-primary-text mb-8 text-lg">
				Créez un compte gratuit pour débloquer des outils puissants pour votre étude personnelle.
				Surlignez les versets importants, ajoutez vos propres notes et réflexions, et suivez votre
				parcours à travers les Écritures dans votre bibliothèque personnelle.
			</p>
			<a
				href="/inscription"
				class=" bg-primary hover:bg-primary-strong inline-flex items-center rounded-md px-8 py-3 text-lg font-semibold text-white transition duration-300"
			>
				<UserPlus class="mr-2" /> Créer Votre Compte Gratuit
			</a>
		</div>
	</div>
</section>
