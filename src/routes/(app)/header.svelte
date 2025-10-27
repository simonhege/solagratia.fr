<script lang="ts">
	import {
		LogIn,
		UserPlus,
		BookOpen,
		Search,
		GlassWater,
		Menu,
		LogOut,
		UserCircle,
		Settings,
		Star
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { user, userManager } from '$lib/stores/user';

	var showMenu = $state(false);
	var showUser = $state(false);

	function pageViewed(pathname: string) {
		if (!localStorage.getItem('do-not-track')) {
			var payload = {
				screen: window.screen.width + 'x' + window.screen.height,
				lang: window.navigator.language,
				page: pathname
			};
			const req = new Request(import.meta.env.VITE_SG_API + '/pageViewed', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});
			fetch(req).finally(() => {
				console.log('Page viewed', payload);
			});
		}
	}

	$effect(() => {
		pageViewed(page.url.pathname);
		showMenu = false;
	});
</script>

<header class="sticky top-0 z-50 bg-white shadow-sm">
	<div class="container mx-auto flex items-center justify-between px-4 py-4">
		<div class="text-primary flex items-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="mr-2"
			>
				<path d="M10 20V9H5V5h5V1h4V5h5v4H14V20ZM14 16 18 13 23 23 1 23 7 16 10 19 7 21" />
			</svg>
			<a class="text-xl font-bold" href="/">Sola&nbsp;Gratia</a>
		</div>

		<nav class="hidden space-x-6 md:flex">
			<a
				href="/bible"
				class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
			>
				<BookOpen class="mr-2 md:hidden lg:inline-block" /> Lire la Bible</a
			>
			<a
				href="/se-ressourcer"
				class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
			>
				<GlassWater class="mr-2 md:hidden lg:inline-block" /> Se Ressourcer</a
			>
			<a
				href="/explorer"
				class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
			>
				<Search class="mr-2 md:hidden lg:inline-block" /> Explorer</a
			>
		</nav>

		<div class="hidden items-center space-x-4 md:flex">
			{#if $user}
				<div class="relative flex items-center">
					<button
						onclick={() => (showUser = !showUser)}
						class="text-primary-text hover:text-primary inline-flex items-center transition duration-300 hover:cursor-pointer"
					>
						<UserCircle class="mr-2 md:inline-block" />
					</button>
					{#if showUser}
						<div
							class="absolute top-full right-0 mt-2 flex w-64 flex-col gap-2 rounded-xl bg-white p-2 shadow-lg"
						>
							<p class="text-secondary-text truncate">
								Connecté en tant que <br />{$user.profile.name}
							</p>

							<a
								href="/mes-favoris"
								class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
								onclick={() => (showUser = false)}
							>
								<Star class="mr-2 md:hidden lg:inline-block" /> Mes versets favoris
							</a>

							<a
								href="/mon-compte"
								class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
								onclick={() => (showUser = false)}
							>
								<Settings class="mr-2 md:hidden lg:inline-block" /> Paramètres du compte
							</a>
							<button
								onclick={() => userManager.removeUser()}
								class="text-primary-text hover:text-primary inline-flex items-center transition duration-300 hover:cursor-pointer"
							>
								<LogOut class="mr-2 md:hidden lg:inline-block" /> Se déconnecter
							</button>
						</div>
					{/if}
				</div>
			{:else}
				<button
					onclick={() => userManager.signinRedirect({ state: { returnTo: page.url.href } })}
					class="text-primary-text hover:text-primary inline-flex items-center transition duration-300 hover:cursor-pointer"
				>
					<LogIn class="mr-2 md:hidden lg:inline-block" /> Connexion
				</button>
				<a
					href="/inscription"
					class="bg-primary hover:bg-primary-strong inline-flex items-center rounded-md px-4 py-2 text-white transition duration-300"
				>
					<UserPlus class="mr-2 md:hidden lg:inline-block" /> Inscription
				</a>
			{/if}
		</div>

		<div class="flex items-center md:hidden">
			<button
				class="text-primary-text focus:outline-none"
				aria-label="Toggle menu"
				onclick={() => (showMenu = !showMenu)}
			>
				<Menu />
			</button>
		</div>
	</div>

	<div class="border-t border-gray-200 bg-white md:hidden {showMenu ? '' : 'hidden'}">
		<nav class="flex flex-col space-y-2 px-4 py-4">
			<a
				href="/bible"
				class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
			>
				<BookOpen class="mr-2" /> Lire la Bible
			</a>
			<a
				href="/se-ressourcer"
				class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
			>
				<GlassWater class="mr-2" /> Se Ressourcer
			</a>
			<a
				href="/explorer"
				class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
			>
				<Search class="mr-2" /> Explorer
			</a>
			{#if $user}
				<a
					href="/mes-favoris"
					class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
				>
					<Star class="mr-2" /> Mes versets favoris
				</a>
				<a
					href="/mon-compte"
					class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
				>
					<Settings class="mr-2" /> Paramètres du compte
				</a>
				<button
					onclick={() => userManager.removeUser()}
					class="text-primary-text hover:text-primary inline-flex items-center transition duration-300 hover:cursor-pointer"
				>
					<LogOut class="mr-2" /> Se déconnecter
				</button>
			{:else}
				<button
					onclick={() => userManager.signinRedirect({ state: { returnTo: page.url.href } })}
					class="text-primary-text hover:text-primary inline-flex items-center transition duration-300 hover:cursor-pointer"
				>
					<LogIn class="mr-2" /> Connexion
				</button>
				<a
					href="/inscription"
					class="bg-primary hover:bg-primary-strong inline-flex items-center justify-center rounded-md px-4 py-2 text-center text-white transition duration-300"
				>
					<UserPlus class="mr-2" /> Inscription
				</a>
			{/if}
		</nav>
	</div>
</header>
