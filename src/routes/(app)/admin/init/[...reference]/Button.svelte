<script lang="ts">
	import { WandSparkles } from '@lucide/svelte';

	let { text = '', onclick, loading = $bindable(false), children = undefined } = $props();

	async function click() {
		loading = true;
		await onclick();
		loading = false;
	}
</script>

<button
	type="button"
	disabled={loading}
	class="bg-primary hover:bg-primary-strong
    inline-flex
    justify-center rounded-md
    border border-transparent
    px-4 py-2 text-sm font-medium text-white
    shadow-sm hover:cursor-pointer
    disabled:animate-ping
    disabled:cursor-not-allowed
    "
	onclick={click}
>
	{#if children}
		{@render children()}
	{:else}
		<WandSparkles
			class={`
      ${text ? 'mr-2' : ''} 
    `}
		/>
		{text}
	{/if}
</button>
