import { readonly, writable } from 'svelte/store';
import { user } from '$lib/stores/user';
import { browser } from '$app/environment';

export type BibleRef = {
	bookCode: string;
	bookName: string;
	chapter: number;
	verseStart: number;
	verseEnd: number;
};

export function bibleRefToString(ref: BibleRef): string {
	const bookName = ref.bookName ? ref.bookName : ref.bookCode;
	return `${bookName} ${ref.chapter}.${ref.verseStart}${ref.verseEnd !== ref.verseStart ? '-' + ref.verseEnd : ''}`;
}

export function bibleRefToHash(ref: BibleRef): string {
	return `${ref.bookCode}/${ref.chapter}/${ref.verseStart}${ref.verseEnd !== ref.verseStart ? '-' + ref.verseEnd : ''}`;
}

export function bibleRefEquals(a: BibleRef, b: BibleRef): boolean {
	return (
		a.bookCode === b.bookCode &&
		a.chapter === b.chapter &&
		a.verseStart === b.verseStart &&
		a.verseEnd === b.verseEnd
	);
}

type Favorite = {
	ref: BibleRef;
	createdAt: string;
};

type Note = {
	id: string;
	createdAt: string;
	ref: BibleRef;
	content: string;
};

type Exploration = {
	id: string;
	createdAt: string;
	question: string;
	verses: BibleRef[];
};

type UserData = {
	id: string;
	favorites: Favorite[];
	notes: Note[];
	explorations: Exploration[];
};

const URL = import.meta.env.VITE_SG_API + '/users/me';

let content: UserData | null = null;
let access_token: string;
const userDataWritable = writable<UserData | null>(null);
const userData = readonly(userDataWritable);

if (browser) {
	user.subscribe(($user) => {
		if (!$user) {
			console.log('User disconnected, removing user data');
			userDataWritable.set(null);
			access_token = '';
			return;
		}

		console.log('User connected, retrieving user data', $user.profile.sub);
		access_token = $user.access_token;
		const req = new Request(URL, {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + $user?.access_token
			}
		});

		fetch(req)
			.then((response) => {
				console.log('User data response received', response);
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((v) => {
				if (v == null) {
					v = {
						id: $user?.profile.sub,
						favorites: [],
						notes: [],
						explorations: []
					};
				}
				userDataWritable.set(v);
			});
	});

	userData.subscribe((v) => (content = v));
}

function addFavorite(ref: BibleRef) {
	content?.favorites.push({
		ref: ref,
		createdAt: new Date().toISOString()
	});
	const req = new Request(URL, {
		method: 'PUT',
		headers: {
			Authorization: 'Bearer ' + access_token,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(content)
	});
	fetch(req).then((response) => {
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
	});
	userDataWritable.set(content);
}

function removeFavorite(ref: BibleRef) {
	if (content == null) {
		return;
	}
	content.favorites = content.favorites.filter((fav) => !bibleRefEquals(fav.ref, ref));
	const req = new Request(URL, {
		method: 'PUT',
		headers: {
			Authorization: 'Bearer ' + access_token,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(content)
	});
	fetch(req).then((response) => {
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
	});
	userDataWritable.set(content);
}

export { userData, addFavorite, removeFavorite };
