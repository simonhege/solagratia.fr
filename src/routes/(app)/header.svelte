<script lang="ts">
	import { LogIn, UserPlus, BookOpen, Search, GlassWater, Menu } from '@lucide/svelte';
	import { page } from '$app/state';

	var showMenu = $state(false);

	function pageViewed(pathname: string) {
		if (!localStorage.getItem("do-not-track")) {
			var payload = {
				screen: window.screen.width + 'x' + window.screen.height,
				lang: window.navigator.language,
				page: pathname,
			};
			const req = new Request("https://api.solagratia.fr/pageViewed", {
				method: 'POST',
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload)
			});
			window.fetch(req).finally(() => {
				console.log("Page viewed", payload);
			});
		}
	}

	$effect(() => {
		pageViewed(page.url.pathname)
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
				href="/pause"
				class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
			>
				<GlassWater class="mr-2 md:hidden lg:inline-block" /> Pause Quotidienne</a
			>
			<a
				href="/explorer"
				class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
			>
				<Search class="mr-2 md:hidden lg:inline-block" /> Explorer</a
			>
		</nav>

		<div class="hidden items-center space-x-4 md:flex">
			<a
				href="/connexion"
				class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
			>
				<LogIn class="mr-2 md:hidden lg:inline-block" /> Connexion
			</a>
			<a
				href="/inscription"
				class="bg-primary hover:bg-primary-strong inline-flex items-center rounded-md px-4 py-2 text-white transition duration-300"
			>
				<UserPlus class="mr-2 md:hidden lg:inline-block" /> Inscription
			</a>
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
				href="/pause"
				class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
			>
				<GlassWater class="mr-2" /> Pause Quotidienne
			</a>
			<a
				href="/explorer"
				class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
			>
				<Search class="mr-2" /> Explorer
			</a>
			<a
				href="/connexion"
				class="text-primary-text hover:text-primary inline-flex items-center transition duration-300"
			>
				<LogIn class="mr-2" /> Connexion
			</a>
			<a
				href="/inscription"
				class="bg-primary hover:bg-primary-strong inline-flex items-center justify-center rounded-md px-4 py-2 text-center text-white transition duration-300"
			>
				<UserPlus class="mr-2" /> Inscription
			</a>
		</nav>
	</div>
</header>
