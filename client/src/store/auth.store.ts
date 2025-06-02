import { create } from 'zustand'
import { AuthResponse } from '../services/auth.service'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'STAFF' | 'USER'
}

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (data: AuthResponse) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (data) => set({ user: data.user, token: data.token }),
  clearAuth: () => set({ user: null, token: null }),
})) 