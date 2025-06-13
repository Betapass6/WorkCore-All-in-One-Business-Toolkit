import api from './api';
import { Product, ProductFilters, ProductResponse } from '../types/product';

const API_URL = '/api/products';

class ProductService {
  async getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`${API_URL}?${params.toString()}`);
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'supplier' | 'feedbacks'>): Promise<Product> {
    const response = await api.post(API_URL, data);
    return response.data;
  }

  async updateProduct(id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'supplier' | 'feedbacks'>>): Promise<Product> {
    const response = await api.put(`${API_URL}/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`${API_URL}/${id}`);
  }

  async getCategories(): Promise<string[]> {
    const response = await api.get(`${API_URL}/categories`);
    return response.data;
  }

  async getProductsByRole(role: string) {
    const response = await api.get(`${API_URL}/${role.toLowerCase()}`);
    return response.data;
  }
}

export default new ProductService();