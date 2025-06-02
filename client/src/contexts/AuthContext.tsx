import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/auth.service'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'STAFF' | 'USER'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isStaff: boolean
  login: (data: { email: string; password: string }) => Promise<void>
  logout: () => void
  loading: boolean
  token: string | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser())
  const [token, setToken] = useState<string | null>(authService.getToken())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // No need to fetch user/token here, it's initialized from localStorage
    // This effect can be used for other side effects if needed
  }, [])

  const login = async (data: { email: string; password: string }) => {
    const response = await authService.login(data)
    setUser(response.user)
    setToken(response.token)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setToken(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isStaff: user?.role === 'STAFF',
    login,
    logout,
    loading,
    token,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 