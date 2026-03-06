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
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
	} from "$lib/components/ui/table";
	import { formatDateTime, formatNumber } from "$lib/formatters";
	import { inventoryStore } from "$lib/stores/inventory";

	let searchQuery = $state("");
	let movementFilter = $state<"all" | "add" | "remove">("all");

	const filteredMovements = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		return $inventoryStore.movements.filter((movement) => {
			const filterMatches = movementFilter === "all" || movement.movementType === movementFilter;
			if (!filterMatches) {
				return false;
			}

			if (!query) {
				return true;
			}

			return (
				movement.productName.toLowerCase().includes(query) ||
				movement.productSku.toLowerCase().includes(query) ||
				movement.performedBy.toLowerCase().includes(query)
			);
		});
	});
</script>

<svelte:head>
	<title>Stock History | Inventory App</title>
</svelte:head>

<section class="space-y-6">
	<header class="space-y-1">
		<h2 class="text-2xl font-semibold tracking-tight">Stock History</h2>
		<p class="text-sm text-muted-foreground">
			Audit trail of every stock adjustment, sorted from newest to oldest.
		</p>
	</header>

	<Card>
		<CardHeader class="gap-4">
			<div>
				<CardTitle>Movement Records</CardTitle>
				<CardDescription>Search by product, SKU, or operator.</CardDescription>
			</div>
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Input
					class="sm:max-w-sm"
					placeholder="Search product, SKU, or user..."
					bind:value={searchQuery}
				/>
				<div class="flex gap-2">
					<Button
						size="sm"
						variant={movementFilter === "all" ? "default" : "outline"}
						onclick={() => (movementFilter = "all")}
					>
						All
					</Button>
					<Button
						size="sm"
						variant={movementFilter === "add" ? "secondary" : "outline"}
						onclick={() => (movementFilter = "add")}
					>
						Add
					</Button>
					<Button
						size="sm"
						variant={movementFilter === "remove" ? "destructive" : "outline"}
						onclick={() => (movementFilter = "remove")}
					>
						Remove
					</Button>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Product</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Qty</TableHead>
						<TableHead>Note</TableHead>
						<TableHead>By</TableHead>
						<TableHead class="text-right">Timestamp</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#if filteredMovements.length === 0}
						<TableRow>
							<TableCell colspan={6} class="py-10 text-center text-muted-foreground">
								No movement entries match the current filters.
							</TableCell>
						</TableRow>
					{:else}
						{#each filteredMovements as movement}
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
								<TableCell class="max-w-[240px] truncate text-muted-foreground">
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
