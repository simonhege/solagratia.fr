<script lang="ts">
	import Footer from './footer.svelte';
	import Header from './header.svelte';

	let { children } = $props();
</script>

<div class="from-bgstart to-bgend text-secondary flex min-h-screen flex-col bg-gradient-to-br">
	<Header />

	{@render children()}

	<Footer />
</div>
