import { QueryClient, DefaultOptions } from '@tanstack/react-query'

// Default query options
const defaultOptions: DefaultOptions = {
  queries: {
    // Cache data for 5 minutes by default
    staleTime: 5 * 60 * 1000,
    // Keep data in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Retry failed requests 3 times with exponential backoff
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && 'status' in error) {
        const status = (error as { status: number }).status
        if (status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Don't refetch on window focus by default
    refetchOnWindowFocus: false,
    // Refetch on reconnect
    refetchOnReconnect: true,
    // Don't refetch on mount if data is fresh
    refetchOnMount: 'always',
  },
  mutations: {
    // Retry mutations once
    retry: 1,
    // Show error notifications
    onError: (error) => {
      console.error('Mutation error:', error)
      // You can integrate with your preferred toast library here
      // Example: toast.error(error.message || 'Có lỗi xảy ra')
    },
  },
}

// Create query client with optimized settings
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions,
  })
}

// Singleton query client for app
let queryClient: QueryClient | undefined

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server-side: always create a new client
    return createQueryClient()
  }
  
  // Client-side: reuse existing client
  if (!queryClient) {
    queryClient = createQueryClient()
  }
  
  return queryClient
}

// Query key factories for consistent cache keys
export const queryKeys = {
  // Pet-related queries
  pets: {
    all: ['pets'] as const,
    lists: () => [...queryKeys.pets.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.pets.lists(), filters] as const,
    details: () => [...queryKeys.pets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.pets.details(), id] as const,
    search: (query: string) => [...queryKeys.pets.all, 'search', query] as const,
    customer: (customerId: string) => 
      [...queryKeys.pets.all, 'customer', customerId] as const,
  },
  
  // Schedule-related queries
  schedules: {
    all: ['schedules'] as const,
    lists: () => [...queryKeys.schedules.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.schedules.lists(), filters] as const,
    details: () => [...queryKeys.schedules.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.schedules.details(), id] as const,
    pet: (petId: string) => 
      [...queryKeys.schedules.all, 'pet', petId] as const,
    dashboard: () => [...queryKeys.schedules.all, 'dashboard'] as const,
    calendar: (month: string) => 
      [...queryKeys.schedules.all, 'calendar', month] as const,
  },
  
  // Customer-related queries
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.customers.lists(), filters] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.customers.details(), id] as const,
    search: (query: string) => 
      [...queryKeys.customers.all, 'search', query] as const,
    address: (address: Record<string, unknown>) => 
      [...queryKeys.customers.all, 'address', address] as const,
  },
  
  // Location-related queries
  locations: {
    all: ['locations'] as const,
    provinces: () => [...queryKeys.locations.all, 'provinces'] as const,
    districts: (provinceId: string) => 
      [...queryKeys.locations.all, 'districts', provinceId] as const,
    wards: (districtId: string) => 
      [...queryKeys.locations.all, 'wards', districtId] as const,
  },
  
  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    recentActivities: () => [...queryKeys.dashboard.all, 'recent'] as const,
    charts: (period: string) => 
      [...queryKeys.dashboard.all, 'charts', period] as const,
  },
} as const

// Cache invalidation helpers
export const cacheUtils = {
  // Invalidate all pet-related queries
  invalidatePets: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.pets.all })
  },
  
  // Invalidate specific pet
  invalidatePet: (queryClient: QueryClient, petId: string) => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.detail(petId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.lists() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.pet(petId) }),
    ])
  },
  
  // Invalidate all schedule-related queries
  invalidateSchedules: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all })
  },
  
  // Invalidate specific schedule
  invalidateSchedule: (queryClient: QueryClient, scheduleId: string) => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.detail(scheduleId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.lists() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ])
  },
  
  // Invalidate all customer-related queries
  invalidateCustomers: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
  },
  
  // Invalidate specific customer
  invalidateCustomer: (queryClient: QueryClient, customerId: string) => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(customerId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.customer(customerId) }),
    ])
  },
  
  // Invalidate dashboard data
  invalidateDashboard: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
  },
  
  // Prefetch related data
  prefetchPetDetails: (queryClient: QueryClient, petId: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.pets.detail(petId),
      queryFn: () => fetch(`/api/ho-so-thu/${petId}`).then(res => res.json()),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  },
  
  prefetchCustomerPets: (queryClient: QueryClient, customerId: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.pets.customer(customerId),
      queryFn: () => fetch(`/api/ho-so-thu?maKhachHang=${customerId}`).then(res => res.json()),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  },
}

// Performance monitoring
export const performanceUtils = {
  // Log slow queries
  logSlowQueries: (queryClient: QueryClient) => {
    const cache = queryClient.getQueryCache()
    
    cache.subscribe((event) => {
      if (event?.type === 'updated' && event.query.state.fetchStatus === 'idle') {
        const duration = event.query.state.dataUpdatedAt - (event.query.state.errorUpdatedAt || 0)
        
        if (duration > 2000) { // Log queries taking more than 2 seconds
          console.warn('Slow query detected:', {
            queryKey: event.query.queryKey,
            duration: `${duration}ms`,
            dataSize: JSON.stringify(event.query.state.data).length,
          })
        }
      }
    })
  },
  
  // Get cache statistics
  getCacheStats: (queryClient: QueryClient) => {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      cacheSize: queries.reduce((size, query) => {
        return size + JSON.stringify(query.state.data).length
      }, 0),
    }
  },
}

// Background sync utilities
export const backgroundSync = {
  // Setup periodic background refresh for critical data
  setupBackgroundRefresh: (queryClient: QueryClient) => {
    // Refresh dashboard data every 5 minutes
    setInterval(() => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dashboard.stats(),
        refetchType: 'active' // Only refetch if component is mounted
      })
    }, 5 * 60 * 1000)
    
    // Refresh schedule data every 2 minutes
    setInterval(() => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.schedules.lists(),
        refetchType: 'active'
      })
    }, 2 * 60 * 1000)
  },
  
  // Sync data when coming back online
  setupOnlineSync: (queryClient: QueryClient) => {
    window.addEventListener('online', () => {
      queryClient.resumePausedMutations()
      queryClient.invalidateQueries()
    })
  },
}