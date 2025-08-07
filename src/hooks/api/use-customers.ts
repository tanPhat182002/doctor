'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import type { Customer, CustomerFormData, CustomerTableData } from '@/types'

interface CustomersResponse {
  customers: CustomerTableData[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface CustomerParams {
  search?: string
  page?: number
  limit?: number
  maXa?: string
}

// Query Keys
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params: CustomerParams) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (maKhachHang: string) => [...customerKeys.details(), maKhachHang] as const,
  address: (maXa: string) => [...customerKeys.all, 'address', maXa] as const,
  search: (query: string) => [...customerKeys.all, 'search', query] as const,
}

// Fetch customers with pagination and filters
export function useCustomers(params: CustomerParams = {}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: async (): Promise<CustomersResponse> => {
      const searchParams = new URLSearchParams()
      
      if (params.search) searchParams.set('search', params.search)
      if (params.page) searchParams.set('page', params.page.toString())
      if (params.limit) searchParams.set('limit', params.limit.toString())
      if (params.maXa) searchParams.set('maXa', params.maXa)
      
      const response = await fetch(`/api/khach-hang?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Fetch single customer details
export function useCustomer(maKhachHang: string) {
  return useQuery({
    queryKey: customerKeys.detail(maKhachHang),
    queryFn: async (): Promise<Customer> => {
      const response = await fetch(`/api/khach-hang/${maKhachHang}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer details')
      }
      
      const data = await response.json()
      return data.data
    },
    enabled: !!maKhachHang,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Fetch customers by address
export function useCustomersByAddress(maXa: string) {
  return useQuery({
    queryKey: customerKeys.address(maXa),
    queryFn: async (): Promise<CustomerTableData[]> => {
      const response = await fetch(`/api/khach-hang?maXa=${maXa}&limit=1000`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers by address')
      }
      
      const data = await response.json()
      return data.customers || []
    },
    enabled: !!maXa,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Search customers (for autocomplete/search)
export function useSearchCustomers(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: customerKeys.search(query),
    queryFn: async (): Promise<CustomerTableData[]> => {
      const response = await fetch(`/api/khach-hang?search=${encodeURIComponent(query)}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to search customers')
      }
      
      const data = await response.json()
      return data.customers || []
    },
    enabled: enabled && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// Create customer mutation
export function useCreateCustomer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CustomerFormData): Promise<Customer> => {
      const response = await fetch('/api/khach-hang', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create customer')
      }
      
      const result = await response.json()
      return result.data
    },
    onSuccess: (newCustomer) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      
      // Invalidate address customers if available
      if (newCustomer.xa?.maXa) {
        queryClient.invalidateQueries({ 
          queryKey: customerKeys.address(newCustomer.xa.maXa) 
        })
      }
      
      // Invalidate search queries
      queryClient.invalidateQueries({ 
        queryKey: [...customerKeys.all, 'search'] 
      })
      
      toast.success('Tạo khách hàng thành công!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi tạo khách hàng')
    },
  })
}

// Update customer mutation
export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ maKhachHang, data }: { maKhachHang: string; data: Partial<CustomerFormData> }): Promise<Customer> => {
      const response = await fetch(`/api/khach-hang/${maKhachHang}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update customer')
      }
      
      const result = await response.json()
      return result.data
    },
    onSuccess: (updatedCustomer, { maKhachHang }) => {
      // Update the specific customer in cache
      queryClient.setQueryData(customerKeys.detail(maKhachHang), updatedCustomer)
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      
      // Invalidate address customers if available
      if (updatedCustomer.xa?.maXa) {
        queryClient.invalidateQueries({ 
          queryKey: customerKeys.address(updatedCustomer.xa.maXa) 
        })
      }
      
      // Invalidate search queries
      queryClient.invalidateQueries({ 
        queryKey: [...customerKeys.all, 'search'] 
      })
      
      toast.success('Cập nhật khách hàng thành công!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật khách hàng')
    },
  })
}

// Delete customer mutation
export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (maKhachHang: string): Promise<void> => {
      const response = await fetch(`/api/khach-hang/${maKhachHang}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete customer')
      }
    },
    onSuccess: (_, maKhachHang) => {
      // Remove the customer from cache
      queryClient.removeQueries({ queryKey: customerKeys.detail(maKhachHang) })
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      queryClient.invalidateQueries({ 
        queryKey: [...customerKeys.all, 'address'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: [...customerKeys.all, 'search'] 
      })
      
      toast.success('Xóa khách hàng thành công!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi xóa khách hàng')
    },
  })
}

// Prefetch customers for better UX
export function usePrefetchCustomers() {
  const queryClient = useQueryClient()
  
  const prefetchCustomers = (params: CustomerParams = {}) => {
    queryClient.prefetchQuery({
      queryKey: customerKeys.list(params),
      queryFn: async (): Promise<CustomersResponse> => {
        const searchParams = new URLSearchParams()
        
        if (params.search) searchParams.set('search', params.search)
        if (params.page) searchParams.set('page', params.page.toString())
        if (params.limit) searchParams.set('limit', params.limit.toString())
        if (params.maXa) searchParams.set('maXa', params.maXa)
        
        const response = await fetch(`/api/khach-hang?${searchParams.toString()}`)
        return response.json()
      },
      staleTime: 5 * 60 * 1000,
    })
  }
  
  const prefetchCustomer = (maKhachHang: string) => {
    queryClient.prefetchQuery({
      queryKey: customerKeys.detail(maKhachHang),
      queryFn: async (): Promise<Customer> => {
        const response = await fetch(`/api/khach-hang/${maKhachHang}`)
        const data = await response.json()
        return data.data
      },
      staleTime: 5 * 60 * 1000,
    })
  }
  
  const prefetchCustomersByAddress = (maXa: string) => {
    queryClient.prefetchQuery({
      queryKey: customerKeys.address(maXa),
      queryFn: async (): Promise<CustomerTableData[]> => {
        const response = await fetch(`/api/khach-hang?maXa=${maXa}&limit=1000`)
        const data = await response.json()
        return data.customers || []
      },
      staleTime: 5 * 60 * 1000,
    })
  }
  
  return {
    prefetchCustomers,
    prefetchCustomer,
    prefetchCustomersByAddress,
  }
}