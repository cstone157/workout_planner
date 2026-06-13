<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Workout } from '$lib/api';

	export let workout: Workout;
	const dispatch = createEventDispatcher();
</script>

<div class="card workout-card">
	<div class="card-top">
		<div>
			<h3>
				<a href="/workouts/{workout.id}">{workout.name}</a>
			</h3>
			{#if workout.description}
				<p class="description">{workout.description}</p>
			{/if}
		</div>
		<span class="badge badge-primary">{workout.exercises.length} exercises</span>
	</div>

	{#if workout.exercises.length > 0}
		<div class="exercise-list">
			{#each workout.exercises.slice(0, 4) as ex}
				<span class="exercise-chip">{ex.exercise_name}</span>
			{/each}
			{#if workout.exercises.length > 4}
				<span class="exercise-chip muted">+{workout.exercises.length - 4} more</span>
			{/if}
		</div>
	{/if}

	<div class="card-actions">
		<a href="/workouts/{workout.id}" class="btn btn-secondary btn-sm">View & Log</a>
		<button class="btn btn-danger btn-sm" on:click={() => dispatch('delete', workout.id)}>
			Delete
		</button>
	</div>
</div>

<style>
	.workout-card { display: flex; flex-direction: column; gap: var(--space-4); }
	.card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-4); }
	h3 a { color: var(--color-text); text-decoration: none; }
	h3 a:hover { color: var(--color-primary); }
	.description { font-size: 0.875rem; color: var(--color-text-muted); margin-top: var(--space-1); }
	.exercise-list { display: flex; flex-wrap: wrap; gap: var(--space-2); }
	.exercise-chip {
		padding: 0.2rem 0.6rem;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}
	.exercise-chip.muted { color: var(--color-text-faint); }
	.card-actions { display: flex; gap: var(--space-2); margin-top: auto; }
</style>
