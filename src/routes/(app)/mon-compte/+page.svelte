<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import { user, userManager } from '$lib/stores/user';
	import { userData } from '$lib/stores/userData';
	import { Download, Trash2, Undo } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	let confirmDialog: HTMLDialogElement;

	$effect(() => {
		// Ensure user is loaded
		if ($user === null) {
			// Redirect to home page
			goto('/');
		}
	});

	function askConfirmation() {
		confirmDialog.showModal();
	}

	async function confirmAction() {
		confirmDialog.close();
		// delete data
		await deleteData();
		// delete account
		await deleteAccount();
		// logout
		userManager.removeUser();
		// redirect to home page
		goto('/');
	}

	function cancelAction() {
		confirmDialog.close();
	}

	function deleteAccount() {
		const req = new Request(userManager.settings.authority + 'accounts/me', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + $user?.id_token
			}
		});

		return fetch(req);
	}

	function deleteData() {
		const req = new Request(import.meta.env.VITE_SG_API + '/users/me', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + $user?.access_token
			}
		});

		return fetch(req);
	}
</script>

<div class="container mx-auto max-w-5xl p-2">
	<PageTitle title="Mon compte" />

	<div class="mb-12 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
		<h2 class="text-primary-text mb-2 text-2xl font-bold md:text-3xl">Mon profil</h2>
		<div class="flex flex-col gap-10 text-lg md:flex-row">
			<img src={$user?.profile.picture} alt="Profile" class="mb-4 w-32 rounded-full" />
			<div>
				<p class="text-primary-text">
					Nom complet: <span class="text-secondary-text">{$user?.profile.name}</span>
				</p>
				<p class="text-primary-text">
					Adresse email: <span class="text-secondary-text">{$user?.profile.email}</span>
				</p>
			</div>
		</div>
		<h2 class="text-primary-text mt-8 mb-2 text-2xl font-bold md:text-3xl">Mes données</h2>
		<p class="text-primary-text">
			Vous pouvez télécharger vos données personnelles au format JSON.
		</p>
		<textarea class="h-64 w-full rounded-lg bg-gray-100 p-2" readonly>
			{JSON.stringify($userData, null, 2)}
		</textarea>
		<button
			class="bg-primary hover:bg-primary-strong rounded px-4 py-2 text-white hover:cursor-pointer"
		>
			<Download class="mr-2 inline" />
			Télécharger mes données
		</button>
		<h2 class="text-primary-text mt-8 mb-2 text-2xl font-bold md:text-3xl">Zone de danger</h2>
		<p class="text-primary-text">
			Si vous supprimez votre compte, toutes vos données seront perdues.
		</p>
		<p class="text-primary-text">Attention, cette action est irréversible !</p>
		<button
			class="rounded bg-red-600 px-4 py-2 text-white hover:cursor-pointer hover:bg-red-700"
			onclick={askConfirmation}
		>
			<Trash2 class="mr-2 inline" />
			Supprimer mon compte
		</button>
		<dialog
			bind:this={confirmDialog}
			closedby="any"
			class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white"
		>
			<div class="flex flex-col items-center justify-center gap-4 p-8 shadow-2xl">
				<p>Etes-vous sûr de vouloir supprimer votre compte ?</p>
				<form method="dialog" class="flex flex-row gap-2">
					<button
						value="cancel"
						class="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:cursor-pointer hover:bg-gray-400"
						onclick={cancelAction}
					>
						<Undo class="mr-2 inline" />
						Annuler</button
					>
					<button
						value="confirm"
						class="rounded bg-red-600 px-4 py-2 text-white hover:cursor-pointer hover:bg-red-700"
						onclick={confirmAction}
					>
						<Trash2 class="mr-2 inline" />
						Confirmer la suppression</button
					>
				</form>
			</div>
		</dialog>
	</div>
</div>
