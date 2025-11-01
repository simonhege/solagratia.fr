import { browser } from '$app/environment';
import { BibleExcerpt } from '$lib/models/bible';

class ExplorerResponse {
	constructor(
		public verses: BibleExcerpt[],
		public timestamp: number
	) {}

	static fromJSON(json: any) {
		return new ExplorerResponse(
			json.verses.map((v: any) => BibleExcerpt.fromJSON(v)),
			json.timestamp
		);
	}

	toJSON(): any {
		return {
			verses: this.verses.map((v: BibleExcerpt) => v.toJSON()),
			timestamp: this.timestamp
		};
	}
}

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export function getCachedResponse(question: string): ExplorerResponse | null {
	if (!browser) return null;

	try {
		const cached = sessionStorage.getItem(`explorer:${question}`);
		if (!cached) return null;

		const response = ExplorerResponse.fromJSON(JSON.parse(cached));

		// Check if cache is still valid (within CACHE_DURATION)
		if (Date.now() - response.timestamp > CACHE_DURATION) {
			sessionStorage.removeItem(`explorer:${question}`);
			return null;
		}

		return response;
	} catch {
		return null;
	}
}

export function setCachedResponse(question: string, verses: BibleExcerpt[]) {
	if (!browser) return;

	const response = new ExplorerResponse(verses, Date.now());

	try {
		sessionStorage.setItem(`explorer:${question}`, JSON.stringify(response.toJSON()));
	} catch {
		// Handle storage errors (e.g., quota exceeded) silently
		try {
			// Clear all explorer caches if storage is full
			for (let i = 0; i < sessionStorage.length; i++) {
				const key = sessionStorage.key(i);
				if (key?.startsWith('explorer:')) {
					sessionStorage.removeItem(key);
				}
			}
			// Try to store again
			sessionStorage.setItem(`explorer:${question}`, JSON.stringify(response));
		} catch {
			// If still fails, just ignore
		}
	}
}
