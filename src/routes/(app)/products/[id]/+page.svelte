<script lang="ts">
	import type { PageData } from "./$types";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
	} from "$lib/components/ui/table";
	import { Textarea } from "$lib/components/ui/textarea";
	import { formatDateTime, formatNumber } from "$lib/formatters";
	import { authStore } from "$lib/stores/auth";
	import { addStock, inventoryStore, LOW_STOCK_THRESHOLD, removeStock } from "$lib/stores/inventory";

	let { data }: { data: PageData } = $props();

	let addQuantity = $state("1");
	let addNote = $state("");
	let addError = $state("");

	let removeQuantity = $state("1");
	let removeNote = $state("");
	let removeError = $state("");

	const product = $derived($inventoryStore.products.find((item) => item.id === data.id) ?? null);
	const movementHistory = $derived(
		$inventoryStore.movements.filter((movement) => movement.productId === data.id)
	);
	const stockStatus = $derived.by(() => {
		if (!product) {
			return "unknown";
		}

		if (product.stockQuantity === 0) {
			return "out";
		}

		if (product.stockQuantity < LOW_STOCK_THRESHOLD) {
			return "low";
		}

		return "healthy";
	});

	function handleAddStock(event: SubmitEvent) {
		event.preventDefault();
		addError = "";

		const result = addStock({
			productId: data.id,
			quantity: Number(addQuantity),
			note: addNote,
			performedBy: $authStore.currentUser?.name ?? "Unknown User",
		});

		if (!result.ok) {
			addError = result.error;
			return;
		}

		addQuantity = "1";
		addNote = "";
	}

	function handleRemoveStock(event: SubmitEvent) {
		event.preventDefault();
		removeError = "";

		const result = removeStock({
			productId: data.id,
			quantity: Number(removeQuantity),
			note: removeNote,
			performedBy: $authStore.currentUser?.name ?? "Unknown User",
		});

		if (!result.ok) {
			removeError = result.error;
			return;
		}

		removeQuantity = "1";
		removeNote = "";
	}
</script>

<svelte:head>
	<title>Product Detail | Inventory App</title>
</svelte:head>

{#if !product}
	<Card>
		<CardHeader>
			<CardTitle>Product not found</CardTitle>
			<CardDescription>The product may have been removed from local data.</CardDescription>
		</CardHeader>
		<CardContent>
			<Button href="/products" variant="outline">Back to products</Button>
		</CardContent>
	</Card>
{:else}
	<section class="space-y-6">
		<header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div class="space-y-1">
				<p class="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Product detail</p>
				<h2 class="text-2xl font-semibold tracking-tight">{product.name}</h2>
				<p class="text-sm text-muted-foreground">{product.sku}</p>
			</div>
			<Button href="/products" variant="outline">Back to products</Button>
		</header>

		<div class="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
			<Card>
				<CardHeader>
					<CardTitle>Current Snapshot</CardTitle>
					<CardDescription>Stock level and metadata for this SKU.</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid gap-4 sm:grid-cols-3">
						<div class="rounded-lg border border-border/70 p-3">
							<p class="text-xs uppercase tracking-wide text-muted-foreground">Current stock</p>
							<p class="mt-2 text-2xl font-semibold">{formatNumber(product.stockQuantity)}</p>
						</div>
						<div class="rounded-lg border border-border/70 p-3">
							<p class="text-xs uppercase tracking-wide text-muted-foreground">Category</p>
							<p class="mt-2 font-medium">{product.category || "Uncategorized"}</p>
						</div>
						<div class="rounded-lg border border-border/70 p-3">
							<p class="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
							<div class="mt-2">
								{#if stockStatus === "healthy"}
									<Badge variant="secondary">Healthy</Badge>
								{:else if stockStatus === "low"}
									<Badge variant="outline">Low stock</Badge>
								{:else}
									<Badge variant="destructive">Out of stock</Badge>
								{/if}
							</div>
						</div>
					</div>

					{#if product.description}
						<div class="rounded-md border border-border/70 p-3">
							<p class="text-xs uppercase tracking-wide text-muted-foreground">Description</p>
							<p class="mt-2 text-sm">{product.description}</p>
						</div>
					{/if}
				</CardContent>
			</Card>

			<div class="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Add Stock</CardTitle>
						<CardDescription>Increase product quantity.</CardDescription>
					</CardHeader>
					<CardContent>
						<form class="space-y-3" onsubmit={handleAddStock}>
							<div class="space-y-2">
								<Label for="add-qty">Quantity</Label>
								<Input id="add-qty" type="number" min={1} step={1} bind:value={addQuantity} required />
							</div>
							<div class="space-y-2">
								<Label for="add-note">Note</Label>
								<Textarea id="add-note" rows={2} placeholder="Optional note..." bind:value={addNote} />
							</div>
							{#if addError}
								<p class="text-sm text-destructive">{addError}</p>
							{/if}
							<Button type="submit" class="w-full">Add stock</Button>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Remove Stock</CardTitle>
						<CardDescription>Decrease quantity. Negative stock is blocked.</CardDescription>
					</CardHeader>
					<CardContent>
						<form class="space-y-3" onsubmit={handleRemoveStock}>
							<div class="space-y-2">
								<Label for="remove-qty">Quantity</Label>
								<Input id="remove-qty" type="number" min={1} step={1} bind:value={removeQuantity} required />
							</div>
							<div class="space-y-2">
								<Label for="remove-note">Note</Label>
								<Textarea
									id="remove-note"
									rows={2}
									placeholder="Reason for removal..."
									bind:value={removeNote}
								/>
							</div>
							{#if removeError}
								<p class="text-sm text-destructive">{removeError}</p>
							{/if}
							<Button type="submit" variant="destructive" class="w-full">Remove stock</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>

		<Card>
			<CardHeader>
				<CardTitle>Stock Movement History</CardTitle>
				<CardDescription>Newest records appear first.</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Type</TableHead>
							<TableHead>Qty</TableHead>
							<TableHead>Note</TableHead>
							<TableHead>Performed by</TableHead>
							<TableHead class="text-right">Time</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#if movementHistory.length === 0}
							<TableRow>
								<TableCell colspan={5} class="py-8 text-center text-muted-foreground">
									No movement records yet.
								</TableCell>
							</TableRow>
						{:else}
							{#each movementHistory as movement}
								<TableRow>
									<TableCell>
										<Badge variant={movement.movementType === "add" ? "secondary" : "destructive"}>
											{movement.movementType === "add" ? "Add" : "Remove"}
										</Badge>
									</TableCell>
									<TableCell>{formatNumber(movement.quantity)}</TableCell>
									<TableCell class="max-w-[280px] truncate text-muted-foreground">
										{movement.note || "-"}
									</TableCell>
									<TableCell>{movement.performedBy}</TableCell>
									<TableCell class="text-right text-xs text-muted-foreground">
										{formatDateTime(movement.createdAt)}
									</TableCell>
								</TableRow>
							{/each}
						{/if}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	</section>
{/if}
