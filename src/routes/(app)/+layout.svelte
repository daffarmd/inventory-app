<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import { authStore, initializeAuth, logout } from "$lib/stores/auth";
	import { initializeInventory } from "$lib/stores/inventory";
	import { cn } from "$lib/utils";

	let { children } = $props();

	let ready = $state(false);

	const navItems = [
		{ href: "/dashboard", label: "Dashboard" },
		{ href: "/products", label: "Products" },
		{ href: "/stock-history", label: "Stock History" },
	] as const;

	onMount(() => {
		initializeAuth();
		initializeInventory();
		ready = true;
	});

	$effect(() => {
		if (!ready) {
			return;
		}

		if (!$authStore.currentUser) {
			void goto("/login", { replaceState: true });
		}
	});

	function handleLogout() {
		logout();
		void goto("/login");
	}
</script>

{#if !ready || !$authStore.currentUser}
	<div class="flex min-h-screen items-center justify-center bg-muted/20">
		<p class="text-sm text-muted-foreground">Preparing workspace...</p>
	</div>
{:else}
	<div class="min-h-screen bg-[radial-gradient(circle_at_top_left,theme(colors.sky.100/.35),transparent_40%),radial-gradient(circle_at_bottom_right,theme(colors.cyan.100/.3),transparent_35%)]">
		<header class="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
			<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Warehouse</p>
					<h1 class="text-lg font-semibold">Inventory Control</h1>
				</div>
				<div class="flex items-center gap-3">
					<p class="hidden text-sm text-muted-foreground sm:block">{$authStore.currentUser.name}</p>
					<Button variant="outline" size="sm" onclick={handleLogout}>Log out</Button>
				</div>
			</div>
		</header>

		<div class="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[220px_1fr]">
			<aside class="h-fit rounded-lg border border-border/70 bg-card/90 p-3">
				<nav class="flex flex-col gap-1">
					{#each navItems as item}
						<a
							href={item.href}
							class={cn(
								"rounded-md px-3 py-2 text-sm font-medium transition-colors",
								$page.url.pathname === item.href
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-muted hover:text-foreground"
							)}
						>
							{item.label}
						</a>
					{/each}
				</nav>
				<Separator class="my-3" />
				<p class="text-xs leading-relaxed text-muted-foreground">
					Low stock threshold is fixed to <span class="font-semibold text-foreground">10 units</span> for this MVP.
				</p>
			</aside>

			<main class="animate-in fade-in duration-300">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
