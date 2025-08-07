'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import type { Pet, PetFormData, PetTableData } from '@/types'

interface PetsResponse {
  pets: PetTableData[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

interface PetParams {
  search?: string
  page?: number
  pageSize?: number
  status?: string
  type?: string
  khachHang?: string
  maKhachHang?: string
}

// Query Keys
export const petKeys = {
  all: ['pets'] as const,
  lists: () => [...petKeys.all, 'list'] as const,
  list: (params: PetParams) => [...petKeys.lists(), params] as const,
  details: () => [...petKeys.all, 'detail'] as const,
  detail: (maHoSo: string) => [...petKeys.details(), maHoSo] as const,
  customer: (maKhachHang: string) => [...petKeys.all, 'customer', maKhachHang] as const,
  search: (query: string) => [...petKeys.all, 'search', query] as const,
}

// Fetch pets with pagination and filters
export function usePets(params: PetParams = {}) {
  return useQuery({
    queryKey: petKeys.list(params),
    queryFn: async (): Promise<PetsResponse> => {
      const searchParams = new URLSearchParams()
      
      if (params.search) searchParams.set('search', params.search)
      if (params.page) searchParams.set('page', params.page.toString())
      if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString())
      if (params.status) searchParams.set('status', params.status)
      if (params.type) searchParams.set('type', params.type)
      if (params.khachHang) searchParams.set('khachHang', params.khachHang)
      if (params.maKhachHang) searchParams.set('maKhachHang', params.maKhachHang)
      
      const response = await fetch(`/api/ho-so-thu?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch pets')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Fetch single pet details
export function usePet(maHoSo: string) {
  return useQuery({
    queryKey: petKeys.detail(maHoSo),
    queryFn: async (): Promise<Pet> => {
      const response = await fetch(`/api/ho-so-thu/${maHoSo}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch pet details')
      }
      
      const data = await response.json()
      return data.data
    },
    enabled: !!maHoSo,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Fetch pets for specific customer
export function useCustomerPets(maKhachHang: string) {
  return useQuery({
    queryKey: petKeys.customer(maKhachHang),
    queryFn: async (): Promise<PetTableData[]> => {
      const response = await fetch(`/api/ho-so-thu?maKhachHang=${maKhachHang}&limit=100`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer pets')
      }
      
      const data = await response.json()
      return data.pets || []
    },
    enabled: !!maKhachHang,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Search pets (for autocomplete/search)
export function useSearchPets(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: petKeys.search(query),
    queryFn: async (): Promise<PetTableData[]> => {
      const response = await fetch(`/api/ho-so-thu?search=${encodeURIComponent(query)}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to search pets')
      }
      
      const data = await response.json()
      return data.pets || []
    },
    enabled: enabled && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// Create pet mutation
export function useCreatePet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: PetFormData): Promise<Pet> => {
      const response = await fetch('/api/ho-so-thu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create pet')
      }
      
      const result = await response.json()
      return result.data
    },
    onSuccess: (newPet) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: petKeys.lists() })
      
      // Invalidate customer pets if available
      if (newPet.khachHang?.maKhachHang) {
        queryClient.invalidateQueries({ 
          queryKey: petKeys.customer(newPet.khachHang.maKhachHang) 
        })
      }
      
      // Invalidate search queries
      queryClient.invalidateQueries({ 
        queryKey: [...petKeys.all, 'search'] 
      })
      
      toast.success('Tạo hồ sơ thú cưng thành công!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi tạo hồ sơ thú cưng')
    },
  })
}

// Update pet mutation
export function useUpdatePet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ maHoSo, data }: { maHoSo: string; data: Partial<PetFormData> }): Promise<Pet> => {
      const response = await fetch(`/api/ho-so-thu/${maHoSo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update pet')
      }
      
      const result = await response.json()
      return result.data
    },
    onSuccess: (updatedPet, { maHoSo }) => {
      // Update the specific pet in cache
      queryClient.setQueryData(petKeys.detail(maHoSo), updatedPet)
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: petKeys.lists() })
      
      // Invalidate customer pets if available
      if (updatedPet.khachHang?.maKhachHang) {
        queryClient.invalidateQueries({ 
          queryKey: petKeys.customer(updatedPet.khachHang.maKhachHang) 
        })
      }
      
      // Invalidate search queries
      queryClient.invalidateQueries({ 
        queryKey: [...petKeys.all, 'search'] 
      })
      
      toast.success('Cập nhật hồ sơ thú cưng thành công!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật hồ sơ thú cưng')
    },
  })
}

// Delete pet mutation
export function useDeletePet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (maHoSo: string): Promise<void> => {
      const response = await fetch(`/api/ho-so-thu/${maHoSo}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete pet')
      }
    },
    onSuccess: (_, maHoSo) => {
      // Remove the pet from cache
      queryClient.removeQueries({ queryKey: petKeys.detail(maHoSo) })
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: petKeys.lists() })
      queryClient.invalidateQueries({ 
        queryKey: [...petKeys.all, 'customer'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: [...petKeys.all, 'search'] 
      })
      
      toast.success('Xóa hồ sơ thú cưng thành công!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi xóa hồ sơ thú cưng')
    },
  })
}

// Prefetch pets for better UX
export function usePrefetchPets() {
  const queryClient = useQueryClient()
  
  const prefetchPets = (params: PetParams = {}) => {
    queryClient.prefetchQuery({
      queryKey: petKeys.list(params),
      queryFn: async (): Promise<PetsResponse> => {
        const searchParams = new URLSearchParams()
        
        if (params.search) searchParams.set('search', params.search)
        if (params.page) searchParams.set('page', params.page.toString())
        if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString())
        if (params.status) searchParams.set('status', params.status)
        if (params.type) searchParams.set('type', params.type)
        if (params.khachHang) searchParams.set('khachHang', params.khachHang)
        
        const response = await fetch(`/api/ho-so-thu?${searchParams.toString()}`)
        return response.json()
      },
      staleTime: 5 * 60 * 1000,
    })
  }
  
  const prefetchPet = (maHoSo: string) => {
    queryClient.prefetchQuery({
      queryKey: petKeys.detail(maHoSo),
      queryFn: async (): Promise<Pet> => {
        const response = await fetch(`/api/ho-so-thu/${maHoSo}`)
        const data = await response.json()
        return data.data
      },
      staleTime: 5 * 60 * 1000,
    })
  }
  
  const prefetchCustomerPets = (maKhachHang: string) => {
    queryClient.prefetchQuery({
      queryKey: petKeys.customer(maKhachHang),
      queryFn: async (): Promise<PetTableData[]> => {
        const response = await fetch(`/api/ho-so-thu?maKhachHang=${maKhachHang}&limit=100`)
        const data = await response.json()
        return data.pets || []
      },
      staleTime: 5 * 60 * 1000,
    })
  }
  
  return {
    prefetchPets,
    prefetchPet,
    prefetchCustomerPets,
  }
}