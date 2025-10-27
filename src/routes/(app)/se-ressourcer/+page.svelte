<script lang="ts">

	import type { PageProps } from '../$types';
	import { bibleRefToString } from '$lib/stores/userData';
	import PageTitle from '$lib/PageTitle.svelte';

	let { data }: PageProps = $props();

	function formatDate(dateStr: string): string {
		const dateObj = new Date(dateStr);
		const options: Intl.DateTimeFormatOptions =  { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
		return dateObj.toLocaleDateString('fr-FR', options);
	}
</script>

<div class="container mx-auto max-w-7xl p-2">
	<PageTitle title="Se ressourcer" />
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each data.meditations as meditation}
			<div class="bg-white rounded-lg shadow-md overflow-hidden">
				<div class="p-6">
					<div class="mb-3">
						<span class="text-sm lg:text-base text-gray-500">
							{formatDate(meditation.publicationDate)}
						</span>
					</div>
					<h3 class="text-xl lg:text-2xl font-semibold text-gray-800 mb-2 hover:text-primary transition duration-200">
						<a href="{'/se-ressourcer/' + meditation.slug}">
							{bibleRefToString(meditation.verses.reference)} : {meditation.title}
						</a>
					</h3>
					{#if meditation.imageUrl}
						<a href="{'/se-ressourcer/' + meditation.slug}">
							<img src="{meditation.imageUrl}" 
								alt="{meditation.verses.text + ' - La Bible, ' + bibleRefToString(meditation.verses.reference)}" 
								class="w-full object-cover mb-4 rounded-md" />
						</a>
					{/if}
					<p class="text-gray-600 mb-4 lg:text-xl">
						{meditation.short}
					</p>
					<div class="mb-3 flex items-center justify-between lg:text-xl">
							<a href={'/se-ressourcer/' + meditation.slug} class="hover:text-primary hover:underline">
								Lire en entier &rarr;
							</a>
					</div>
					
					<div class="mb-3">
						{#each meditation.tags as tag}
							<span class="inline-block bg-indigo-100 text-indigo-800 text-xs lg:text-sm font-semibold px-2.5 py-0.5 rounded-full mr-2">
								{tag}
							</span>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

