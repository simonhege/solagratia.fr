import { BibleRef } from './bible';

export class Favorite {
	constructor(
		public ref: BibleRef,
		public createdAt: Date = new Date()
	) {}

	static fromJSON(json: any): Favorite {
		return new Favorite(BibleRef.fromJSON(json.ref), new Date(json.createdAt));
	}

	toJSON(): any {
		return {
			ref: this.ref.toJSON(),
			createdAt: this.createdAt.toISOString()
		};
	}
}

export class Note {
	constructor(
		public id: string,
		public ref: BibleRef,
		public createdAt: Date,
		public content: string
	) {}

	static fromJSON(json: any): Note {
		return new Note(json.id, BibleRef.fromJSON(json.ref), new Date(json.createdAt), json.content);
	}

	toJSON(): any {
		return {
			id: this.id,
			ref: this.ref.toJSON(),
			createdAt: this.createdAt.toISOString(),
			content: this.content
		};
	}
}

export class Exploration {
	constructor(
		public id: string,
		public createdAt: Date,
		public question: string,
		public verses: BibleRef[]
	) {}

	static fromJSON(json: any): Exploration {
		return new Exploration(
			json.id,
			new Date(json.createdAt),
			json.question,
			json.verses.map((v: any) => BibleRef.fromJSON(v))
		);
	}

	toJSON(): any {
		return {
			id: this.id,
			createdAt: this.createdAt.toISOString(),
			question: this.question,
			verses: this.verses.map((v: BibleRef) => v.toJSON())
		};
	}
}

export class UserData {
	constructor(
		public id: string,
		public favorites: Favorite[],
		public notes: Note[],
		public explorations: Exploration[]
	) {}

	static fromJSON(json: any): UserData {
		return new UserData(
			json.id,
			json.favorites.map((v: any) => Favorite.fromJSON(v)),
			json.notes.map((v: any) => Note.fromJSON(v)),
			json.explorations.map((v: any) => Exploration.fromJSON(v))
		);
	}

	toJSON(): any {
		return {
			id: this.id,
			favorites: this.favorites.map((v: Favorite) => v.toJSON()),
			notes: this.notes.map((v: Note) => v.toJSON()),
			explorations: this.explorations.map((v: Exploration) => v.toJSON())
		};
	}
}
