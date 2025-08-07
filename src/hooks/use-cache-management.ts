'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { queryKeys } from '@/lib/query-client'
import { toast } from 'react-hot-toast'

export interface CacheStats {
  totalQueries: number
  staleQueries: number
  cacheSize: string
  hitRate: number
}

export function useCacheManagement() {
  const queryClient = useQueryClient()

  // Invalidate specific cache keys
  const invalidateCache = {
    pets: useCallback(() => queryClient.invalidateQueries({ queryKey: queryKeys.pets.all }), [queryClient]),
    schedules: useCallback(() => queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all }), [queryClient]),
    customers: useCallback(() => queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }), [queryClient]),
    dashboard: useCallback(() => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }), [queryClient]),
    all: useCallback(() => queryClient.invalidateQueries(), [queryClient]),
  }

  // Prefetch data
  const prefetchData = {
    pets: useCallback((params?: Record<string, unknown>) => 
      queryClient.prefetchQuery({
        queryKey: queryKeys.pets.list(params || {}),
        queryFn: () => fetch('/api/pets?' + new URLSearchParams(params ? params as Record<string, string> : {})).then(res => res.json()),
        staleTime: 5 * 60 * 1000, // 5 minutes
      }), [queryClient]),
    
    schedules: useCallback((params?: Record<string, unknown>) => 
      queryClient.prefetchQuery({
        queryKey: queryKeys.schedules.list(params || {}),
        queryFn: () => fetch('/api/lich-kham?' + new URLSearchParams(params ? params as Record<string, string> : {})).then(res => res.json()),
        staleTime: 2 * 60 * 1000, // 2 minutes
      }), [queryClient]),
    
    customers: useCallback((params?: Record<string, unknown>) => 
      queryClient.prefetchQuery({
        queryKey: queryKeys.customers.list(params || {}),
        queryFn: () => fetch('/api/customers?' + new URLSearchParams(params ? params as Record<string, string> : {})).then(res => res.json()),
        staleTime: 10 * 60 * 1000, // 10 minutes
      }), [queryClient]),
    
    dashboard: useCallback(() => 
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.stats(),
        queryFn: () => fetch('/api/dashboard/stats').then(res => res.json()),
        staleTime: 5 * 60 * 1000, // 5 minutes
      }), [queryClient]),
  }

  // Get cache statistics
  const getCacheStats = useCallback((): CacheStats => {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()
    
    const totalQueries = queries.length
    const staleQueries = queries.filter(query => query.isStale()).length
    
    // Calculate approximate cache size
    const cacheSize = queries.reduce((size, query) => {
      const data = query.state.data
      if (data) {
        try {
          return size + JSON.stringify(data).length
        } catch {
          return size + 1000 // Estimate for non-serializable data
        }
      }
      return size
    }, 0)
    
    // Calculate hit rate (simplified)
    const hitRate = totalQueries > 0 ? ((totalQueries - staleQueries) / totalQueries) * 100 : 0
    
    return {
      totalQueries,
      staleQueries,
      cacheSize: formatBytes(cacheSize),
      hitRate: Math.round(hitRate * 100) / 100,
    }
  }, [queryClient])

  // Clear all cache
  const clearAllCache = useCallback(() => {
    queryClient.clear()
    toast.success('Đã xóa toàn bộ cache')
  }, [queryClient])

  // Clear stale cache only
  const clearStaleCache = useCallback(() => {
    const cache = queryClient.getQueryCache()
    const staleQueries = cache.getAll().filter(query => query.isStale())
    
    staleQueries.forEach(query => {
      cache.remove(query)
    })
    
    toast.success(`Đã xóa ${staleQueries.length} cache cũ`)
  }, [queryClient])

  // Refresh all active queries
  const refreshAllQueries = useCallback(() => {
    queryClient.refetchQueries({ type: 'active' })
    toast.success('Đang làm mới dữ liệu...')
  }, [queryClient])

  // Set cache data manually
  const setCacheData = useCallback((queryKey: unknown[], data: unknown) => {
    queryClient.setQueryData(queryKey, data)
  }, [queryClient])

  // Get cache data
  const getCacheData = useCallback((queryKey: unknown[]) => {
    return queryClient.getQueryData(queryKey)
  }, [queryClient])

  // Remove specific cache
  const removeCache = useCallback((queryKey: unknown[]) => {
    queryClient.removeQueries({ queryKey })
  }, [queryClient])

  // Optimistic updates
  const optimisticUpdate = {
    // Update pet data optimistically
    updatePet: (petId: string, updatedData: Partial<unknown>) => {
      const queryKey = queryKeys.pets.detail(petId)
      const previousData = queryClient.getQueryData(queryKey)
      
      queryClient.setQueryData(queryKey, (old: unknown) => {
        if (old && typeof old === 'object') {
          return { ...old, ...updatedData }
        }
        return old
      })
      
      return () => queryClient.setQueryData(queryKey, previousData)
    },
    
    // Update schedule data optimistically
    updateSchedule: (scheduleId: string, updatedData: Partial<unknown>) => {
      const queryKey = queryKeys.schedules.detail(scheduleId)
      const previousData = queryClient.getQueryData(queryKey)
      
      queryClient.setQueryData(queryKey, (old: unknown) => {
        if (old && typeof old === 'object') {
          return { ...old, ...updatedData }
        }
        return old
      })
      
      return () => queryClient.setQueryData(queryKey, previousData)
    },
    
    // Add new item to list optimistically
    addToList: (listQueryKey: unknown[], newItem: unknown) => {
      const previousData = queryClient.getQueryData(listQueryKey)
      
      queryClient.setQueryData(listQueryKey, (old: unknown) => {
        if (Array.isArray(old)) {
          return [newItem, ...old]
        }
        if (old && typeof old === 'object' && 'data' in old && Array.isArray(old.data)) {
          return { ...old, data: [newItem, ...old.data] }
        }
        return old
      })
      
      return () => queryClient.setQueryData(listQueryKey, previousData)
    },
    
    // Remove item from list optimistically
    removeFromList: (listQueryKey: unknown[], itemId: string) => {
      const previousData = queryClient.getQueryData(listQueryKey)
      
      queryClient.setQueryData(listQueryKey, (old: unknown) => {
        if (Array.isArray(old)) {
          return old.filter((item: unknown) => 
            typeof item === 'object' && item !== null && 'id' in item && item.id !== itemId
          )
        }
        if (old && typeof old === 'object' && 'data' in old && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.filter((item: unknown) => 
              typeof item === 'object' && item !== null && 'id' in item && item.id !== itemId
            )
          }
        }
        return old
      })
      
      return () => queryClient.setQueryData(listQueryKey, previousData)
    },
  }

  return {
    invalidateCache,
    prefetchData,
    getCacheStats,
    clearAllCache,
    clearStaleCache,
    refreshAllQueries,
    setCacheData,
    getCacheData,
    removeCache,
    optimisticUpdate,
  }
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Hook for cache-aware data fetching
export function useCacheAwareFetch() {
  const queryClient = useQueryClient()
  
  const fetchWithCache = useCallback(async (url: string, options?: RequestInit) => {
    // Check if we have cached data first
    const cacheKey = ['fetch', url, options]
    const cachedData = queryClient.getQueryData(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    // Fetch from network
    try {
      const response = await fetch(url, options)
      const data = await response.json()
      
      // Cache the result
      queryClient.setQueryData(cacheKey, data, {
        updatedAt: Date.now(),
      })
      
      return data
    } catch (error) {
      // Try to return stale cache on error
      const staleData = queryClient.getQueryData(cacheKey)
      if (staleData) {
        toast.error('Sử dụng dữ liệu cache do lỗi mạng')
        return staleData
      }
      throw error
    }
  }, [queryClient])
  
  return { fetchWithCache }
}