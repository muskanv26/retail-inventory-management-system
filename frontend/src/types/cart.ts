import type { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  availableStock?: number;
}

export interface CustomerCheckoutDetails {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  warehouseCode: string;
}
