import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './useAuth'

interface UseFetchOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  cacheTime?: number // Cache duration in milliseconds
}

export interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useFetch<T>(options: UseFetchOptions): UseFetchResult<T> {
  const { url, method = 'GET', body, headers = {}, cacheTime = 300000 } = options;
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  const memoizedHeaders = {
    ...headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      // Ensure URL starts with /api
      const apiUrl = url.startsWith('/api') ? url : `/api${url}`
      const response = await api.request({
        url: apiUrl,
        method,
        data: body,
        headers: memoizedHeaders,
      })
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    const fetchWithCache = async () => {
      if (method === 'GET' && cacheTime > 0) {
        const cacheKey = `${method}:${url}`
        const cachedData = sessionStorage.getItem(cacheKey)
        const cachedTimestamp = sessionStorage.getItem(`${cacheKey}:timestamp`)
        if (cachedData && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp)
          if (Date.now() - timestamp < cacheTime) {
            setData(JSON.parse(cachedData))
            setLoading(false)
            return
          }
        }
      }
      await fetchData()
    }
    if (mounted) {
      fetchWithCache()
    }
    return () => {
      mounted = false
    }
  }, [url, method, JSON.stringify(body), JSON.stringify(headers)])

  const refetch = async () => {
    await fetchData()
  }

  return { data, loading, error, refetch }
}
