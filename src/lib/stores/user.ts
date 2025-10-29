import { writable, type Writable, type Readable, readable, derived } from 'svelte/store';
import { UserManager, WebStorageStateStore, type User } from 'oidc-client-ts';
import { browser } from '$app/environment';

let userManager: UserManager;
let user: Writable<User | null>;

let isAdmin: Readable<boolean>;

if (browser) {
	const settings = {
		authority: import.meta.env.VITE_OIDC_AUTHORITY,
		client_id: 'www.solagratia.fr',
		fetchRequestCredentials: 'include' as RequestCredentials,
		response_type: 'code',
		userStore: new WebStorageStateStore({ store: window.localStorage }),
		redirect_uri: `${window.location.origin}/callback`
	};

	userManager = new UserManager(settings);
	user = writable<User | null>(null);
	isAdmin = derived(user, ($user) => {
		const roles: Array<string> = <Array<string>>$user?.profile?.roles || [];
		return roles.includes('admin');
	});

	// Load user on init
	userManager.getUser().then((loadedUser) => {
		if (loadedUser && !loadedUser.expired) {
			user.set(loadedUser);
		}
	});

	// Listen for login/logout events
	userManager.events.addUserLoaded((loadedUser) => user.set(loadedUser));
	userManager.events.addUserUnloaded(() => user.set(null));
}
export { userManager, user, isAdmin };
