import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

export const useLocalStorageWithSubscription = <T>(key: string) => {
  const queryClient = useQueryClient();

  const setValue = useCallback((value: null | string) => {
    queryClient.setQueryData(['localStorage', key], value);
    if (value) {
      localStorage.setItem(key, value)
    } else {
      localStorage.removeItem(key)
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        setValue(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    }
  }, [key, queryClient]);

  return {
    ...useQuery({
      queryKey: ['localStorage', key],
      queryFn: () => {
        const item = localStorage.getItem(key);
        if (item === null) {
          return null
        }
        try {
          return JSON.parse(item) as T;
        } catch {
          return item as T
        }
      },
      staleTime: Infinity,
      retry: false,
    }),
    setValue
  };
};