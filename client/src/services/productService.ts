import api from './api'
import { Product } from '../types'

export const productService = {
  async getAll() {
    const { data } = await api.get<Product[]>('/products')
    return data
  },

  async create(product: Omit<Product, 'id'>) {
    const { data } = await api.post<Product>('/products', product)
    return data
  },

  async update(id: string, product: Partial<Product>) {
    const { data } = await api.put<Product>(`/products/${id}`, product)
    return data
  },

  async delete(id: string) {
    await api.delete(`/products/${id}`)
  }
}
