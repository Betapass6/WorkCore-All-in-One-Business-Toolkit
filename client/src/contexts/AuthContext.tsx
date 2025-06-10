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
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  isAdmin: boolean
  isStaff: boolean
  token: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
    } catch (error) {
      setUser(null)
      setToken(null);
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const userData = await authService.login(email, password)
    setUser(userData)
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setToken(null);
  }

  const isAdmin = user?.role === 'ADMIN'
  const isStaff = user?.role === 'STAFF'

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
        isAdmin,
        isStaff,
        token,
      }}
    >
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