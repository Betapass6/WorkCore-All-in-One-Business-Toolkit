import { create } from 'zustand'
import productService, { Product, CreateProductData } from '../services/product.service'

interface ProductState {
  products: Product[]
  loading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  addProduct: (product: CreateProductData) => Promise<void>
  updateProduct: (id: string, product: Partial<CreateProductData>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,
  fetchProducts: async () => {
    set({ loading: true, error: null })
    try {
      const products = await productService.getProducts()
      set({ products, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch products', loading: false })
    }
  },
  addProduct: async (product) => {
    set({ loading: true, error: null })
    try {
      const newProduct = await productService.createProduct(product)
      set((state) => ({
        products: [...state.products, newProduct],
        loading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to add product', loading: false })
    }
  },
  updateProduct: async (id, product) => {
    set({ loading: true, error: null })
    try {
      const updatedProduct = await productService.updateProduct(id, product)
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? updatedProduct : p
        ),
        loading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to update product', loading: false })
    }
  },
  deleteProduct: async (id) => {
    set({ loading: true, error: null })
    try {
      await productService.deleteProduct(id)
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        loading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to delete product', loading: false })
    }
  },
})) 