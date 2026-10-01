export type StockMovementType =
  | 'INBOUND'
  | 'OUTBOUND'
  | 'ADJUSTMENT'
  | 'TRANSFER'
  | 'RESERVED'
  | 'RELEASED';

export interface StockMovementResponse {
  id: string;
  inventoryId: string;
  productId: string;
  productSku: string;
  productName: string;
  warehouseCode: string;
  type: StockMovementType;
  quantity: number;
  referenceNumber: string;
  reason: string;
  timestamp: string;
}

export interface StockAdjustmentRequest {
  productId: string;
  warehouseCode: string;
  quantityAdjustment: number;
  reason?: string;
}
