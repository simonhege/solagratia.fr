import { BibleExcerpt } from './bible';

/**
 * Represents a concise summary of a meditation entry.
 *
 * Contains identifying metadata (id, slug, title), a Bible excerpt, an image URL,
 * a short descriptive text, publication status and date, and associated tags.
 *
 * Instances are typically constructed from server-side JSON using {@link MeditationSummary.fromJSON}.
 *
 * @param id - Unique identifier for the meditation.
 * @param slug - URL-friendly slug used in routes.
 * @param title - Display title of the meditation.
 * @param verses - Bible excerpt associated with the meditation.
 * @param imageURL - URL to the meditation's image (thumbnail or hero).
 * @param short - Short summary or teaser shown in lists or previews.
 * @param status - Publication status (for example draft, published/active).
 * @param publicationDate - Date when the meditation was (or will be) published.
 * @param tags - Array of tag strings used to categorize or filter the meditation.
 *
 * @remarks
 * - Use {@link fromJSON} to hydrate an instance from a plain object received from an API.
 * - Use {@link isActive} to check whether the meditation is currently published/active.
 * - Use {@link formattedDate} to obtain a localized, human-readable publication date.
 *
 * @example
 * // Create from parsed API response
 * const summary = MeditationSummary.fromJSON(apiResponse);
 *
 * @public
 */
export class MeditationSummary {
	constructor(
		public id: string,
		public slug: string,

		public title: string,
		public verses: BibleExcerpt,
		public imageUrl: string,

		public short: string,

		public status: MeditationStatus,
		public publicationDate: Date,

		public tags: string[]
	) {}

	static fromJSON(json: any): MeditationSummary {
		return new MeditationSummary(
			json.id,
			json.slug,
			json.title,
			BibleExcerpt.fromJSON(json.verses),
			json.imageUrl,
			json.short,
			json.status,
			new Date(json.publicationDate),
			json.tags
		);
	}

	isActive(): boolean {
		return this.status === MeditationStatus.Active;
	}

	formattedDate(): string {
		const text = this.publicationDate.toLocaleDateString('fr-FR', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
		return text.charAt(0).toUpperCase() + text.slice(1);
	}
}

/**
 * Represents a detailed meditation, extending the summary with full content and related Bible excerpts.
 *
 * @extends MeditationSummary
 *
 * @param id - Unique identifier for the meditation.
 * @param slug - URL-friendly string identifier.
 * @param title - Title of the meditation.
 * @param verses - Main Bible excerpt associated with the meditation.
 * @param imageUrl - URL to the meditation's image.
 * @param short - Short summary or excerpt of the meditation.
 * @param full - Full content of the meditation.
 * @param status - Publication status of the meditation.
 * @param publicationDate - Date when the meditation was or will be published.
 * @param tags - List of tags associated with the meditation.
 * @param seeAlso - Array of related Bible excerpts for further reading.
 *
 * @method static fromJSON - Creates a Meditation instance from a JSON object.
 */
export class Meditation extends MeditationSummary {
	constructor(
		id: string,
		slug: string,

		title: string,
		verses: BibleExcerpt,
		imageUrl: string,

		short: string,
		public full: string,

		status: MeditationStatus,
		publicationDate: Date,

		tags: string[],

		public seeAlso: BibleExcerpt[]
	) {
		super(id, slug, title, verses, imageUrl, short, status, publicationDate, tags);
	}

	static fromJSON(json: any): Meditation {
		return new Meditation(
			json.id,
			json.slug,
			json.title,
			BibleExcerpt.fromJSON(json.verses),
			json.imageUrl,
			json.short,
			json.full,
			json.status,
			new Date(json.publicationDate),
			json.tags,
			json.seeAlso.map((v: any) => BibleExcerpt.fromJSON(v))
		);
	}

	toJSON(): any {
		return {
			id: this.id,
			slug: this.slug,
			title: this.title,
			verses: this.verses.toJSON(),
			imageUrl: this.imageUrl,
			short: this.short,
			full: this.full,
			status: this.status,
			publicationDate: this.publicationDate.toISOString(),
			tags: this.tags,
			seeAlso: this.seeAlso.map((v: BibleExcerpt) => v.toJSON())
		};
	}

	paragraphs(): string[] {
		return this.full.split('\n\n');
	}
}

export enum MeditationStatus {
	Active = 'active',
	Draft = 'draft'
}
