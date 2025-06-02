import api from './api'

export interface Service {
  id: string
  name: string
  price: number
  duration: number
}

export interface Booking {
  id: string
  userId: string
  serviceId: string
  date: string
  time: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  service: Service
}

export interface CreateBookingData {
  serviceId: string
  date: string
  time: string
}

const bookingService = {
  async getBookings(params?: { status?: string; page?: number; limit?: number }) {
    const response = await api.get('/bookings', { params })
    return response.data
  },

  async createBooking(data: CreateBookingData) {
    const response = await api.post('/bookings', data)
    return response.data
  },

  async updateBookingStatus(id: string, status: Booking['status']) {
    const response = await api.put(`/bookings/${id}`, { status })
    return response.data
  },

  async getServices() {
    const response = await api.get('/services')
    return response.data
  },

  async checkAvailability(serviceId: string, date: string, time: string) {
    const response = await api.get('/bookings/availability', {
      params: { serviceId, date, time }
    })
    return response.data
  }
}

export default bookingService 