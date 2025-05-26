import { User, LoginCredentials, RegisterCredentials } from '../types'
import api from './api'

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  async register(credentials: RegisterCredentials): Promise<void> {
    await api.post('/auth/register', credentials)
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me')
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  }
} 