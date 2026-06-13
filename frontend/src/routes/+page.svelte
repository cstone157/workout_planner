<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { exercises, workouts, sessions, type Exercise, type Workout, type Session } from '$lib/api';
	import WorkoutCard from '$lib/components/WorkoutCard.svelte';
	import ExerciseCard from '$lib/components/ExerciseCard.svelte';

	let exerciseList: Exercise[] = [];
	let workoutList: Workout[] = [];
	let sessionList: Session[] = [];
	let loading = true;

	onMount(async () => {
		try {
			[exerciseList, workoutList, sessionList] = await Promise.all([
				exercises.list(),
				workouts.list(),
				sessions.list()
			]);
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	});

	$: recentSessions = sessionList.slice(0, 5);
	$: totalVolume = sessionList.reduce((acc, s) => acc + s.sets.reduce((a, set) => a + (set.reps_done * (set.weight_kg ?? 0)), 0), 0);
</script>

<svelte:head><title>Dashboard — WorkoutAI</title></svelte:head>

<div class="page">
	<div class="container fade-in">
		<div class="page-header">
			<h1>Dashboard</h1>
			<p>Your fitness command center</p>
		</div>

		<!-- Stats Row -->
		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-number">{workoutList.length}</div>
				<div class="stat-label">Workout Plans</div>
			</div>
			<div class="stat-card">
				<div class="stat-number">{exerciseList.length}</div>
				<div class="stat-label">Exercises</div>
			</div>
			<div class="stat-card">
				<div class="stat-number">{sessionList.length}</div>
				<div class="stat-label">Sessions Logged</div>
			</div>
			<div class="stat-card">
				<div class="stat-number">{Math.round(totalVolume).toLocaleString()}</div>
				<div class="stat-label">Total kg Lifted</div>
			</div>
		</div>

		{#if loading}
			<div class="loading-state">
				<div class="spinner" style="width:40px;height:40px;border-width:4px;"></div>
				<p>Loading your data…</p>
			</div>
		{:else}
			<!-- Workout Plans -->
			<section class="section">
				<div class="section-header">
					<h2>Workout Plans</h2>
					<a href="/workouts" class="btn btn-ghost btn-sm">View all →</a>
				</div>

				{#if workoutList.length === 0}
					<div class="empty-state card-flat">
						<div class="icon">🏋️</div>
						<h3>No workouts yet</h3>
						<p>Create your first workout plan to get started.</p>
						<a href="/workouts" class="btn btn-primary" style="margin-top: var(--space-4)">Create Workout</a>
					</div>
				{:else}
					<div class="grid grid-auto gap-4">
						{#each workoutList.slice(0, 3) as workout (workout.id)}
							<WorkoutCard {workout} on:delete={async (e) => {
								await workouts.delete(e.detail);
								workoutList = workoutList.filter(w => w.id !== e.detail);
							}} />
						{/each}
					</div>
				{/if}
			</section>

			<!-- Recent Sessions -->
			<section class="section">
				<div class="section-header">
					<h2>Recent Sessions</h2>
				</div>

				{#if recentSessions.length === 0}
					<div class="empty-state card-flat">
						<div class="icon">📋</div>
						<h3>No sessions logged</h3>
						<p>Start a workout and log your first session.</p>
					</div>
				{:else}
					<div class="card-flat">
						<div class="table-wrapper">
							<table>
								<thead>
									<tr>
										<th>Date</th>
										<th>Workout</th>
										<th>Sets</th>
										<th>Volume</th>
									</tr>
								</thead>
								<tbody>
									{#each recentSessions as session (session.id)}
										<tr>
											<td>{new Date(session.performed_at).toLocaleDateString()}</td>
											<td>{session.workout_name ?? '—'}</td>
											<td>{session.sets.length}</td>
											<td>{session.sets.reduce((a, s) => a + (s.reps_done * (s.weight_kg ?? 0)), 0).toFixed(1)} kg</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}
			</section>

			<!-- Quick Actions -->
			<section class="section">
				<h2>Quick Actions</h2>
				<div class="quick-actions">
					<a href="/exercises/new" class="quick-action card">
						<span class="qa-icon">➕</span>
						<span class="qa-label">Add Exercise</span>
					</a>
					<a href="/workouts" class="quick-action card">
						<span class="qa-icon">📝</span>
						<span class="qa-label">New Workout Plan</span>
					</a>
					<a href="/search" class="quick-action card">
						<span class="qa-icon">✦</span>
						<span class="qa-label">AI Exercise Search</span>
					</a>
				</div>
			</section>
		{/if}
	</div>
</div>

<style>
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-10);
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-16);
		color: var(--color-text-muted);
	}

	.section {
		margin-bottom: var(--space-10);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-5);
	}

	.quick-actions {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--space-4);
	}

	.quick-action {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		text-decoration: none;
		text-align: center;
		padding: var(--space-8) var(--space-4);
		transition: all var(--transition-base);
	}

	.qa-icon {
		font-size: 2rem;
	}

	.qa-label {
		font-weight: 600;
		color: var(--color-text);
		font-size: 0.9375rem;
	}
</style>
