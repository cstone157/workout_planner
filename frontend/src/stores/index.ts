import { writable } from 'svelte/store';

// User store
export const user = writable(null);

// Authentication store
export const auth = writable({
  token: null,
  isAuthenticated: false
});

// Workouts store
export const workouts = writable([]);

// Equipment store
export const equipment = writable([]);

// Workout plans store
export const plans = writable([]);
