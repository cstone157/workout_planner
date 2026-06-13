<script lang="ts">
	import { search, type SearchResult } from '$lib/api';

	let query = '';
	let results: SearchResult[] = [];
	let loading = false;
	let error = '';
	let searched = false;

	async function handleSearch() {
		if (!query.trim()) return;
		loading = true;
		error = '';
		results = [];
		searched = false;
		try {
			results = await search.semantic(query.trim());
			searched = true;
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Search failed.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head><title>AI Search — WorkoutAI</title></svelte:head>

<div class="page">
	<div class="container fade-in" style="max-width: 800px;">
		<div class="page-header">
			<h1><span class="gradient-text">✦ AI Search</span></h1>
			<p>Find exercises using natural language — powered by semantic embeddings</p>
		</div>

		<form class="search-form" on:submit|preventDefault={handleSearch}>
			<div class="search-input-wrap">
				<span class="search-icon">✦</span>
				<input
					id="semantic-search-input"
					type="text"
					class="input search-input"
					bind:value={query}
					placeholder="e.g. 'compound chest exercises with free weights' or 'low impact cardio'"
					autocomplete="off"
				/>
			</div>
			<button type="submit" class="btn btn-primary btn-lg" disabled={loading || !query.trim()}>
				{#if loading}
					<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>
					Searching…
				{:else}
					Search
				{/if}
			</button>
		</form>

		{#if error}
			<div class="alert alert-error">{error}</div>
		{/if}

		{#if searched && results.length === 0}
			<div class="empty-state">
				<div class="icon">🔍</div>
				<h3>No results found</h3>
				<p>Try a different query, or <a href="/exercises/new">add more exercises</a> to your library.</p>
			</div>
		{:else if results.length > 0}
			<div class="results-header">
				<h2>Results <span class="count">({results.length})</span></h2>
			</div>

			<div class="results-list">
				{#each results as result, i (result.id)}
					<div class="result-card card fade-in" style="animation-delay: {i * 50}ms">
						<div class="result-header">
							<div>
								<h3>{result.name}</h3>
								{#if result.description}
									<p class="description">{result.description}</p>
								{/if}
							</div>
							<div class="result-meta">
								<div class="similarity-score" title="Similarity score">
									<div class="score-bar">
										<div class="score-fill" style="width: {(result.similarity_score * 100).toFixed(0)}%"></div>
									</div>
									<span class="score-label">{(result.similarity_score * 100).toFixed(0)}%</span>
								</div>
							</div>
						</div>
						<div class="result-badges">
							{#if result.muscle_group}
								<span class="badge badge-primary">{result.muscle_group}</span>
							{/if}
							{#if result.equipment}
								<span class="badge badge-accent">{result.equipment}</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else if !loading}
			<div class="hint-examples">
				<h3>Try searching for…</h3>
				<div class="examples">
					{#each [
						'compound push exercises',
						'exercises for building back thickness',
						'low impact knee-friendly cardio',
						'upper chest isolation',
						'exercises similar to deadlift',
						'shoulder stability movements'
					] as example}
						<button class="example-chip" on:click={() => { query = example; handleSearch(); }}>
							{example}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.search-form {
		display: flex;
		gap: var(--space-3);
		margin-bottom: var(--space-8);
	}

	.search-input-wrap {
		position: relative;
		flex: 1;
	}

	.search-icon {
		position: absolute;
		left: var(--space-4);
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-primary);
		font-size: 1.1rem;
		pointer-events: none;
	}

	.search-input {
		padding-left: calc(var(--space-4) * 2 + 1.1rem);
		font-size: 1rem;
	}

	.results-header {
		margin-bottom: var(--space-5);
	}

	.count { color: var(--color-text-faint); font-weight: 400; }

	.results-list { display: flex; flex-direction: column; gap: var(--space-4); }

	.result-card { cursor: default; }

	.result-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-4);
		margin-bottom: var(--space-3);
	}

	.result-meta { flex-shrink: 0; }

	.similarity-score {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.score-bar {
		width: 80px;
		height: 6px;
		background: var(--color-surface-2);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.score-fill {
		height: 100%;
		background: var(--gradient-primary);
		border-radius: var(--radius-full);
		transition: width var(--transition-slow);
	}

	.score-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-primary);
		min-width: 35px;
	}

	.description {
		font-size: 0.875rem;
		margin-top: var(--space-1);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.result-badges { display: flex; gap: var(--space-2); }

	.hint-examples { padding: var(--space-8) 0; }
	.hint-examples h3 { margin-bottom: var(--space-4); color: var(--color-text-muted); font-weight: 500; }
	.examples { display: flex; flex-wrap: wrap; gap: var(--space-2); }
	.example-chip {
		padding: var(--space-2) var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	.example-chip:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
		background: hsl(262,90%,65%,0.08);
	}

	@media (max-width: 600px) {
		.search-form { flex-direction: column; }
	}
</style>
