<script lang="ts">
	import PageTitle from '$lib/PageTitle.svelte';
	import {user, userManager} from '$lib/stores/user'
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
				'Authorization': 'Bearer ' + $user?.id_token
			}
		});

		return fetch(req);
	}


	function deleteData() {
		const req = new Request('https://api.solagratia.fr/users/me', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + $user?.access_token
			}
		});

		return fetch(req);
	}
</script>

<div class="container mx-auto max-w-5xl p-2">
	<PageTitle title="Mon compte" />
	
	<div class="mb-12 rounded-xl bg-white p-2 shadow-lg md:p-4 lg:p-8">
		<h2 class="text-primary-text text-2xl font-bold md:text-3xl mb-2">Mon profil</h2>
		<div class="flex flex-col md:flex-row gap-10 text-lg">
			<img src="{$user?.profile.picture}" alt="Profile"
				 class="w-32 mb-4 rounded-full" />
			<div>
				<p class="text-primary-text">Nom complet: <span class="text-secondary-text">{$user?.profile.name}</span></p>
				<p class="text-primary-text">Adresse email: <span class="text-secondary-text">{$user?.profile.email}</span></p>
			</div>
		</div>
		<h2 class="text-primary-text text-2xl font-bold md:text-3xl mb-2 mt-8">Mes données</h2>
		<button class="bg-primary text-white py-2 px-4 rounded hover:bg-primary-strong hover:cursor-pointer">
			<Download class="inline mr-2" />
			Télécharger mes données
		</button>
		<h2 class="text-primary-text text-2xl font-bold md:text-3xl mb-2 mt-8">Zone de danger</h2>
		<p class="text-primary-text">Si vous supprimez votre compte, toutes vos données seront perdues.</p>
		<p class="text-primary-text">Attention, cette action est irréversible !</p>
		<button class="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 hover:cursor-pointer"
			onclick={askConfirmation}>
			<Trash2 class="inline mr-2" />
			Supprimer mon compte
		</button>
		<dialog bind:this={confirmDialog} closedby="any" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white">
			<div class="flex flex-col gap-4 p-8 shadow-2xl items-center justify-center ">
				<p>Etes-vous sûr de vouloir supprimer votre compte ?</p>
				<form method="dialog" class="flex flex-row gap-2">
					<button value="cancel" 
						class="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 hover:cursor-pointer"
						onclick={cancelAction}>
						<Undo class="inline mr-2" />
						Annuler</button>
					<button value="confirm" 
					class="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 hover:cursor-pointer"
					onclick={confirmAction}>
						<Trash2 class="inline mr-2" />
						Confirmer la suppression</button>
				</form>
			</div>
		</dialog>

	</div>
</div>																																		