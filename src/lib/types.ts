export type MovementType = "add" | "remove";

export interface AppUser {
	id: string;
	name: string;
	email: string;
	password: string;
	createdAt: string;
}

export interface Product {
	id: string;
	name: string;
	sku: string;
	description: string;
	category: string;
	stockQuantity: number;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
}

export interface StockMovement {
	id: string;
	productId: string;
	productName: string;
	productSku: string;
	movementType: MovementType;
	quantity: number;
	note: string;
	performedBy: string;
	createdAt: string;
}
