import api from './api'
import { Booking } from '../types'

export interface Service {
  id: string
  name: string
  price: number
  duration: number
}

export interface CreateBookingData {
  serviceId: string
  date: string
  time: string
}

class BookingService {
  async getBookings(role: string) {
    return api.get(`/api/bookings/${role.toLowerCase()}`)
  }

  async createBooking(data: CreateBookingData) {
    const response = await api.post('/api/bookings', data)
    return response.data
  }

  async updateBookingStatus(id: string, status: Booking['status']) {
    const response = await api.put(`/api/bookings/${id}`, { status })
    return response.data
  }

  async getServices() {
    const response = await api.get('/api/services')
    return response.data
  }

  async checkAvailability(serviceId: string, date: string, time: string) {
    const response = await api.get('/api/bookings/availability', {
      params: { serviceId, date, time }
    })
    return response.data
  }

  async create(booking: Omit<Booking, 'id'>) {
    const { data } = await api.post<Booking>('/api/bookings', booking)
    return data
  }

  async updateStatus(id: string, status: Booking['status']) {
    const { data } = await api.put<Booking>(`/api/bookings/${id}`, { status })
    return data
  }
}

export default new BookingService()