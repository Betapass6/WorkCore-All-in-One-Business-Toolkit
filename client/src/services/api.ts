import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

console.log('API_URL resolved to:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Response interceptor for handling errors
api.interceptors.response.use((response) => response, (error) => {
  // Only handle 401 errors for non-login routes
  if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Only redirect if we're not already on the login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }
  return Promise.reject(error)
})

export default api
