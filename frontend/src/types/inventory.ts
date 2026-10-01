export interface Inventory {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  warehouseCode: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderLevel: number;
  reorderNeeded: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryRequest {
  productId: string;
  warehouseCode: string;
  quantityOnHand: number;
  quantityReserved?: number;
  reorderLevel?: number;
}

export interface UpdateInventoryRequest {
  quantityOnHand: number;
  quantityReserved: number;
  reorderLevel: number;
}
