<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { workouts, sessions, type Workout, type CreateSession } from '$lib/api';

	const id = $page.params.id;

	let workout: Workout | null = null;
	let loading = true;
	let error = '';
	let logging = false;
	let logSuccess = false;

	// Session log state
	let sessionSets: Array<{ exercise_id: string; exercise_name: string; set_number: number; reps_done: number; weight_kg: string; }> = [];
	let notes = '';

	onMount(async () => {
		try {
			workout = await workouts.get(id);
			// Pre-populate sets for each exercise
			sessionSets = (workout.exercises ?? []).flatMap(ex =>
				Array.from({ length: ex.sets ?? 3 }, (_, i) => ({
					exercise_id: ex.exercise_id,
					exercise_name: ex.exercise_name,
					set_number: i + 1,
					reps_done: ex.reps ?? 10,
					weight_kg: ''
				}))
			);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to load workout.';
		} finally {
			loading = false;
		}
	});

	async function logSession() {
		if (!workout) return;
		logging = true;
		error = '';
		logSuccess = false;
		try {
			const body: CreateSession = {
				workout_id: workout.id,
				notes: notes.trim() || undefined,
				sets: sessionSets.map(s => ({
					exercise_id: s.exercise_id,
					set_number: s.set_number,
					reps_done: Number(s.reps_done),
					weight_kg: s.weight_kg ? Number(s.weight_kg) : undefined
				}))
			};
			await sessions.create(body);
			logSuccess = true;
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to log session.';
		} finally {
			logging = false;
		}
	}

	$: groupedSets = sessionSets.reduce<Record<string, typeof sessionSets>>((acc, s) => {
		(acc[s.exercise_id] ??= []).push(s);
		return acc;
	}, {});
</script>

<svelte:head>
	<title>{workout?.name ?? 'Workout'} — WorkoutAI</title>
</svelte:head>

<div class="page">
	<div class="container fade-in" style="max-width: 800px;">
		<a href="/workouts" class="back-link">← Back to Workouts</a>

		{#if loading}
			<div class="flex items-center gap-4" style="padding: var(--space-16); justify-content: center;">
				<div class="spinner" style="width:40px;height:40px;border-width:4px;"></div>
			</div>
		{:else if error}
			<div class="alert alert-error" style="margin-top: var(--space-4);">{error}</div>
		{:else if workout}
			<div class="page-header" style="margin-top: var(--space-4);">
				<h1>{workout.name}</h1>
				{#if workout.description}<p>{workout.description}</p>{/if}
			</div>

			<!-- Exercise Overview -->
			<section class="section">
				<h2 style="margin-bottom: var(--space-4);">Exercises</h2>
				<div class="exercise-list">
					{#each workout.exercises as ex}
						<div class="exercise-item card-flat">
							<span class="ex-name">{ex.exercise_name}</span>
							<div class="ex-meta">
								{#if ex.sets}<span class="badge badge-primary">{ex.sets} sets</span>{/if}
								{#if ex.reps}<span class="badge badge-accent">{ex.reps} reps</span>{/if}
								{#if ex.rest_seconds}<span class="badge badge-success">{ex.rest_seconds}s rest</span>{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- Log Session -->
			<section class="section">
				<h2 style="margin-bottom: var(--space-4);">Log Today's Session</h2>

				{#if logSuccess}
					<div class="alert alert-success" style="margin-bottom: var(--space-4);">
						✅ Session logged successfully!
					</div>
				{/if}

				{#if sessionSets.length === 0}
					<p class="empty-hint">No exercises in this workout. <a href="/exercises/new">Add some.</a></p>
				{:else}
					<form on:submit|preventDefault={logSession} class="session-form">
						{#each Object.entries(groupedSets) as [exId, sets]}
							<div class="session-exercise card-flat">
								<h4>{sets[0].exercise_name}</h4>
								<div class="sets-grid">
									<div class="sets-header">
										<span>Set</span>
										<span>Reps</span>
										<span>Weight (kg)</span>
									</div>
									{#each sets as set, i}
										<div class="set-row">
											<span class="set-num">{set.set_number}</span>
											<input type="number" class="input set-input" bind:value={set.reps_done}
												min="0" id="set-{exId}-{i}-reps" />
											<input type="number" class="input set-input" bind:value={set.weight_kg}
												min="0" step="0.5" placeholder="—" id="set-{exId}-{i}-kg" />
										</div>
									{/each}
								</div>
							</div>
						{/each}

						<div class="form-group">
							<label for="session-notes">Session Notes</label>
							<textarea id="session-notes" class="input" rows="3" bind:value={notes}
								placeholder="How did it feel? Any PRs?"></textarea>
						</div>

						<button type="submit" class="btn btn-primary btn-lg" disabled={logging}>
							{logging ? 'Logging…' : '✓ Log Session'}
						</button>
					</form>
				{/if}
			</section>
		{/if}
	</div>
</div>

<style>
	.back-link { color: var(--color-text-muted); font-size: 0.9rem; display: block; margin-top: var(--space-6); }
	.back-link:hover { color: var(--color-primary); }
	.section { margin-bottom: var(--space-10); }
	.exercise-list { display: flex; flex-direction: column; gap: var(--space-3); }
	.exercise-item { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }
	.ex-name { font-weight: 600; color: var(--color-text); }
	.ex-meta { display: flex; gap: var(--space-2); flex-shrink: 0; }
	.session-form { display: flex; flex-direction: column; gap: var(--space-5); }
	.session-exercise { display: flex; flex-direction: column; gap: var(--space-4); }
	.session-exercise h4 { color: var(--color-primary); }
	.sets-grid { display: grid; gap: var(--space-2); }
	.sets-header, .set-row {
		display: grid;
		grid-template-columns: 40px 1fr 1fr;
		align-items: center;
		gap: var(--space-3);
	}
	.sets-header {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-faint);
	}
	.set-num { text-align: center; color: var(--color-text-muted); font-weight: 600; }
	.set-input { padding: var(--space-2) var(--space-3); }
	.empty-hint { color: var(--color-text-muted); }
</style>
