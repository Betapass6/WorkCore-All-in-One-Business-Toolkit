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
    return api.get(`/bookings/${role.toLowerCase()}`)
  }

  async createBooking(data: CreateBookingData) {
    const response = await api.post('/bookings', data)
    return response.data
  }

  async updateBookingStatus(id: string, status: Booking['status']) {
    const response = await api.put(`/bookings/${id}`, { status })
    return response.data
  }

  async getServices() {
    const response = await api.get('/services')
    return response.data
  }

  async checkAvailability(serviceId: string, date: string, time: string) {
    const response = await api.get('/bookings/availability', {
      params: { serviceId, date, time }
    })
    return response.data
  }

  async create(booking: Omit<Booking, 'id'>) {
    const { data } = await api.post<Booking>('/bookings', booking)
    return data
  }

  async updateStatus(id: string, status: Booking['status']) {
    const { data } = await api.put<Booking>(`/bookings/${id}`, { status })
    return data
  }
}

export default new BookingService()