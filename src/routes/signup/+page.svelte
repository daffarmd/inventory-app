<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { Button } from "$lib/components/ui/button";
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { authStore, initializeAuth, signUp } from "$lib/stores/auth";

	let name = $state("");
	let email = $state("");
	let password = $state("");
	let errorMessage = $state("");

	onMount(() => {
		initializeAuth();
		if ($authStore.currentUser) {
			void goto("/dashboard", { replaceState: true });
		}
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = "";

		const result = signUp({ name, email, password });
		if (!result.ok) {
			errorMessage = result.error;
			return;
		}

		void goto("/dashboard");
	}
</script>

<svelte:head>
	<title>Sign Up | Inventory App</title>
</svelte:head>

<main class="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/20 px-4 py-10">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,theme(colors.sky.200/.45),transparent_42%),radial-gradient(circle_at_10%_90%,theme(colors.emerald.200/.35),transparent_40%)]"
	></div>

	<Card class="relative z-10 w-full max-w-md border-border/60 bg-card/95 shadow-lg backdrop-blur animate-in fade-in slide-in-from-bottom-3 duration-500">
		<CardHeader>
			<CardTitle class="text-2xl">Create your account</CardTitle>
			<CardDescription>Start managing your warehouse inventory in one dashboard.</CardDescription>
		</CardHeader>
		<CardContent>
			<form class="space-y-4" onsubmit={handleSubmit}>
				<div class="space-y-2">
					<Label for="name">Full name</Label>
					<Input id="name" placeholder="Your name" bind:value={name} required />
				</div>
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" placeholder="you@company.com" bind:value={email} required />
				</div>
				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input id="password" type="password" placeholder="Minimum 8 characters" bind:value={password} required />
				</div>

				{#if errorMessage}
					<p class="text-sm text-destructive">{errorMessage}</p>
				{/if}

				<Button type="submit" class="w-full">Create account</Button>
			</form>
		</CardContent>
		<CardFooter>
			<p class="text-sm text-muted-foreground">
				Already have an account?
				<a class="font-medium text-primary underline-offset-4 hover:underline" href="/login">Log in</a>
			</p>
		</CardFooter>
	</Card>
</main>
