<script lang="ts">
	import { page } from '$app/state';
	import PageTitle from '$lib/PageTitle.svelte';
	import { user } from '$lib/stores/user';
	import { ArrowLeft, Check, Loader2, Sparkles, Upload, Wand2 } from '@lucide/svelte';

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
		semanticDescription: string;
		vector: number[];
	};

	// Mode: 'generate' or 'upload'
	let mode = $state<'generate' | 'upload' | null>(null);

	// Step management - steps differ by mode
	// Generate: 1 (text) -> 2 (prompts) -> 3 (preview) -> 4 (success)
	// Upload: 1 (upload) -> 2 (preview) -> 3 (success)
	let currentStep = $state(1);

	// Generate mode: Input text (pre-fill from URL param if present)
	let inputText = $state(page.url.searchParams.get('text') ?? '');
	let isGeneratingPrompts = $state(false);

	// Generate mode: Prompt proposals
	let promptProposals = $state<PromptProposal[]>([]);
	let selectedProposalId = $state<string | null>(null);
	let editedPrompt = $state('');

	// Image generation/upload
	let isGeneratingImage = $state(false);
	let generatedBackground = $state<GeneratedBackground | null>(null);

	// Upload mode
	let isUploading = $state(false);
	let uploadedFile = $state<File | null>(null);
	let uploadPreviewUrl = $state<string | null>(null);

	let error = $state('');

	// Total steps depends on mode
	// Generate: 1 (text) -> 2 (prompts) -> 3 (success)
	// Upload: 1 (upload) -> 2 (success)
	const totalSteps = $derived(mode === 'generate' ? 3 : 2);

	// Step 1: Generate prompt proposals from input text
	async function generatePrompts() {
		if (!inputText.trim() || isGeneratingPrompts) return;

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
		if (!editedPrompt.trim() || isGeneratingImage) return;

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
				currentStep = 3; // Success step
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

	// Handle file selection for upload
	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			uploadedFile = file;
			uploadPreviewUrl = URL.createObjectURL(file);
		}
	}

	// Convert file to data URL
	function fileToDataUrl(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	// Upload mode: Upload image and get metadata from API
	async function uploadImage() {
		if (!uploadedFile || isUploading) return;

		isUploading = true;
		error = '';

		try {
			const dataUrl = await fileToDataUrl(uploadedFile);

			const res = await fetch(import.meta.env.VITE_SG_API + '/admin/backgrounds/upload-image', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + $user?.access_token
				},
				body: JSON.stringify({ url: dataUrl })
			});

			if (res.ok) {
				const data = await res.json();
				generatedBackground = data.background;
				currentStep = 2; // Success step
			} else {
				error = `Erreur: ${res.status}`;
			}
		} catch (err) {
			error = "Erreur lors de l'upload de l'image";
			console.error(err);
		} finally {
			isUploading = false;
		}
	}

	// Reset to start over
	function reset() {
		mode = null;
		currentStep = 1;
		inputText = page.url.searchParams.get('text') ?? '';
		promptProposals = [];
		selectedProposalId = null;
		editedPrompt = '';
		generatedBackground = null;
		error = '';
		uploadedFile = null;
		if (uploadPreviewUrl) {
			URL.revokeObjectURL(uploadPreviewUrl);
			uploadPreviewUrl = null;
		}
	}

	function goBack() {
		if (mode === 'generate') {
			if (currentStep === 2) {
				currentStep = 1;
			}
		}
		// Upload mode: no back from success
	}

	function selectMode(selectedMode: 'generate' | 'upload') {
		mode = selectedMode;
		currentStep = 1;
	}

	function backToModeSelection() {
		mode = null;
		currentStep = 1;
		error = '';
		uploadedFile = null;
		if (uploadPreviewUrl) {
			URL.revokeObjectURL(uploadPreviewUrl);
			uploadPreviewUrl = null;
		}
	}
</script>

<div class="container mx-auto max-w-4xl p-2">
	<PageTitle title="Ajouter un arrière-plan" />

	<!-- Mode selection -->
	{#if mode === null}
		<div class="rounded-xl bg-white p-4 shadow-lg md:p-6 lg:p-8">
			<h2 class="mb-4 text-xl font-semibold text-gray-900">Comment souhaitez-vous ajouter un arrière-plan ?</h2>
			<p class="mb-6 text-gray-600">
				Choisissez entre générer une image avec l'IA ou uploader une image existante.
			</p>

			<div class="grid gap-4 md:grid-cols-2">
				<button
					onclick={() => selectMode('generate')}
					class="flex flex-col items-center rounded-xl border-2 border-gray-200 p-6 transition-all hover:border-primary hover:bg-primary/5"
				>
					<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<Wand2 class="text-primary" size={32} />
					</div>
					<h3 class="mb-2 text-lg font-semibold text-gray-900">Générer avec l'IA</h3>
					<p class="text-center text-sm text-gray-600">
						Entrez un texte source et laissez l'IA créer une image adaptée
					</p>
				</button>

				<button
					onclick={() => selectMode('upload')}
					class="flex flex-col items-center rounded-xl border-2 border-gray-200 p-6 transition-all hover:border-primary hover:bg-primary/5"
				>
					<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<Upload class="text-primary" size={32} />
					</div>
					<h3 class="mb-2 text-lg font-semibold text-gray-900">Uploader une image</h3>
					<p class="text-center text-sm text-gray-600">
						Importez une image existante, les métadonnées seront générées automatiquement
					</p>
				</button>
			</div>
		</div>
	{:else}
		<!-- Progress indicator -->
		<div class="mb-8 flex items-center justify-center gap-2">
			{#each Array.from({ length: totalSteps }, (_, i) => i + 1) as step}
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors
						{currentStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}"
				>
					{step}
				</div>
				{#if step < totalSteps}
					<div class="h-1 w-12 rounded {currentStep > step ? 'bg-primary' : 'bg-gray-200'}"></div>
				{/if}
			{/each}
		</div>

		<div class="rounded-xl bg-white p-4 shadow-lg md:p-6 lg:p-8">
			{#if error}
				<div class="mb-4 rounded-md bg-red-50 p-4 text-red-600">{error}</div>
			{/if}

			<!-- GENERATE MODE -->
			{#if mode === 'generate'}
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
					<div class="flex justify-between">
						<button
							onclick={backToModeSelection}
							class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition duration-300 hover:bg-gray-50"
						>
							<ArrowLeft class="mr-2" size={18} />
							Retour
						</button>
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

				<!-- Step 3: Success -->
				{#if currentStep === 3}
					<div class="py-8 text-center">
						<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
							<Check class="text-green-600" size={32} />
						</div>
						<h2 class="mb-2 text-xl font-semibold text-gray-900">Arrière-plan enregistré !</h2>
						<p class="mb-6 text-gray-600">L'image a été générée et sauvegardée avec succès.</p>
						{#if generatedBackground}
							<div class="mx-auto mb-6 max-w-xs overflow-hidden rounded-lg border border-gray-200">
								<img
									src={generatedBackground.url}
									alt={generatedBackground.name}
									class="aspect-square w-full object-cover"
								/>
							</div>
						{/if}
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
								Ajouter un autre
							</button>
						</div>
					</div>
				{/if}
			{/if}

			<!-- UPLOAD MODE -->
			{#if mode === 'upload'}
				<!-- Step 1: Upload image -->
				{#if currentStep === 1}
					<h2 class="mb-4 text-xl font-semibold text-gray-900">Étape 1 : Sélectionner une image</h2>
					<p class="mb-4 text-gray-600">
						Choisissez l'image à uploader. Les métadonnées seront générées automatiquement.
					</p>

					<div class="mb-4">
						<input
							type="file"
							id="imageUpload"
							accept="image/*"
							onchange={handleFileSelect}
							class="hidden"
						/>
						<label
							for="imageUpload"
							class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-primary hover:bg-primary/5"
						>
							{#if uploadPreviewUrl}
								<img
									src={uploadPreviewUrl}
									alt="Aperçu"
									class="mb-3 max-h-64 rounded-md object-contain"
								/>
								<span class="text-sm font-medium text-gray-700">{uploadedFile?.name}</span>
								<span class="mt-1 text-xs text-gray-400">Cliquez pour changer</span>
							{:else}
								<Upload class="mb-3 text-gray-400" size={48} />
								<span class="text-sm font-medium text-gray-700">Cliquez pour sélectionner une image</span>
								<span class="mt-1 text-xs text-gray-400">PNG, JPG, WEBP...</span>
							{/if}
						</label>
					</div>

					<div class="flex justify-between">
						<button
							onclick={backToModeSelection}
							class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition duration-300 hover:bg-gray-50"
						>
							<ArrowLeft class="mr-2" size={18} />
							Retour
						</button>
						<button
							onclick={uploadImage}
							disabled={!uploadedFile || isUploading}
							class="bg-primary hover:bg-primary-strong inline-flex items-center rounded-md px-4 py-2 text-white transition duration-300 disabled:opacity-50"
						>
							{#if isUploading}
								<Loader2 class="mr-2 animate-spin" size={18} />
								Analyse en cours...
							{:else}
								<Upload class="mr-2" size={18} />
								Uploader et analyser
							{/if}
						</button>
					</div>
				{/if}

				<!-- Step 2: Success -->
				{#if currentStep === 2}
					<div class="py-8 text-center">
						<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
							<Check class="text-green-600" size={32} />
						</div>
						<h2 class="mb-2 text-xl font-semibold text-gray-900">Arrière-plan enregistré !</h2>
						<p class="mb-6 text-gray-600">L'image a été uploadée et sauvegardée avec succès.</p>
						{#if generatedBackground}
							<div class="mx-auto mb-6 max-w-xs overflow-hidden rounded-lg border border-gray-200">
								<img
									src={generatedBackground.url}
									alt={generatedBackground.name}
									class="aspect-square w-full object-cover"
								/>
							</div>
						{/if}
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
								<Upload class="mr-2" size={18} />
								Ajouter un autre
							</button>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>
