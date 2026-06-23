import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface AuthState {
	token: string | null;
	isAuthenticated: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		token: null,
		isAuthenticated: false
	});

	return {
		subscribe,
		init: () => {
			if (browser) {
				const token = localStorage.getItem('token');
				if (token) {
					set({ token, isAuthenticated: true });
				}
			}
		},
		login: (token: string) => {
			if (browser) {
				localStorage.setItem('token', token);
			}
			set({ token, isAuthenticated: true });
		},
		logout: () => {
			if (browser) {
				localStorage.removeItem('token');
			}
			set({ token: null, isAuthenticated: false });
		}
	};
}

export const authStore = createAuthStore();

export function logout() {
	authStore.logout();
	if (browser) {
		window.location.href = '/login';
	}
}
