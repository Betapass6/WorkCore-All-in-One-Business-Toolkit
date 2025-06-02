import api from './api'

export interface Feedback {
  id: string
  userId: string
  productId?: string
  serviceId?: string
  rating: number
  comment: string
  createdAt: string
  user: {
    id: string
    name: string
  }
}

export interface CreateFeedbackData {
  rating: number
  comment: string
  productId?: string
  serviceId?: string
}

const feedbackService = {
  async getFeedbacks(params?: { 
    productId?: string
    serviceId?: string
    rating?: number
    page?: number
    limit?: number
  }) {
    const response = await api.get('/feedback', { params })
    return response.data
  },

  async createFeedback(data: CreateFeedbackData) {
    const response = await api.post('/feedback', data)
    return response.data
  },

  async getFeedback(id: string) {
    const response = await api.get(`/feedback/${id}`)
    return response.data
  }
}

export default feedbackService 