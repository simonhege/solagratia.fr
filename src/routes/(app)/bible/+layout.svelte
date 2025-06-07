<script lang="ts">
	let { children } = $props();
</script>

<main class="flex flex-grow items-center justify-center">
	<div class="text-primary-text w-full">
		{@render children()}
	</div>
</main>
