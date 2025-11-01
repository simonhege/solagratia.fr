export class BibleRef {
	constructor(
		public bookCode: string,
		public bookName: string,
		public chapter: number,
		public verseStart: number,
		public verseEnd: number
	) {}

	static fromJSON(json: any): BibleRef {
		return new BibleRef(json.bookCode, json.bookName, json.chapter, json.verseStart, json.verseEnd);
	}

	toString(): string {
		const bookName = this.bookName ? this.bookName : this.bookCode;
		return `${bookName} ${this.chapter}.${this.verseStart}${this.verseEnd !== this.verseStart ? '-' + this.verseEnd : ''}`;
	}

	toHash(): string {
		return `${this.bookCode}/${this.chapter}/${this.verseStart}${this.verseEnd !== this.verseStart ? '-' + this.verseEnd : ''}`;
	}

	toHref(): string {
		return `/bible/${this.bookCode}/${this.chapter}#${this.verseStart}${this.verseEnd !== this.verseStart ? '-' + this.verseEnd : ''}`;
	}

	equals(other: BibleRef): boolean {
		return (
			this.bookCode === other.bookCode &&
			this.chapter === other.chapter &&
			this.verseStart === other.verseStart &&
			this.verseEnd === other.verseEnd
		);
	}

	toJSON(): any {
		return {
			bookCode: this.bookCode,
			bookName: this.bookName,
			chapter: this.chapter,
			verseStart: this.verseStart,
			verseEnd: this.verseEnd
		};
	}
}

export class BibleExcerpt {
	constructor(
		public reference: BibleRef,
		public text: string
	) {}

	static fromJSON(json: any): BibleExcerpt {
		return new BibleExcerpt(BibleRef.fromJSON(json.reference), json.text);
	}

	toJSON(): any {
		return {
			reference: this.reference.toJSON(),
			text: this.text
		};
	}
}

export class BibleExcerptImage extends BibleExcerpt {
	constructor(
		reference: BibleRef,
		text: string,
		public url: string,
		public dataUrl: string
	) {
		super(reference, text);
	}

	static fromJSON(json: any): BibleExcerptImage {
		return new BibleExcerptImage(
			BibleRef.fromJSON(json.reference),
			json.text,
			json.url,
			json.dataUrl
		);
	}
}
