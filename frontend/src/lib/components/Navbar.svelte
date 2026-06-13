<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { page } from '$app/stores';
	import type { User } from '$lib/api';

	export let user: User | null = null;

	const dispatch = createEventDispatcher();

	const links = [
		{ href: '/', label: 'Dashboard', icon: '⊞' },
		{ href: '/workouts', label: 'Workouts', icon: '🏋️' },
		{ href: '/exercises', label: 'Exercises', icon: '💪' },
		{ href: '/search', label: 'AI Search', icon: '✦' }
	];

	let menuOpen = false;
</script>

<nav class="navbar">
	<div class="navbar-inner container">
		<a href="/" class="logo">
			<span class="logo-icon">⚡</span>
			<span class="logo-text">WorkoutAI</span>
		</a>

		<div class="nav-links" class:open={menuOpen}>
			{#each links as link}
				<a
					href={link.href}
					class="nav-link"
					class:active={$page.url.pathname === link.href}
					on:click={() => (menuOpen = false)}
				>
					<span class="nav-icon">{link.icon}</span>
					{link.label}
				</a>
			{/each}
		</div>

		<div class="nav-right">
			{#if user}
				<span class="user-display">{user.display_name || user.email}</span>
			{/if}
			<button class="btn btn-ghost btn-sm" on:click={() => dispatch('logout')}>
				Logout
			</button>
			<button class="hamburger" on:click={() => (menuOpen = !menuOpen)} aria-label="Menu">
				<span></span><span></span><span></span>
			</button>
		</div>
	</div>
</nav>

<style>
	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		height: 64px;
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		border-bottom: 1px solid var(--glass-border);
	}

	.navbar-inner {
		display: flex;
		align-items: center;
		height: 100%;
		gap: var(--space-6);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		text-decoration: none;
		flex-shrink: 0;
	}

	.logo-icon {
		font-size: 1.5rem;
		filter: drop-shadow(0 0 8px hsl(262, 90%, 65%, 0.7));
	}

	.logo-text {
		font-size: 1.125rem;
		font-weight: 800;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: -0.02em;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex: 1;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text-muted);
		text-decoration: none;
		transition: all var(--transition-fast);
	}

	.nav-link:hover {
		background: var(--color-surface);
		color: var(--color-text);
	}

	.nav-link.active {
		background: hsl(262, 90%, 65%, 0.12);
		color: var(--color-primary);
	}

	.nav-icon { font-size: 1rem; }

	.nav-right {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-left: auto;
	}

	.user-display {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		max-width: 160px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.hamburger {
		display: none;
		flex-direction: column;
		gap: 5px;
		padding: var(--space-2);
		background: none;
		border: none;
		cursor: pointer;
	}

	.hamburger span {
		display: block;
		width: 22px;
		height: 2px;
		background: var(--color-text-muted);
		border-radius: 2px;
		transition: all var(--transition-fast);
	}

	@media (max-width: 768px) {
		.hamburger { display: flex; }

		.nav-links {
			display: none;
			position: absolute;
			top: 64px;
			left: 0;
			right: 0;
			background: var(--color-bg-2);
			border-bottom: 1px solid var(--color-border);
			padding: var(--space-4);
			flex-direction: column;
			align-items: stretch;
		}

		.nav-links.open { display: flex; }

		.user-display { display: none; }
	}
</style>
