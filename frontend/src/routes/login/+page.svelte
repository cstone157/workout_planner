<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { auth, type AuthTokens } from '$lib/api';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleLogin() {
		if (!email || !password) { error = 'Please fill in all fields.'; return; }
		loading = true;
		error = '';
		try {
			const tokens: AuthTokens = await auth.login(email, password);
			authStore.login(tokens.access_token, tokens.refresh_token, tokens.user);
			goto('/');
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Login failed. Check your credentials.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head><title>Login — WorkoutAI</title></svelte:head>

<div class="auth-page">
	<div class="auth-card card fade-in">
		<div class="auth-header">
			<div class="auth-logo">⚡</div>
			<h1>Welcome back</h1>
			<p>Sign in to your WorkoutAI account</p>
		</div>

		<form on:submit|preventDefault={handleLogin} class="auth-form">
			{#if error}
				<div class="alert alert-error">{error}</div>
			{/if}

			<div class="form-group">
				<label for="email">Email address</label>
				<input id="email" type="email" class="input" bind:value={email}
					placeholder="you@example.com" autocomplete="email" required />
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input id="password" type="password" class="input" bind:value={password}
					placeholder="••••••••" autocomplete="current-password" required />
			</div>

			<button type="submit" class="btn btn-primary btn-lg w-full" disabled={loading}>
				{#if loading}
					<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>
					Signing in…
				{:else}
					Sign in
				{/if}
			</button>
		</form>

		<div class="auth-footer">
			Don't have an account? <a href="/register">Create one</a>
		</div>
	</div>
</div>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-6);
		background: var(--color-bg);
	}

	.auth-card {
		width: 100%;
		max-width: 420px;
	}

	.auth-header {
		text-align: center;
		margin-bottom: var(--space-8);
	}

	.auth-logo {
		font-size: 3rem;
		margin-bottom: var(--space-4);
		filter: drop-shadow(0 0 16px hsl(262,90%,65%,0.6));
	}

	.auth-header h1 { margin-bottom: var(--space-2); }
	.auth-header p { color: var(--color-text-muted); }

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.w-full { width: 100%; }

	.auth-footer {
		margin-top: var(--space-6);
		text-align: center;
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}
</style>
