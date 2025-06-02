import api from './api'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  supplierId: string
  supplier: {
    id: string
    name: string
  }
}

export interface CreateProductData {
  name: string
  description: string
  price: number
  stock: number
  category: string
  supplierId: string
}

const productService = {
  async getProducts(params?: { search?: string; page?: number; limit?: number }) {
    const response = await api.get('/products', { params })
    return response.data
  },

  async getProduct(id: string) {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  async createProduct(data: CreateProductData) {
    const response = await api.post('/products', data)
    return response.data
  },

  async updateProduct(id: string, data: Partial<CreateProductData>) {
    const response = await api.put(`/products/${id}`, data)
    return response.data
  },

  async deleteProduct(id: string) {
    await api.delete(`/products/${id}`)
  },

  async getSuppliers() {
    const response = await api.get('/suppliers')
    return response.data
  }
}

export default productService 