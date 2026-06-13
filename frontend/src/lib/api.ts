// API client — attaches JWT to every request

const BASE = '/api';

function getToken(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('access_token');
}

async function request<T>(
	path: string,
	opts: RequestInit = {},
	authenticated = true
): Promise<T> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(opts.headers as Record<string, string>)
	};

	if (authenticated) {
		const token = getToken();
		if (token) headers['Authorization'] = `Bearer ${token}`;
	}

	const res = await fetch(`${BASE}${path}`, { ...opts, headers });

	if (res.status === 401) {
		// Try to refresh the token
		const refreshed = await tryRefresh();
		if (refreshed) {
			headers['Authorization'] = `Bearer ${getToken()}`;
			const retry = await fetch(`${BASE}${path}`, { ...opts, headers });
			if (!retry.ok) throw new ApiError(retry.status, await retry.text());
			if (retry.status === 204) return undefined as T;
			return retry.json();
		} else {
			localStorage.removeItem('access_token');
			localStorage.removeItem('refresh_token');
			window.location.href = '/login';
			throw new ApiError(401, 'Unauthorized');
		}
	}

	if (!res.ok) {
		const body = await res.text();
		throw new ApiError(res.status, body);
	}
	if (res.status === 204) return undefined as T;
	return res.json();
}

async function tryRefresh(): Promise<boolean> {
	const refreshToken = localStorage.getItem('refresh_token');
	if (!refreshToken) return false;
	try {
		const res = await fetch(`${BASE}/auth/refresh`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refresh_token: refreshToken })
		});
		if (!res.ok) return false;
		const data = await res.json();
		localStorage.setItem('access_token', data.access_token);
		return true;
	} catch {
		return false;
	}
}

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
	}
}

// ===== Auth =====
export interface AuthTokens {
	access_token: string;
	refresh_token: string;
	user: User;
}

export interface User {
	id: string;
	email: string;
	display_name: string | null;
}

export const auth = {
	register: (email: string, password: string, display_name?: string) =>
		request<AuthTokens>('/auth/register', {
			method: 'POST',
			body: JSON.stringify({ email, password, display_name })
		}, false),

	login: (email: string, password: string) =>
		request<AuthTokens>('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password })
		}, false),

	refresh: (refresh_token: string) =>
		request<{ access_token: string }>('/auth/refresh', {
			method: 'POST',
			body: JSON.stringify({ refresh_token })
		}, false)
};

// ===== Exercises =====
export interface Exercise {
	id: string;
	name: string;
	description: string | null;
	muscle_group: string | null;
	equipment: string | null;
	created_at: string;
}

export interface CreateExercise {
	name: string;
	description?: string;
	muscle_group?: string;
	equipment?: string;
}

export const exercises = {
	list: () => request<Exercise[]>('/exercises'),
	get: (id: string) => request<Exercise>(`/exercises/${id}`),
	create: (body: CreateExercise) =>
		request<Exercise>('/exercises', { method: 'POST', body: JSON.stringify(body) }),
	update: (id: string, body: Partial<CreateExercise>) =>
		request<Exercise>(`/exercises/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
	delete: (id: string) => request<void>(`/exercises/${id}`, { method: 'DELETE' })
};

// ===== Workouts =====
export interface WorkoutExercise {
	exercise_id: string;
	exercise_name: string;
	sets: number | null;
	reps: number | null;
	rest_seconds: number | null;
}

export interface Workout {
	id: string;
	name: string;
	description: string | null;
	exercises: WorkoutExercise[];
	created_at: string;
}

export interface CreateWorkout {
	name: string;
	description?: string;
	exercises?: Array<{ exercise_id: string; sets?: number; reps?: number; rest_seconds?: number }>;
}

export const workouts = {
	list: () => request<Workout[]>('/workouts'),
	get: (id: string) => request<Workout>(`/workouts/${id}`),
	create: (body: CreateWorkout) =>
		request<Workout>('/workouts', { method: 'POST', body: JSON.stringify(body) }),
	update: (id: string, body: Partial<CreateWorkout>) =>
		request<Workout>(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
	delete: (id: string) => request<void>(`/workouts/${id}`, { method: 'DELETE' })
};

// ===== Sessions =====
export interface SessionSet {
	exercise_id: string;
	exercise_name: string;
	set_number: number;
	reps_done: number;
	weight_kg: number | null;
}

export interface Session {
	id: string;
	workout_id: string | null;
	workout_name: string | null;
	performed_at: string;
	notes: string | null;
	sets: SessionSet[];
}

export interface CreateSession {
	workout_id?: string;
	notes?: string;
	sets: Array<{
		exercise_id: string;
		set_number: number;
		reps_done: number;
		weight_kg?: number;
	}>;
}

export const sessions = {
	list: () => request<Session[]>('/sessions'),
	get: (id: string) => request<Session>(`/sessions/${id}`),
	create: (body: CreateSession) =>
		request<Session>('/sessions', { method: 'POST', body: JSON.stringify(body) })
};

// ===== Search =====
export interface SearchResult {
	id: string;
	name: string;
	description: string | null;
	muscle_group: string | null;
	equipment: string | null;
	similarity_score: number;
}

export const search = {
	semantic: (query: string, n_results = 10) =>
		request<SearchResult[]>('/search', {
			method: 'POST',
			body: JSON.stringify({ query, n_results })
		})
};
