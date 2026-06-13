<script lang="ts">
	import { goto } from '$app/navigation';
	import { exercises, type CreateExercise } from '$lib/api';

	const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body', 'Other'];
	const EQUIPMENT = ['Barbell', 'Dumbbell', 'Kettlebell', 'Machine', 'Cable', 'Bodyweight', 'Resistance Band', 'Other'];

	let form: CreateExercise = { name: '', description: '', muscle_group: '', equipment: '' };
	let loading = false;
	let error = '';

	async function handleSubmit() {
		if (!form.name.trim()) { error = 'Exercise name is required.'; return; }
		loading = true;
		error = '';
		try {
			await exercises.create({
				name: form.name.trim(),
				description: form.description?.trim() || undefined,
				muscle_group: form.muscle_group || undefined,
				equipment: form.equipment || undefined
			});
			goto('/exercises');
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to create exercise.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head><title>Add Exercise — WorkoutAI</title></svelte:head>

<div class="page">
	<div class="container fade-in" style="max-width: 640px;">
		<div class="page-header">
			<a href="/exercises" class="back-link">← Back to Exercises</a>
			<h1 style="margin-top: var(--space-3);">Add New Exercise</h1>
			<p>Exercises are embedded for AI-powered similarity search</p>
		</div>

		<div class="card">
			<form on:submit|preventDefault={handleSubmit} class="form">
				{#if error}
					<div class="alert alert-error">{error}</div>
				{/if}

				<div class="form-group">
					<label for="ex-name">Exercise name *</label>
					<input id="ex-name" type="text" class="input" bind:value={form.name}
						placeholder="e.g. Barbell Bench Press" required />
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="ex-muscle">Muscle group</label>
						<select id="ex-muscle" class="input" bind:value={form.muscle_group}>
							<option value="">Select…</option>
							{#each MUSCLE_GROUPS as m}
								<option value={m}>{m}</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label for="ex-equipment">Equipment</label>
						<select id="ex-equipment" class="input" bind:value={form.equipment}>
							<option value="">Select…</option>
							{#each EQUIPMENT as eq}
								<option value={eq}>{eq}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="form-group">
					<label for="ex-desc">Description</label>
					<textarea id="ex-desc" class="input" rows="4" bind:value={form.description}
						placeholder="Describe the exercise, form cues, variations…"></textarea>
					<span class="hint">This text is embedded for semantic search — be descriptive!</span>
				</div>

				<div class="form-actions">
					<a href="/exercises" class="btn btn-secondary">Cancel</a>
					<button type="submit" class="btn btn-primary" disabled={loading}>
						{#if loading}
							<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>
							Saving & Embedding…
						{:else}
							Save Exercise
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>

<style>
	.back-link { color: var(--color-text-muted); font-size: 0.9rem; }
	.back-link:hover { color: var(--color-primary); }
	.form { display: flex; flex-direction: column; gap: var(--space-5); }
	.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
	.form-actions { display: flex; gap: var(--space-3); justify-content: flex-end; padding-top: var(--space-2); }
	.hint { font-size: 0.8rem; color: var(--color-text-faint); }

	@media (max-width: 480px) {
		.form-row { grid-template-columns: 1fr; }
	}
</style>
