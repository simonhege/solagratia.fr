import { browser } from '$app/environment';
import type { BibleRef } from './userData';

type ExplorerResponse = {
	verses: Array<{
		text: string;
		reference: BibleRef;
	}>;
	timestamp: number;
};

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export function getCachedResponse(question: string): ExplorerResponse | null {
	if (!browser) return null;

	try {
		const cached = sessionStorage.getItem(`explorer:${question}`);
		if (!cached) return null;

		const response = JSON.parse(cached) as ExplorerResponse;

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

export function setCachedResponse(
	question: string,
	verses: Array<{ text: string; reference: BibleRef }>
) {
	if (!browser) return;

	const response: ExplorerResponse = {
		verses,
		timestamp: Date.now()
	};

	try {
		sessionStorage.setItem(`explorer:${question}`, JSON.stringify(response));
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
