<script lang="ts">
	import type { PageProps } from './$types';
	import { user } from '$lib/stores/user';
	import PageTitle from '$lib/PageTitle.svelte';
	import { goto } from '$app/navigation';
	import { Trash2 } from '@lucide/svelte';

	let { data }: PageProps = $props();

	let updated = $state(data);

	function generateSlug(titleValue: string, dateIso?: string) {
		if (!titleValue) return dateIso ? new Date(dateIso).toISOString().slice(0, 10) : '';
		const base = titleValue
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-zA-Z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.toLowerCase();
		if (dateIso) {
			try {
				const d = new Date(dateIso);
				if (!Number.isNaN(d.getTime())) {
					const datePart = d.toISOString().slice(0, 10);
					return `${datePart}-${base}`;
				}
			} catch (e) {
				// ignore
			}
		}
		return base;
	}

	// Format date for datetime-local input (YYYY-MM-DDThh:mm)
	const dateTimeInput = $derived(new Date(updated.publicationDate).toISOString().slice(0, 16));

	const previewDate = $derived(
		new Date(updated.publicationDate).toLocaleDateString('fr-FR', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	);

	const tagsList = $derived(updated.tags ? updated.tags.join(', ') : '');

	async function save() {
		const slug =
			updated.slug && updated.slug.length
				? updated.slug
				: generateSlug(updated.title, updated.publicationDate);
		const meditation = {
			...updated,
			slug
		};

		const res = await fetch(import.meta.env.VITE_SG_API + '/admin/meditations/' + updated.id, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + $user?.access_token
			},
			body: JSON.stringify(meditation)
		});

		if (res.ok) {
			await res.json();
			goto('/se-ressourcer/' + meditation.slug);
		}
	}
	async function deleteMeditation() {
		if (!confirm('Etes-vous sûr de vouloir supprimer cette méditation ?')) {
			return;
		}

		const res = await fetch(import.meta.env.VITE_SG_API + '/admin/meditations/' + updated.id, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + $user?.access_token
			}
		});

		if (res.ok) {
			await res.json();
			goto('/admin/editer');
		}
	}
</script>

<main class="flex flex-grow items-center justify-center">
	<div class="container mx-auto max-w-3xl p-2">
		<PageTitle title="Éditer la méditation" />

		<div class="mb-4 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
			<div class="prose lg:prose-xl">
				<div class="mb-4">
					<label class="mb-1 block text-sm font-medium text-gray-700" for="publicationDate"
						>Date de publication</label
					>
					<input
						id="publicationDate"
						type="datetime-local"
						value={dateTimeInput}
						oninput={(e) => {
							updated.publicationDate = new Date(e.currentTarget.value).toISOString();
							if (updated.status === 'draft')
								updated.slug = generateSlug(updated.title, updated.publicationDate);
						}}
						class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					/>
					<p class="mt-1 text-sm text-gray-500">{previewDate}</p>
				</div>

				<div class="mb-4">
					<label class="mb-1 block text-sm font-medium text-gray-700" for="imageUrl"
						>Image URL</label
					>
					<input
						id="imageUrl"
						type="url"
						bind:value={updated.imageUrl}
						placeholder="https://..."
						class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					/>
				</div>

				{#if updated.imageUrl}
					<img src={updated.imageUrl} alt="Aperçu" class="mb-4 w-full rounded-md object-cover" />
				{/if}

				<div class="mb-4">
					<label class="mb-1 block text-sm font-medium text-gray-700" for="title">Titre</label>
					<input
						id="title"
						type="text"
						bind:value={updated.title}
						oninput={(e) => {
							updated.title = e.currentTarget.value;
							if (updated.status === 'draft')
								updated.slug = generateSlug(e.currentTarget.value, updated.publicationDate);
						}}
						placeholder="Titre de la méditation"
						class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					/>
				</div>
				<div class="mb-4">
					<label class="mb-1 block text-sm font-medium text-gray-700" for="slug">Slug</label>
					<input
						id="slug"
						type="text"
						bind:value={updated.slug}
						readonly={updated.status !== 'draft'}
						placeholder="slug-exemple-20251028"
						class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					/>
					{#if updated.status !== 'draft'}
						<p class="mt-1 text-sm text-gray-500">Modifiable uniquement en brouillon</p>
					{/if}
				</div>

				<div class="mb-4">
					<label class="mb-1 block text-sm font-medium text-gray-700" for="short">Résumé</label>
					<textarea
						id="short"
						bind:value={updated.short}
						rows="4"
						placeholder="Bref résumé de la méditation"
						class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					></textarea>
				</div>

				<div class="mb-4">
					<label class="mb-1 block text-sm font-medium text-gray-700" for="content">Contenu</label>
					<textarea
						id="content"
						bind:value={updated.full}
						rows="10"
						placeholder="Contenu de la méditation"
						class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					></textarea>
				</div>

				<div class="mb-4 rounded-lg bg-gray-50 p-4">
					<h3 class="mb-2 text-lg font-medium">Verset principal</h3>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700" for="bookCode"
								>Livre</label
							>
							<input
								id="bookCode"
								type="text"
								bind:value={updated.verses.reference.bookCode}
								placeholder="GEN"
								class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700" for="chapter"
								>Chapitre</label
							>
							<input
								id="chapter"
								type="number"
								bind:value={updated.verses.reference.chapter}
								min="1"
								class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700" for="verseStart"
								>Verset début</label
							>
							<input
								id="verseStart"
								type="number"
								bind:value={updated.verses.reference.verseStart}
								min="1"
								class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700" for="verseEnd"
								>Verset fin</label
							>
							<input
								id="verseEnd"
								type="number"
								bind:value={updated.verses.reference.verseEnd}
								min="1"
								class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
							/>
						</div>
						<div class="col-span-2">
							<label class="mb-1 block text-sm font-medium text-gray-700" for="verseText"
								>Texte des versets</label
							>
							<textarea
								id="verseText"
								bind:value={updated.verses.text}
								rows="2"
								placeholder="Texte des versets"
								class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
							></textarea>
						</div>
					</div>
				</div>

				<div class="mb-4">
					<label class="mb-1 block text-sm font-medium text-gray-700" for="tags">Tags</label>
					<input
						id="tags"
						type="text"
						value={tagsList}
						oninput={(e) =>
							(updated.tags = e.currentTarget.value.split(',').map((tag) => tag.trim()))}
						placeholder="Tag1, Tag2, Tag3"
						class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					/>
					<p class="mt-1 text-sm text-gray-500">Séparez les tags par des virgules</p>
				</div>

				<fieldset class="mb-6">
					<legend class="mb-2 text-sm font-medium text-gray-700">Status</legend>
					<div class="flex space-x-4">
						<label class="inline-flex items-center">
							<input
								type="radio"
								bind:group={updated.status}
								name="status"
								value="draft"
								class="form-radio text-primary focus:ring-primary h-4 w-4"
							/>
							<span class="ml-2">Brouillon</span>
						</label>
						<label class="inline-flex items-center">
							<input
								type="radio"
								bind:group={updated.status}
								name="status"
								value="active"
								class="form-radio text-primary focus:ring-primary h-4 w-4"
							/>
							<span class="ml-2">Publié</span>
						</label>
					</div>
				</fieldset>

				<div class="flex items-center justify-end gap-4">
					<button
						type="button"
						class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
						onclick={() => history.back()}
					>
						Annuler
					</button>
					<button
						type="button"
						class="bg-primary hover:bg-primary-strong inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm"
						onclick={save}
					>
						Mettre à jour
					</button>
					<button
						type="button"
						class="hover:bg-primary-strong inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm"
						onclick={deleteMeditation}
					>
						<Trash2 class="mr-2" /> Supprimer
					</button>
				</div>
			</div>
		</div>
	</div>
</main>
