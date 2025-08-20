<script lang="ts">
	import { goto } from '$app/navigation';
	import { userManager } from '$lib/stores/user';

	$effect(() => {
		userManager
			.signinCallback()
			.then((user) => {
				console.log(
					'Signin callback success',
					'user',
					user,
					'profile',
					user?.profile,
					'state',
					user?.state
				);
				goto(user?.state['returnTo']);
			})
			.catch((reason) => {
				console.log('Signin callback failure', 'reason', reason);
				goto('/');
			});
	});
</script>

<svelte:head>
	<title>Callback - Sola Gratia</title>
</svelte:head>
