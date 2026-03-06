import { browser } from "$app/environment";
import { get, writable } from "svelte/store";
import type { MovementType, Product, StockMovement } from "$lib/types";

interface InventoryState {
	initialized: boolean;
	products: Product[];
	movements: StockMovement[];
}

interface InventorySnapshot {
	products: Product[];
	movements: StockMovement[];
}

export interface DashboardMetrics {
	totalProducts: number;
	totalUnits: number;
	lowStockCount: number;
	outOfStockCount: number;
}

type InventoryMutationResult<T = undefined> =
	| { ok: true; data?: T }
	| { ok: false; error: string };

const INVENTORY_STORAGE_KEY = "inventory.data.v1";
export const LOW_STOCK_THRESHOLD = 10;

const seedProducts: Product[] = [
	{
		id: "product-1",
		name: "Industrial Tape Roll",
		sku: "ITR-1001",
		description: "Heavy-duty tape for package sealing.",
		category: "Packaging",
		stockQuantity: 52,
		createdAt: "2026-03-01T09:00:00.000Z",
		updatedAt: "2026-03-05T08:15:00.000Z",
		createdBy: "Demo Admin",
	},
	{
		id: "product-2",
		name: "Bubble Wrap Sheet Pack",
		sku: "BWS-2205",
		description: "Protective wrap sheets for fragile items.",
		category: "Packaging",
		stockQuantity: 8,
		createdAt: "2026-03-01T09:30:00.000Z",
		updatedAt: "2026-03-05T12:45:00.000Z",
		createdBy: "Demo Admin",
	},
	{
		id: "product-3",
		name: "Label Sticker 4x6",
		sku: "LS-4600",
		description: "Thermal label stickers for shipment labels.",
		category: "Labels",
		stockQuantity: 0,
		createdAt: "2026-03-01T10:00:00.000Z",
		updatedAt: "2026-03-04T10:00:00.000Z",
		createdBy: "Demo Admin",
	},
];

const seedMovements: StockMovement[] = [
	{
		id: "movement-5",
		productId: "product-2",
		productName: "Bubble Wrap Sheet Pack",
		productSku: "BWS-2205",
		movementType: "remove",
		quantity: 4,
		note: "Daily fulfillment",
		performedBy: "Demo Admin",
		createdAt: "2026-03-05T12:45:00.000Z",
	},
	{
		id: "movement-4",
		productId: "product-1",
		productName: "Industrial Tape Roll",
		productSku: "ITR-1001",
		movementType: "add",
		quantity: 20,
		note: "Supplier restock",
		performedBy: "Demo Admin",
		createdAt: "2026-03-05T08:15:00.000Z",
	},
	{
		id: "movement-3",
		productId: "product-3",
		productName: "Label Sticker 4x6",
		productSku: "LS-4600",
		movementType: "remove",
		quantity: 12,
		note: "Dispatch run",
		performedBy: "Demo Admin",
		createdAt: "2026-03-04T10:00:00.000Z",
	},
	{
		id: "movement-2",
		productId: "product-2",
		productName: "Bubble Wrap Sheet Pack",
		productSku: "BWS-2205",
		movementType: "add",
		quantity: 12,
		note: "Initial stock",
		performedBy: "Demo Admin",
		createdAt: "2026-03-01T09:30:00.000Z",
	},
	{
		id: "movement-1",
		productId: "product-1",
		productName: "Industrial Tape Roll",
		productSku: "ITR-1001",
		movementType: "add",
		quantity: 32,
		note: "Initial stock",
		performedBy: "Demo Admin",
		createdAt: "2026-03-01T09:00:00.000Z",
	},
];

const initialState: InventoryState = {
	initialized: false,
	products: [],
	movements: [],
};

let hasInitialized = false;

export const inventoryStore = writable<InventoryState>(initialState);

function createId() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readSnapshot(): InventorySnapshot | null {
	if (!browser) {
		return null;
	}

	const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
	if (!raw) {
		return null;
	}

	try {
		const parsed = JSON.parse(raw) as Partial<InventorySnapshot>;
		if (!Array.isArray(parsed.products) || !Array.isArray(parsed.movements)) {
			return null;
		}

		return {
			products: parsed.products,
			movements: parsed.movements,
		};
	} catch {
		return null;
	}
}

function persistState(state: InventoryState) {
	if (!browser) {
		return;
	}

	const snapshot: InventorySnapshot = {
		products: state.products,
		movements: state.movements,
	};

	localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(snapshot));
}

function setAndPersist(state: InventoryState) {
	inventoryStore.set(state);
	persistState(state);
}

function createMovement(payload: {
	product: Product;
	movementType: MovementType;
	quantity: number;
	note?: string;
	performedBy: string;
}): StockMovement {
	return {
		id: createId(),
		productId: payload.product.id,
		productName: payload.product.name,
		productSku: payload.product.sku,
		movementType: payload.movementType,
		quantity: payload.quantity,
		note: payload.note?.trim() ?? "",
		performedBy: payload.performedBy,
		createdAt: new Date().toISOString(),
	};
}

export function initializeInventory() {
	if (hasInitialized) {
		return;
	}

	hasInitialized = true;

	const snapshot = readSnapshot();
	if (!snapshot) {
		setAndPersist({
			initialized: true,
			products: seedProducts,
			movements: seedMovements,
		});
		return;
	}

	setAndPersist({
		initialized: true,
		products: snapshot.products,
		movements: snapshot.movements,
	});
}

export function createProduct(payload: {
	name: string;
	sku: string;
	description?: string;
	category?: string;
	initialStock?: number;
	performedBy: string;
}): InventoryMutationResult<Product> {
	const name = payload.name.trim();
	const normalizedSku = payload.sku.trim().toUpperCase();
	const description = payload.description?.trim() ?? "";
	const category = payload.category?.trim() ?? "";
	const initialStock = Number.isFinite(payload.initialStock) ? Number(payload.initialStock) : 0;

	if (!name || !normalizedSku) {
		return { ok: false, error: "Product name and SKU are required." };
	}

	if (!Number.isInteger(initialStock) || initialStock < 0) {
		return { ok: false, error: "Initial stock must be a positive integer or zero." };
	}

	const state = get(inventoryStore);
	if (state.products.some((product) => product.sku.toLowerCase() === normalizedSku.toLowerCase())) {
		return { ok: false, error: "SKU already exists. Please use a unique SKU." };
	}

	const now = new Date().toISOString();
	const nextProduct: Product = {
		id: createId(),
		name,
		sku: normalizedSku,
		description,
		category,
		stockQuantity: initialStock,
		createdAt: now,
		updatedAt: now,
		createdBy: payload.performedBy,
	};

	const movements = [...state.movements];
	if (initialStock > 0) {
		movements.unshift(
			createMovement({
				product: nextProduct,
				movementType: "add",
				quantity: initialStock,
				note: "Initial stock",
				performedBy: payload.performedBy,
			})
		);
	}

	setAndPersist({
		initialized: true,
		products: [nextProduct, ...state.products],
		movements,
	});

	return { ok: true, data: nextProduct };
}

export function addStock(payload: {
	productId: string;
	quantity: number;
	note?: string;
	performedBy: string;
}): InventoryMutationResult {
	const quantity = Number(payload.quantity);
	if (!Number.isInteger(quantity) || quantity <= 0) {
		return { ok: false, error: "Quantity must be a positive integer." };
	}

	const state = get(inventoryStore);
	const product = state.products.find((item) => item.id === payload.productId);
	if (!product) {
		return { ok: false, error: "Product not found." };
	}

	const updatedProduct: Product = {
		...product,
		stockQuantity: product.stockQuantity + quantity,
		updatedAt: new Date().toISOString(),
	};

	const updatedProducts = state.products.map((item) =>
		item.id === payload.productId ? updatedProduct : item
	);

	const movement = createMovement({
		product: updatedProduct,
		movementType: "add",
		quantity,
		note: payload.note,
		performedBy: payload.performedBy,
	});

	setAndPersist({
		initialized: true,
		products: updatedProducts,
		movements: [movement, ...state.movements],
	});

	return { ok: true };
}

export function removeStock(payload: {
	productId: string;
	quantity: number;
	note?: string;
	performedBy: string;
}): InventoryMutationResult {
	const quantity = Number(payload.quantity);
	if (!Number.isInteger(quantity) || quantity <= 0) {
		return { ok: false, error: "Quantity must be a positive integer." };
	}

	const state = get(inventoryStore);
	const product = state.products.find((item) => item.id === payload.productId);
	if (!product) {
		return { ok: false, error: "Product not found." };
	}

	if (product.stockQuantity < quantity) {
		return { ok: false, error: "Insufficient stock for this removal." };
	}

	const updatedProduct: Product = {
		...product,
		stockQuantity: product.stockQuantity - quantity,
		updatedAt: new Date().toISOString(),
	};

	const updatedProducts = state.products.map((item) =>
		item.id === payload.productId ? updatedProduct : item
	);

	const movement = createMovement({
		product: updatedProduct,
		movementType: "remove",
		quantity,
		note: payload.note,
		performedBy: payload.performedBy,
	});

	setAndPersist({
		initialized: true,
		products: updatedProducts,
		movements: [movement, ...state.movements],
	});

	return { ok: true };
}

export function getDashboardMetrics(state: InventoryState): DashboardMetrics {
	const totalProducts = state.products.length;
	const totalUnits = state.products.reduce((total, product) => total + product.stockQuantity, 0);
	const lowStockCount = state.products.filter(
		(product) => product.stockQuantity > 0 && product.stockQuantity < LOW_STOCK_THRESHOLD
	).length;
	const outOfStockCount = state.products.filter((product) => product.stockQuantity === 0).length;

	return {
		totalProducts,
		totalUnits,
		lowStockCount,
		outOfStockCount,
	};
}
