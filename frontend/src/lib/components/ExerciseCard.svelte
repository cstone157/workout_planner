<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Exercise } from '$lib/api';

	export let exercise: Exercise;
	const dispatch = createEventDispatcher();

	const muscleColors: Record<string, string> = {
		chest: 'badge-primary',
		back: 'badge-accent',
		legs: 'badge-success',
		shoulders: 'badge-warning',
		arms: 'badge-primary',
		core: 'badge-accent',
		cardio: 'badge-success'
	};

	$: muscleClass = exercise.muscle_group
		? (muscleColors[exercise.muscle_group.toLowerCase()] ?? 'badge-primary')
		: 'badge-primary';
</script>

<div class="card exercise-card">
	<div class="card-top">
		<h3>{exercise.name}</h3>
		<div class="badges">
			{#if exercise.muscle_group}
				<span class="badge {muscleClass}">{exercise.muscle_group}</span>
			{/if}
			{#if exercise.equipment}
				<span class="badge badge-accent">{exercise.equipment}</span>
			{/if}
		</div>
	</div>

	{#if exercise.description}
		<p class="description">{exercise.description}</p>
	{/if}

	<div class="card-actions">
		<button class="btn btn-danger btn-sm" on:click={() => dispatch('delete', exercise.id)}>
			Remove
		</button>
	</div>
</div>

<style>
	.exercise-card { display: flex; flex-direction: column; gap: var(--space-3); }
	.card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-3); }
	h3 { font-size: 1rem; }
	.badges { display: flex; flex-wrap: wrap; gap: var(--space-1); flex-shrink: 0; }
	.description { font-size: 0.875rem; color: var(--color-text-muted); }
	.card-actions { margin-top: auto; }
</style>
