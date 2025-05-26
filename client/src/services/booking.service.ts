import api from './api'

export interface Booking {
  id: string
  clientId: string
  serviceId: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

export const bookingService = {
  async getAll() {
    const { data } = await api.get<Booking[]>('/bookings')
    return data
  },

  async create(booking: Omit<Booking, 'id'>) {
    const { data } = await api.post<Booking>('/bookings', booking)
    return data
  },

  async updateStatus(id: string, status: Booking['status']) {
    const { data } = await api.put<Booking>(`/bookings/${id}/status`, { status })
    return data
  }
} 