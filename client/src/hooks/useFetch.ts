import { useState, useEffect } from 'react';
import axios from 'axios';

export interface UseFetchOptions {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export function useFetch<T = any>(urlOrOptions: string | UseFetchOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const options: UseFetchOptions = typeof urlOrOptions === 'string' 
          ? { url: urlOrOptions, method: 'GET' }
          : urlOrOptions;

        const response = await axios({
          url: options.url,
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          data: options.body,
        });

        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [urlOrOptions]);

  return { data, loading, error };
} 