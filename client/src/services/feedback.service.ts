import api from './api'

export interface Feedback {
  id: string
  userId: string
  productId?: string
  serviceId?: string
  rating: number
  comment: string
  createdAt: string
}

export const feedbackService = {
  async getAll() {
    const { data } = await api.get<Feedback[]>('/feedback')
    return data
  },

  async create(feedback: Omit<Feedback, 'id' | 'createdAt'>) {
    const { data } = await api.post<Feedback>('/feedback', feedback)
    return data
  },

  async getByProduct(productId: string) {
    const { data } = await api.get<Feedback[]>(`/feedback/product/${productId}`)
    return data
  }
} 