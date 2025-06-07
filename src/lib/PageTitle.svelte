<script lang="ts">
	let { title } = $props();
</script>

<svelte:head>
	<title>{title} - Sola Gratia</title>
</svelte:head>

<h1 class="text-primary-text my-4 text-center text-3xl leading-relaxed font-bold md:text-4xl">
	{title}
</h1>
