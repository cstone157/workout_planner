<script lang="ts">
	import { onMount } from 'svelte';
	import { workouts, exercises, type Workout, type Exercise, type CreateWorkout } from '$lib/api';
	import WorkoutCard from '$lib/components/WorkoutCard.svelte';

	let workoutList: Workout[] = [];
	let exerciseList: Exercise[] = [];
	let loading = true;
	let error = '';
	let showForm = false;

	let form: CreateWorkout = { name: '', description: '', exercises: [] };
	let saving = false;

	onMount(async () => {
		try {
			[workoutList, exerciseList] = await Promise.all([workouts.list(), exercises.list()]);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to load data.';
		} finally {
			loading = false;
		}
	});

	async function createWorkout() {
		if (!form.name.trim()) { error = 'Workout name is required.'; return; }
		saving = true;
		error = '';
		try {
			const created = await workouts.create(form);
			workoutList = [created, ...workoutList];
			form = { name: '', description: '', exercises: [] };
			showForm = false;
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to create workout.';
		} finally {
			saving = false;
		}
	}

	async function deleteWorkout(id: string) {
		try {
			await workouts.delete(id);
			workoutList = workoutList.filter(w => w.id !== id);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Delete failed.';
		}
	}

	function toggleExercise(exId: string) {
		const exs = form.exercises ?? [];
		if (exs.find(e => e.exercise_id === exId)) {
			form.exercises = exs.filter(e => e.exercise_id !== exId);
		} else {
			form.exercises = [...exs, { exercise_id: exId, sets: 3, reps: 10 }];
		}
	}

	$: selectedIds = new Set((form.exercises ?? []).map(e => e.exercise_id));
</script>

<svelte:head><title>Workouts — WorkoutAI</title></svelte:head>

<div class="page">
	<div class="container fade-in">
		<div class="page-header">
			<div class="flex items-center justify-between">
				<div>
					<h1>Workout Plans</h1>
					<p>{workoutList.length} plan{workoutList.length !== 1 ? 's' : ''}</p>
				</div>
				<button class="btn btn-primary" on:click={() => (showForm = !showForm)}>
					{showForm ? '✕ Cancel' : '+ New Workout'}
				</button>
			</div>
		</div>

		{#if error}
			<div class="alert alert-error" style="margin-bottom: var(--space-5);">{error}</div>
		{/if}

		<!-- Create Form -->
		{#if showForm}
			<div class="card create-form fade-in" style="margin-bottom: var(--space-8);">
				<h3 style="margin-bottom: var(--space-5);">New Workout Plan</h3>
				<form on:submit|preventDefault={createWorkout} class="form">
					<div class="form-group">
						<label for="wk-name">Name *</label>
						<input id="wk-name" type="text" class="input" bind:value={form.name} placeholder="e.g. Push Day A" />
					</div>
					<div class="form-group">
						<label for="wk-desc">Description</label>
						<textarea id="wk-desc" class="input" rows="2" bind:value={form.description} placeholder="Optional notes…"></textarea>
					</div>

					{#if exerciseList.length > 0}
						<div class="form-group">
							<label>Exercises</label>
							<div class="exercise-picker">
								{#each exerciseList as ex}
									<button type="button"
										class="ex-toggle"
										class:selected={selectedIds.has(ex.id)}
										on:click={() => toggleExercise(ex.id)}
									>
										{ex.name}
										{#if ex.muscle_group}<span class="muted">· {ex.muscle_group}</span>{/if}
									</button>
								{/each}
							</div>
						</div>
					{/if}

					<div class="form-actions">
						<button type="submit" class="btn btn-primary" disabled={saving}>
							{saving ? 'Creating…' : 'Create Workout'}
						</button>
					</div>
				</form>
			</div>
		{/if}

		{#if loading}
			<div class="flex items-center gap-4" style="padding: var(--space-16); justify-content: center;">
				<div class="spinner" style="width:40px;height:40px;border-width:4px;"></div>
			</div>
		{:else if workoutList.length === 0}
			<div class="empty-state">
				<div class="icon">🏋️</div>
				<h3>No workout plans yet</h3>
				<p>Create your first plan to start training.</p>
			</div>
		{:else}
			<div class="grid grid-auto gap-4">
				{#each workoutList as workout (workout.id)}
					<WorkoutCard {workout} on:delete={(e) => deleteWorkout(e.detail)} />
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.create-form .form { display: flex; flex-direction: column; gap: var(--space-4); }
	.form-actions { display: flex; justify-content: flex-end; }
	.exercise-picker {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		max-height: 200px;
		overflow-y: auto;
		padding: var(--space-3);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	.ex-toggle {
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		font-size: 0.85rem;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	.ex-toggle:hover { border-color: var(--color-primary); color: var(--color-primary); }
	.ex-toggle.selected {
		background: hsl(262,90%,65%,0.15);
		border-color: var(--color-primary);
		color: var(--color-primary);
	}
	.muted { color: var(--color-text-faint); }
</style>
