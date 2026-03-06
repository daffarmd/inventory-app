<script lang="ts">
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
	import { createProduct, inventoryStore, LOW_STOCK_THRESHOLD } from "$lib/stores/inventory";
	import type { Product } from "$lib/types";

	let searchQuery = $state("");
	let name = $state("");
	let sku = $state("");
	let description = $state("");
	let category = $state("");
	let initialStock = $state("0");
	let errorMessage = $state("");
	let successMessage = $state("");

	const filteredProducts = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) {
			return $inventoryStore.products;
		}

		return $inventoryStore.products.filter(
			(product) =>
				product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query)
		);
	});

	function getStatus(product: Product) {
		if (product.stockQuantity === 0) {
			return { label: "Out of stock", variant: "destructive" as const };
		}

		if (product.stockQuantity < LOW_STOCK_THRESHOLD) {
			return { label: "Low stock", variant: "outline" as const };
		}

		return { label: "Healthy", variant: "secondary" as const };
	}

	function handleCreateProduct(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = "";
		successMessage = "";

		const result = createProduct({
			name,
			sku,
			description,
			category,
			initialStock: Number(initialStock),
			performedBy: $authStore.currentUser?.name ?? "Unknown User",
		});

		if (!result.ok) {
			errorMessage = result.error;
			return;
		}

		successMessage = `Product ${result.data?.name ?? ""} created successfully.`;
		name = "";
		sku = "";
		description = "";
		category = "";
		initialStock = "0";
	}
</script>

<svelte:head>
	<title>Products | Inventory App</title>
</svelte:head>

<section class="space-y-6">
	<header class="space-y-1">
		<h2 class="text-2xl font-semibold tracking-tight">Products</h2>
		<p class="text-sm text-muted-foreground">Create products, search by SKU, and check stock status.</p>
	</header>

	<div class="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
		<Card>
			<CardHeader>
				<CardTitle>Add Product</CardTitle>
				<CardDescription>
					Name and SKU are required. SKU must remain unique across the inventory.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form class="space-y-4" onsubmit={handleCreateProduct}>
					<div class="space-y-2">
						<Label for="name">Product name</Label>
						<Input id="name" bind:value={name} placeholder="Example: Corrugated Box M" required />
					</div>
					<div class="space-y-2">
						<Label for="sku">SKU</Label>
						<Input id="sku" bind:value={sku} placeholder="Example: CB-M-010" required />
					</div>
					<div class="space-y-2">
						<Label for="category">Category</Label>
						<Input id="category" bind:value={category} placeholder="Packaging" />
					</div>
					<div class="space-y-2">
						<Label for="stock">Initial stock</Label>
						<Input id="stock" bind:value={initialStock} type="number" min={0} step={1} />
					</div>
					<div class="space-y-2">
						<Label for="description">Description</Label>
						<Textarea id="description" bind:value={description} rows={3} placeholder="Optional details..." />
					</div>

					{#if errorMessage}
						<p class="text-sm text-destructive">{errorMessage}</p>
					{/if}
					{#if successMessage}
						<p class="text-sm text-emerald-600">{successMessage}</p>
					{/if}

					<Button type="submit" class="w-full">Create product</Button>
				</form>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="gap-3">
				<div class="space-y-1">
					<CardTitle>Inventory List</CardTitle>
					<CardDescription>Search products by name or SKU.</CardDescription>
				</div>
				<Input
					placeholder="Search by name or SKU..."
					bind:value={searchQuery}
					class="max-w-sm bg-background"
				/>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Product</TableHead>
							<TableHead>SKU</TableHead>
							<TableHead>Stock</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Updated</TableHead>
							<TableHead class="text-right">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#if filteredProducts.length === 0}
							<TableRow>
								<TableCell colspan={6} class="py-10 text-center text-muted-foreground">
									No products found.
								</TableCell>
							</TableRow>
						{:else}
							{#each filteredProducts as product}
								{@const status = getStatus(product)}
								<TableRow>
									<TableCell class="font-medium">
										<p>{product.name}</p>
										{#if product.category}
											<p class="text-xs text-muted-foreground">{product.category}</p>
										{/if}
									</TableCell>
									<TableCell>{product.sku}</TableCell>
									<TableCell>{formatNumber(product.stockQuantity)}</TableCell>
									<TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
									<TableCell class="text-xs text-muted-foreground">
										{formatDateTime(product.updatedAt)}
									</TableCell>
									<TableCell class="text-right">
										<Button size="sm" variant="outline" href={`/products/${product.id}`}>Open</Button>
									</TableCell>
								</TableRow>
							{/each}
						{/if}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	</div>
</section>
