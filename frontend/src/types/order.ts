export type OrderType = 'PURCHASE' | 'SALES';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItemResponse {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  warehouseCode: string;
  supplierCode: string | null;
  totalAmount: number;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateOrderRequest {
  orderNumber: string;
  type: OrderType;
  warehouseCode: string;
  supplierCode?: string | null;
  items: CreateOrderItemRequest[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
