export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  capacity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseRequest {
  code: string;
  name: string;
  location: string;
  capacity: number;
  active?: boolean;
}

export interface UpdateWarehouseRequest {
  name: string;
  location: string;
  capacity: number;
  active: boolean;
}
