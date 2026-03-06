<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { authStore, initializeAuth } from "$lib/stores/auth";
	import { initializeInventory } from "$lib/stores/inventory";

	let ready = $state(false);

	onMount(() => {
		initializeAuth();
		initializeInventory();
		ready = true;
	});

	$effect(() => {
		if (!ready) {
			return;
		}

		void goto($authStore.currentUser ? "/dashboard" : "/login", { replaceState: true });
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-muted/30">
	<p class="text-sm text-muted-foreground">Redirecting...</p>
</div>
