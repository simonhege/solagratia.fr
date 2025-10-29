<script lang="ts">
	import type { PageProps } from '../$types';
	import { bibleRefToString } from '$lib/stores/userData';
	import PageTitle from '$lib/PageTitle.svelte';

	let { data }: PageProps = $props();

	function formatDate(dateStr: string): string {
		const dateObj = new Date(dateStr);
		const options: Intl.DateTimeFormatOptions = {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		};
		return dateObj.toLocaleDateString('fr-FR', options);
	}
</script>

<div class="container mx-auto max-w-7xl p-2">
	<PageTitle title="Se ressourcer" />
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each data.meditations as meditation}
			<div class="overflow-hidden rounded-lg bg-white shadow-md">
				<div class="p-6">
					<div class="mb-3">
						<span class="text-sm text-gray-500 lg:text-base">
							{formatDate(meditation.publicationDate)}
						</span>
					</div>
					<h3
						class="hover:text-primary mb-2 text-xl font-semibold text-gray-800 transition duration-200 lg:text-2xl"
					>
						<a href={'/se-ressourcer/' + meditation.slug}>
							{bibleRefToString(meditation.verses.reference)} : {meditation.title}
						</a>
					</h3>
					{#if meditation.imageUrl}
						<a href={'/se-ressourcer/' + meditation.slug}>
							<img
								src={meditation.imageUrl}
								alt={meditation.verses.text +
									' - La Bible, ' +
									bibleRefToString(meditation.verses.reference)}
								class="mb-4 w-full rounded-md object-cover"
							/>
						</a>
					{/if}
					<p class="mb-4 text-gray-600 lg:text-xl">
						{meditation.short}
					</p>
					<div class="mb-3 flex items-center justify-between lg:text-xl">
						<a
							href={'/se-ressourcer/' + meditation.slug}
							class="hover:text-primary hover:underline"
						>
							Lire en entier &rarr;
						</a>
					</div>

					<div class="mb-3">
						{#each meditation.tags as tag}
							<span
								class="mr-2 inline-block rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 lg:text-sm"
							>
								{tag}
							</span>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
