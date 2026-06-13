import { writable, derived } from 'svelte/store';
import type { User } from '$lib/api';

// ===== Persisted auth store =====

function createAuthStore() {
	const { subscribe, set, update } = writable<{
		user: User | null;
		accessToken: string | null;
		refreshToken: string | null;
	}>({
		user: null,
		accessToken: null,
		refreshToken: null
	});

	return {
		subscribe,

		init() {
			if (typeof window === 'undefined') return;
			const accessToken = localStorage.getItem('access_token');
			const refreshToken = localStorage.getItem('refresh_token');
			const userRaw = localStorage.getItem('user');
			if (accessToken && userRaw) {
				try {
					const user = JSON.parse(userRaw) as User;
					set({ user, accessToken, refreshToken });
				} catch {
					this.logout();
				}
			}
		},

		login(accessToken: string, refreshToken: string, user: User) {
			localStorage.setItem('access_token', accessToken);
			localStorage.setItem('refresh_token', refreshToken);
			localStorage.setItem('user', JSON.stringify(user));
			set({ user, accessToken, refreshToken });
		},

		logout() {
			localStorage.removeItem('access_token');
			localStorage.removeItem('refresh_token');
			localStorage.removeItem('user');
			set({ user: null, accessToken: null, refreshToken: null });
		}
	};
}

export const authStore = createAuthStore();
export const isAuthenticated = derived(authStore, ($auth) => !!$auth.accessToken);
export const currentUser = derived(authStore, ($auth) => $auth.user);
