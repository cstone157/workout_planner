<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { authStore, isAuthenticated, currentUser } from '$lib/stores/auth';
	import Navbar from '$lib/components/Navbar.svelte';
	import '../app.css';

	const publicRoutes = ['/login', '/register'];

	onMount(() => {
		authStore.init();
	});

	$: {
		if (typeof window !== 'undefined') {
			const isPublic = publicRoutes.some((r) => $page.url.pathname.startsWith(r));
			if (!$isAuthenticated && !isPublic) {
				goto('/login');
			}
		}
	}
</script>

<div class="bg-glow"></div>

{#if $isAuthenticated}
	<Navbar user={$currentUser} on:logout={() => { authStore.logout(); goto('/login'); }} />
{/if}

<main style="position: relative; z-index: 1;">
	<slot />
</main>
