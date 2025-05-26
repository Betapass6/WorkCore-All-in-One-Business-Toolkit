import api from './api'
import { Booking } from '../types'

export const bookingService = {
  async getAll() {
    const { data } = await api.get<Booking[]>('/booking')
    return data
  },

  async create(booking: Omit<Booking, 'id'>) {
    const { data } = await api.post<Booking>('/booking', booking)
    return data
  },

  async updateStatus(id: string, status: Booking['status']) {
    const { data } = await api.put<Booking>(`/booking/${id}`, { status })
    return data
  }
}
