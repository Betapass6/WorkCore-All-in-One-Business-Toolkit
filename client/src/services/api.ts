import axios from 'axios'

const API_URL = '/api'

console.log('API_URL resolved to:', API_URL);

// Create a cache object
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Request interceptor for adding auth token and caching
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Only cache GET requests
  if (config.method === 'get') {
    const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`
    const cachedData = cache.get(cacheKey)
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      // Return cached data
      return Promise.reject({
        __CACHE_HIT__: true,
        data: cachedData.data
      })
    }
  }
  
  return config
}, (error) => {
  return Promise.reject(error)
})

// Response interceptor for handling errors and caching
api.interceptors.response.use((response) => {
  // Cache successful GET responses
  if (response.config.method === 'get') {
    const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    })
  }
  return response
}, (error) => {
  // Handle cache hits
  if (error.__CACHE_HIT__) {
    return Promise.resolve({ data: error.data })
  }

  // Handle rate limiting
  if (error.response?.status === 429) {
    console.warn('Rate limit exceeded, retrying after delay...')
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(api(error.config))
      }, 1000) // Wait 1 second before retrying
    })
  }

  // Handle 401 errors
  if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }

  return Promise.reject(error)
})

export default api
