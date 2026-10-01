export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  code: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  active?: boolean;
}

export interface UpdateSupplierRequest {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
}
