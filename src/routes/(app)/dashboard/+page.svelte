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
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
	} from "$lib/components/ui/table";
	import { formatDateTime, formatNumber } from "$lib/formatters";
	import {
		getDashboardMetrics,
		inventoryStore,
		LOW_STOCK_THRESHOLD,
	} from "$lib/stores/inventory";

	const metrics = $derived(getDashboardMetrics($inventoryStore));
	const recentMovements = $derived($inventoryStore.movements.slice(0, 7));
	const lowStockItems = $derived(
		$inventoryStore.products
			.filter(
				(product) => product.stockQuantity > 0 && product.stockQuantity < LOW_STOCK_THRESHOLD
			)
			.slice(0, 5)
	);
</script>

<svelte:head>
	<title>Dashboard | Inventory App</title>
</svelte:head>

<section class="space-y-6">
	<header class="space-y-1">
		<h2 class="text-2xl font-semibold tracking-tight">Dashboard Overview</h2>
		<p class="text-sm text-muted-foreground">
			Track product coverage, stock levels, and latest warehouse activity.
		</p>
	</header>

	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		<Card>
			<CardHeader class="pb-2">
				<CardDescription>Total Products</CardDescription>
				<CardTitle class="text-3xl">{formatNumber(metrics.totalProducts)}</CardTitle>
			</CardHeader>
		</Card>
		<Card>
			<CardHeader class="pb-2">
				<CardDescription>Total Units In Stock</CardDescription>
				<CardTitle class="text-3xl">{formatNumber(metrics.totalUnits)}</CardTitle>
			</CardHeader>
		</Card>
		<Card>
			<CardHeader class="pb-2">
				<CardDescription>Low Stock Items</CardDescription>
				<CardTitle class="text-3xl text-amber-600">{formatNumber(metrics.lowStockCount)}</CardTitle>
			</CardHeader>
		</Card>
		<Card>
			<CardHeader class="pb-2">
				<CardDescription>Out of Stock Items</CardDescription>
				<CardTitle class="text-3xl text-destructive">{formatNumber(metrics.outOfStockCount)}</CardTitle>
			</CardHeader>
		</Card>
	</div>

	<div class="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
		<Card>
			<CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<CardTitle>Recent Stock Activity</CardTitle>
					<CardDescription>Latest stock additions and removals across products.</CardDescription>
				</div>
				<Button size="sm" variant="outline" href="/stock-history">View full history</Button>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Product</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Qty</TableHead>
							<TableHead>By</TableHead>
							<TableHead class="text-right">Time</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#if recentMovements.length === 0}
							<TableRow>
								<TableCell colspan={5} class="py-8 text-center text-muted-foreground">
									No activity yet.
								</TableCell>
							</TableRow>
						{:else}
							{#each recentMovements as movement}
								<TableRow>
									<TableCell class="font-medium">
										<p>{movement.productName}</p>
										<p class="text-xs text-muted-foreground">{movement.productSku}</p>
									</TableCell>
									<TableCell>
										<Badge variant={movement.movementType === "add" ? "secondary" : "destructive"}>
											{movement.movementType === "add" ? "Add" : "Remove"}
										</Badge>
									</TableCell>
									<TableCell>{formatNumber(movement.quantity)}</TableCell>
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

		<div class="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
					<CardDescription>Move faster during daily operations.</CardDescription>
				</CardHeader>
				<CardContent class="flex flex-col gap-2">
					<Button href="/products">Add product</Button>
					<Button href="/products" variant="secondary">Add stock</Button>
					<Button href="/products" variant="outline">Remove stock</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Low-Stock Alert</CardTitle>
					<CardDescription>Products below {LOW_STOCK_THRESHOLD} units.</CardDescription>
				</CardHeader>
				<CardContent class="space-y-2">
					{#if lowStockItems.length === 0}
						<p class="text-sm text-muted-foreground">No low-stock products right now.</p>
					{:else}
						{#each lowStockItems as product}
							<div class="flex items-center justify-between rounded-md border border-border/70 px-3 py-2">
								<div>
									<p class="text-sm font-medium">{product.name}</p>
									<p class="text-xs text-muted-foreground">{product.sku}</p>
								</div>
								<Badge variant="outline">{product.stockQuantity} units</Badge>
							</div>
						{/each}
					{/if}
				</CardContent>
			</Card>
		</div>
	</div>
</section>
