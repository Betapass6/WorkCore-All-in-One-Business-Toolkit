export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  supplier: Supplier;
  feedbacks?: Feedback[];
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface ProductFilters {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
} 