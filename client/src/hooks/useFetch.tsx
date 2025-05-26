import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './useAuth'

interface UseFetchOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
}

export function useFetch<T>({ url, method = 'GET', body, headers = {} }: UseFetchOptions) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios({
          url,
          method,
          data: body,
          headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        })
        setData(response.data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url, method, body, headers, token])

  return { data, error, loading }
}
