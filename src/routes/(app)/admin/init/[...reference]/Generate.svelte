<script lang="ts">
	import Button from './Button.svelte';

	let {
		content = $bindable(),
		feedback = $bindable(),
		generate,
		rows,
		text = 'Générer',
		loading = $bindable(false)
	} = $props();

	async function click() {
		const copiedContent = content;
		const copiedFeedback = feedback;
		content = '...';
		await generate(copiedContent, copiedFeedback);
	}
</script>

{#if content}
	<div class="mb-4">
		{#if rows > 1}
			<textarea
				id="content"
				bind:value={content}
				{rows}
				class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
			></textarea>
		{:else}
			<input
				id="content"
				bind:value={content}
				class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm"
			/>
		{/if}
	</div>
	<div class="mb-4 flex items-stretch gap-2">
		<input
			id="feedback"
			type="text"
			bind:value={feedback}
			placeholder="Que faut-il changer ?"
			class="focus:border-primary focus:ring-primary block w-full rounded-md border-gray-300 shadow-sm"
		/>
		<Button text="" bind:loading onclick={click} />
	</div>
{:else}
	<Button {text} bind:loading onclick={click} />
{/if}
