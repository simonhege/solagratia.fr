<script lang="ts">
	import { SquarePen, Trash2, Save, Undo } from '@lucide/svelte';

	let { text, date } = $props();
	let editing = $state(false);
	let newText = $state(text);

	function edit() {
		editing = true;
	}
	function undo() {
		newText = text;
		editing = false;
	}
	function save() {
		text = newText;
		editing = false;
	}
	function trash() {
		editing = false;
	}
</script>

<div class="mb-2 rounded border p-1">
	{#if editing}
		<textarea bind:value={newText}></textarea>
	{:else}
		<p>{text}</p>
	{/if}
	<p class="text-secondary-text flex justify-between">
		<span>{date}</span>
		{#if editing}
			<span>
				<button class="hover:text-primary align-text-bottom hover:cursor-pointer" onclick={undo}>
					<Undo />
				</button>
				<button class="hover:text-primary align-text-bottom hover:cursor-pointer" onclick={save}>
					<Save />
				</button>
				<button class="hover:text-primary align-text-bottom hover:cursor-pointer" onclick={trash}>
					<Trash2 />
				</button>
			</span>
		{:else}
			<span>
				<button class="hover:text-primary align-text-bottom hover:cursor-pointer" onclick={edit}>
					<SquarePen />
				</button>
			</span>
		{/if}
	</p>
</div>
