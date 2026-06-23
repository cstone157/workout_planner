import { writable } from 'svelte/store';

export const API_BASE = '/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
	// Initialize headers if not present
	const headers = new Headers(options.headers || {});
	
	// Add content type for JSON bodies
	if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json');
	}

	// Add auth token if available
	const token = localStorage.getItem('token');
	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	const response = await fetch(`${API_BASE}${endpoint}`, {
		...options,
		headers
	});

	if (response.status === 401 || response.status === 403) {
		// Auto-logout on unauthorized
		localStorage.removeItem('token');
		// We use location.href to ensure full page reload and store reset
		if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
			window.location.href = '/login';
		}
	}

	// If the response is not ok, try to parse the error message
	if (!response.ok) {
		let errorMessage = 'An error occurred';
		try {
			const data = await response.json();
			errorMessage = data.message || data.error || errorMessage;
		} catch (e) {
			errorMessage = response.statusText;
		}
		throw new Error(errorMessage);
	}

	// Handle empty responses
	if (response.status === 204) {
		return null;
	}

	try {
		return await response.json();
	} catch (e) {
		return null;
	}
}
