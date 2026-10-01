export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  unitPrice: number;
  brand?: string;
  gender?: string;
  imageUrl?: string;
  secondaryImageUrl?: string;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  sizes?: string;
  colors?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  category: string;
  unitPrice: number;
  active?: boolean;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  category: string;
  unitPrice: number;
  active: boolean;
}
