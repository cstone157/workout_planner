<script lang="ts">
	import { onMount } from 'svelte';
	import { exercises, type Exercise } from '$lib/api';
	import ExerciseCard from '$lib/components/ExerciseCard.svelte';

	let exerciseList: Exercise[] = [];
	let loading = true;
	let error = '';
	let filter = '';

	onMount(async () => {
		try {
			exerciseList = await exercises.list();
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to load exercises.';
		} finally {
			loading = false;
		}
	});

	$: filtered = exerciseList.filter(e =>
		e.name.toLowerCase().includes(filter.toLowerCase()) ||
		(e.muscle_group ?? '').toLowerCase().includes(filter.toLowerCase())
	);

	async function deleteExercise(id: string) {
		try {
			await exercises.delete(id);
			exerciseList = exerciseList.filter(e => e.id !== id);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Delete failed.';
		}
	}
</script>

<svelte:head><title>Exercises — WorkoutAI</title></svelte:head>

<div class="page">
	<div class="container fade-in">
		<div class="page-header">
			<div class="flex items-center justify-between">
				<div>
					<h1>Exercises</h1>
					<p>Your exercise library — {exerciseList.length} total</p>
				</div>
				<a href="/exercises/new" class="btn btn-primary">+ Add Exercise</a>
			</div>
		</div>

		<div class="search-bar">
			<input
				type="text"
				class="input"
				bind:value={filter}
				placeholder="Filter by name or muscle group…"
				id="exercise-filter"
			/>
		</div>

		{#if error}
			<div class="alert alert-error">{error}</div>
		{/if}

		{#if loading}
			<div class="flex items-center gap-4" style="padding: var(--space-16); justify-content: center;">
				<div class="spinner" style="width:40px;height:40px;border-width:4px;"></div>
				<p>Loading exercises…</p>
			</div>
		{:else if filtered.length === 0}
			<div class="empty-state">
				<div class="icon">💪</div>
				<h3>{filter ? 'No matches found' : 'No exercises yet'}</h3>
				<p>{filter ? 'Try a different search term.' : 'Add your first exercise to get started.'}</p>
				{#if !filter}
					<a href="/exercises/new" class="btn btn-primary" style="margin-top: var(--space-4)">Add Exercise</a>
				{/if}
			</div>
		{:else}
			<div class="grid grid-auto gap-4">
				{#each filtered as exercise (exercise.id)}
					<ExerciseCard {exercise} on:delete={(e) => deleteExercise(e.detail)} />
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.search-bar { margin-bottom: var(--space-6); }
</style>
