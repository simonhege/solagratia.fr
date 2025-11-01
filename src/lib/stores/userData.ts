import { readonly, writable } from 'svelte/store';
import { user } from '$lib/stores/user';
import { browser } from '$app/environment';
import type { BibleExcerpt, BibleRef } from '$lib/models/bible';
import { Favorite, UserData } from '$lib/models/user';

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
				let userData: UserData;
				if (v == null) {
					userData = new UserData($user?.profile.sub, [], [], []);
				} else {
					userData = UserData.fromJSON(v);
				}
				userDataWritable.set(userData);
			});
	});

	userData.subscribe((v) => (content = v));
}

function isFavorite(favorites: Favorite[] | undefined, ref: BibleRef) {
	return favorites && favorites.some((fav) => ref.equals(fav.ref));
}

function addFavorite(ref: BibleRef) {
	content?.favorites.push(new Favorite(ref));
	const req = new Request(URL, {
		method: 'PUT',
		headers: {
			Authorization: 'Bearer ' + access_token,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(content?.toJSON())
	});
	fetch(req).then((response) => {
		console.log('PUT request completed', response);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
	});
	console.log('User data updated, added', ref, content);
	userDataWritable.set(content);
}

function removeFavorite(ref: BibleRef) {
	if (content == null) {
		return;
	}
	content.favorites = content.favorites.filter((fav) => !fav.ref.equals(ref));

	const req = new Request(import.meta.env.VITE_SG_API + '/users/me/favorites', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + access_token
		},
		body: JSON.stringify({ action: 'remove', reference: ref.toJSON() })
	});
	fetch(req).then((res) => {
		if (res.ok) {
			console.log('Favorite verse removed (request completed)', ref);
		} else {
			console.error('Failed to remove favorite verse', ref);
		}
	});
	console.log('User data updated, removed', ref, content);
	userDataWritable.set(content);
}

export { userData, addFavorite, removeFavorite, isFavorite };
