<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { authStore, logout } from '$lib/auth';
	import { onMount } from 'svelte';

	onMount(() => {
		// Initialize the store from localStorage on the client side
		authStore.init();
	});
</script>

<nav class="glass nav-bar">
	<div class="nav-content">
		<a href="/" class="brand">Workout Planner</a>
		<div class="links">
			{#if $authStore.isAuthenticated}
				<a href="/history" class:active={$page.url.pathname === '/history'}>History</a>
				<button class="btn btn-secondary nav-btn" onclick={logout}>Logout</button>
			{#else}
				<a href="/login" class="btn btn-primary nav-btn">Login</a>
			{/if}
		</div>
	</div>
</nav>

<main>
	{@render children()}
</main>

<style>
	.nav-bar {
		position: sticky;
		top: 0;
		z-index: 100;
		border-radius: 0;
		border-left: none;
		border-right: none;
		border-top: none;
	}

	.nav-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.brand {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-primary);
		text-decoration: none;
		background: linear-gradient(to right, var(--primary), var(--secondary));
		-webkit-background-clip: text;
		color: transparent;
	}

	.links {
		display: flex;
		gap: 1.5rem;
		align-items: center;
	}

	.links a {
		color: var(--text-secondary);
		text-decoration: none;
		font-weight: 500;
		transition: color 0.3s ease;
	}

	.links a:hover, .links a.active {
		color: var(--primary);
	}

	.nav-btn {
		padding: 8px 16px;
		font-size: 0.9rem;
	}

	main {
		min-height: calc(100vh - 70px);
	}
</style>
