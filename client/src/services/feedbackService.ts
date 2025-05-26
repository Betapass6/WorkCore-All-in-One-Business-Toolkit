import api from './api'
import { Feedback } from '../types'

export const feedbackService = {
  async getAll() {
    const { data } = await api.get<Feedback[]>('/feedback')
    return data
  },

  async create(feedback: Omit<Feedback, 'id'>) {
    const { data } = await api.post<Feedback>('/feedback', feedback)
    return data
  },

  async getByProduct(productId: string) {
    const { data } = await api.get<Feedback[]>(`/feedback/product/${productId}`)
    return data
  },

  async getByService(serviceId: string) {
    const { data } = await api.get<Feedback[]>(`/feedback/service/${serviceId}`)
    return data
  }
}
