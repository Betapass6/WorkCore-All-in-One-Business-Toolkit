import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth.service'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      authService.getCurrentUser().then(setUser)
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Temporary mock login
    const mockUser = {
      id: '1',
      name: 'Admin User',
      email: email,
      role: 'admin' as const
    }
    const mockToken = 'mock-jwt-token'
    
    setToken(mockToken)
    setUser(mockUser)
    localStorage.setItem('token', mockToken)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 