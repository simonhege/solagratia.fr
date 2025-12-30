<script lang="ts">
	import { page } from '$app/state';
	import PageTitle from '$lib/PageTitle.svelte';
	import { user } from '$lib/stores/user';
	import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Wand2 } from '@lucide/svelte';

	type PromptProposal = {
		id: string;
		prompt: string;
		style?: string;
	};

	type GeneratedBackground = {
		url: string;
		name: string;
		keywords: string[];
		description: string;
	};

	// Step management
	let currentStep = $state<1 | 2 | 3 | 4>(1);

	// Step 1: Input text (pre-fill from URL param if present)
	let inputText = $state(page.url.searchParams.get('text') ?? '');
	let isGeneratingPrompts = $state(false);

	// Step 2: Prompt proposals
	let promptProposals = $state<PromptProposal[]>([]);
	let selectedProposalId = $state<string | null>(null);
	let editedPrompt = $state('');

	// Step 3: Image generation
	let isGeneratingImage = $state(false);
	let generatedBackground = $state<GeneratedBackground | null>(null);

	// Step 4: Confirmation
	let isSaving = $state(false);
	let saveSuccess = $state(false);

	let error = $state('');

	// Step 1: Generate prompt proposals from input text
	async function generatePrompts() {
		if (!inputText.trim()) return;

		isGeneratingPrompts = true;
		error = '';

		try {
			const res = await fetch(import.meta.env.VITE_SG_API + '/admin/backgrounds/generate-prompts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + $user?.access_token
				},
				body: JSON.stringify({ text: inputText })
			});

			if (res.ok) {
				const data = await res.json();
				promptProposals = data.prompts ?? [];
				if (promptProposals.length > 0) {
					selectedProposalId = promptProposals[0].id;
					editedPrompt = promptProposals[0].prompt;
					currentStep = 2;
				} else {
					error = 'Aucune proposition de prompt générée';
				}
			} else {
				error = `Erreur: ${res.status}`;
			}
		} catch (err) {
			error = 'Erreur lors de la génération des prompts';
			console.error(err);
		} finally {
			isGeneratingPrompts = false;
		}
	}

	// Step 2: Select a proposal
	function selectProposal(proposal: PromptProposal) {
		selectedProposalId = proposal.id;
		editedPrompt = proposal.prompt;
	}

	// Step 2 -> 3: Generate image from selected/edited prompt
	async function generateImage() {
		if (!editedPrompt.trim()) return;

		isGeneratingImage = true;
		error = '';

		try {
			const res = await fetch(import.meta.env.VITE_SG_API + '/admin/backgrounds/generate-image', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + $user?.access_token
				},
				body: JSON.stringify({
					prompt: editedPrompt,
					originalText: inputText
				})
			});

			if (res.ok) {
				const data = await res.json();
				generatedBackground = data.background;
				currentStep = 3;
			} else {
				error = `Erreur: ${res.status}`;
			}
		} catch (err) {
			error = "Erreur lors de la génération de l'image";
			console.error(err);
		} finally {
			isGeneratingImage = false;
		}
	}

	// Step 3 -> 4: Save the generated background
	async function saveBackground() {
		if (!generatedBackground) return;

		isSaving = true;
		error = '';

		try {
			const res = await fetch(import.meta.env.VITE_SG_API + '/admin/backgrounds/save', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + $user?.access_token
				},
				body: JSON.stringify({
					url: generatedBackground.url,
					name: generatedBackground.name,
					keywords: generatedBackground.keywords,
					description: generatedBackground.description
				})
			});

			if (res.ok) {
				saveSuccess = true;
				currentStep = 4;
			} else {
				error = `Erreur: ${res.status}`;
			}
		} catch (err) {
			error = "Erreur lors de l'enregistrement";
			console.error(err);
		} finally {
			isSaving = false;
		}
	}

	// Reset to start over
	function reset() {
		currentStep = 1;
		inputText = '';
		promptProposals = [];
		selectedProposalId = null;
		editedPrompt = '';
		generatedBackground = null;
		saveSuccess = false;
		error = '';
	}

	function goBack() {
		if (currentStep === 2) {
			currentStep = 1;
		} else if (currentStep === 3) {
			currentStep = 2;
		}
	}
</script>

<div class="container mx-auto max-w-4xl p-2">
	<PageTitle title="Générer un arrière-plan" />

	<!-- Progress indicator -->
	<div class="mb-8 flex items-center justify-center gap-2">
		{#each [1, 2, 3, 4] as step}
			<div
				class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors
					{currentStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}"
			>
				{step}
			</div>
			{#if step < 4}
				<div class="h-1 w-12 rounded {currentStep > step ? 'bg-primary' : 'bg-gray-200'}"></div>
			{/if}
		{/each}
	</div>

	<div class="rounded-xl bg-white p-4 shadow-lg md:p-6 lg:p-8">
		{#if error}
			<div class="mb-4 rounded-md bg-red-50 p-4 text-red-600">{error}</div>
		{/if}

		<!-- Step 1: Input text -->
		{#if currentStep === 1}
			<h2 class="mb-4 text-xl font-semibold text-gray-900">Étape 1 : Texte source</h2>
			<p class="mb-4 text-gray-600">
				Entrez le texte (méditation, verset, thème...) à partir duquel générer des propositions de prompts pour l'image.
			</p>
			<textarea
				bind:value={inputText}
				placeholder="Entrez votre texte ici..."
				rows="8"
				class="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
			></textarea>
			<div class="flex justify-end">
				<button
					onclick={generatePrompts}
					disabled={!inputText.trim() || isGeneratingPrompts}
					class="bg-primary hover:bg-primary-strong inline-flex items-center rounded-md px-4 py-2 text-white transition duration-300 disabled:opacity-50"
				>
					{#if isGeneratingPrompts}
						<Loader2 class="mr-2 animate-spin" size={18} />
						Génération...
					{:else}
						<Sparkles class="mr-2" size={18} />
						Générer des prompts
					{/if}
				</button>
			</div>
		{/if}

		<!-- Step 2: Select/edit prompt -->
		{#if currentStep === 2}
			<h2 class="mb-4 text-xl font-semibold text-gray-900">Étape 2 : Choisir un prompt</h2>
			<p class="mb-4 text-gray-600">
				Sélectionnez une proposition et modifiez-la si nécessaire.
			</p>

			<div class="mb-4 space-y-2">
				{#each promptProposals as proposal (proposal.id)}
					<button
						onclick={() => selectProposal(proposal)}
						class="w-full rounded-md border-2 p-3 text-left transition-colors
							{selectedProposalId === proposal.id
								? 'border-primary bg-primary/5'
								: 'border-gray-200 hover:border-gray-300'}"
					>
						<p class="text-sm text-gray-800">{proposal.prompt}</p>
						{#if proposal.style}
							<span class="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
								{proposal.style}
							</span>
						{/if}
					</button>
				{/each}
			</div>

			<div class="mb-4">
				<label class="mb-2 block text-sm font-medium text-gray-700">Prompt sélectionné (modifiable)</label>
				<textarea
					bind:value={editedPrompt}
					rows="4"
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
				></textarea>
			</div>

			<div class="flex justify-between">
				<button
					onclick={goBack}
					class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition duration-300 hover:bg-gray-50"
				>
					<ArrowLeft class="mr-2" size={18} />
					Retour
				</button>
				<button
					onclick={generateImage}
					disabled={!editedPrompt.trim() || isGeneratingImage}
					class="bg-primary hover:bg-primary-strong inline-flex items-center rounded-md px-4 py-2 text-white transition duration-300 disabled:opacity-50"
				>
					{#if isGeneratingImage}
						<Loader2 class="mr-2 animate-spin" size={18} />
						Génération...
					{:else}
						<Wand2 class="mr-2" size={18} />
						Générer l'image
					{/if}
				</button>
			</div>
		{/if}

		<!-- Step 3: Preview and save -->
		{#if currentStep === 3 && generatedBackground}
			<h2 class="mb-4 text-xl font-semibold text-gray-900">Étape 3 : Aperçu</h2>
			<p class="mb-4 text-gray-600">
				Vérifiez l'image générée avant de l'enregistrer.
			</p>

			<div class="mx-auto mb-4 max-w-md overflow-hidden rounded-lg border border-gray-200">
				<img
					src={generatedBackground.url}
					alt={generatedBackground.name}
					class="aspect-square w-full object-cover"
				/>
			</div>

			<div class="mb-4 space-y-3">
				<div>
					<label class="block text-sm font-medium text-gray-700">Nom</label>
					<input
						type="text"
						bind:value={generatedBackground.name}
						class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700">Description</label>
					<textarea
						bind:value={generatedBackground.description}
						rows="2"
						class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
					></textarea>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700">Mots-clés</label>
					<input
						type="text"
						value={generatedBackground.keywords.join(', ')}
						oninput={(e) => {
							generatedBackground!.keywords = e.currentTarget.value.split(',').map((k) => k.trim()).filter(Boolean);
						}}
						class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
						placeholder="mot1, mot2, mot3..."
					/>
				</div>
			</div>

			<div class="flex justify-between">
				<button
					onclick={goBack}
					class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition duration-300 hover:bg-gray-50"
				>
					<ArrowLeft class="mr-2" size={18} />
					Retour
				</button>
				<button
					onclick={saveBackground}
					disabled={isSaving}
					class="bg-primary hover:bg-primary-strong inline-flex items-center rounded-md px-4 py-2 text-white transition duration-300 disabled:opacity-50"
				>
					{#if isSaving}
						<Loader2 class="mr-2 animate-spin" size={18} />
						Enregistrement...
					{:else}
						<Check class="mr-2" size={18} />
						Enregistrer
					{/if}
				</button>
			</div>
		{/if}

		<!-- Step 4: Success -->
		{#if currentStep === 4}
			<div class="py-8 text-center">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
					<Check class="text-green-600" size={32} />
				</div>
				<h2 class="mb-2 text-xl font-semibold text-gray-900">Arrière-plan enregistré !</h2>
				<p class="mb-6 text-gray-600">L'image a été générée et sauvegardée avec succès.</p>
				<div class="flex justify-center gap-4">
					<a
						href="/admin/backgrounds"
						class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition duration-300 hover:bg-gray-50"
					>
						Voir tous les arrière-plans
					</a>
					<button
						onclick={reset}
						class="bg-primary hover:bg-primary-strong inline-flex items-center rounded-md px-4 py-2 text-white transition duration-300"
					>
						<Sparkles class="mr-2" size={18} />
						Générer un autre
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
