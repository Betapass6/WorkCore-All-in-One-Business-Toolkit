import api from './api'

export interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
}

export const serviceService = {
  async getAll() {
    const { data } = await api.get<Service[]>('/services')
    return data
  },

  async create(service: Omit<Service, 'id'>) {
    const { data } = await api.post<Service>('/services', service)
    return data
  },

  async update(id: string, service: Partial<Service>) {
    const { data } = await api.put<Service>(`/services/${id}`, service)
    return data
  },

  async delete(id: string) {
    await api.delete(`/services/${id}`)
  }
} 