'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import type { Schedule, ScheduleFormData } from '@/types'

interface ScheduleResponse {
  success: boolean
  data: Schedule[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface ScheduleParams {
  search?: string
  page?: number
  limit?: number
  trangThaiKham?: string
  maHoSo?: string
}

// Query Keys
export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (params: ScheduleParams) => [...scheduleKeys.lists(), params] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
  pet: (maHoSo: string) => [...scheduleKeys.all, 'pet', maHoSo] as const,
  dashboard: () => [...scheduleKeys.all, 'dashboard'] as const,
  calendar: () => [...scheduleKeys.all, 'calendar'] as const,
}

// Fetch schedules with caching
export function useSchedules(params: ScheduleParams = {}) {
  return useQuery({
    queryKey: scheduleKeys.list(params),
    queryFn: async (): Promise<ScheduleResponse> => {
      const searchParams = new URLSearchParams()
      
      if (params.search) searchParams.set('search', params.search)
      if (params.page) searchParams.set('page', params.page.toString())
      if (params.limit) searchParams.set('limit', params.limit.toString())
      if (params.trangThaiKham) searchParams.set('trangThaiKham', params.trangThaiKham)
      if (params.maHoSo) searchParams.set('maHoSo', params.maHoSo)
      
      const response = await fetch(`/api/lich-kham?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedules')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Fetch dashboard schedules (optimized for dashboard)
export function useDashboardSchedules() {
  return useQuery({
    queryKey: scheduleKeys.dashboard(),
    queryFn: async (): Promise<Schedule[]> => {
      const response = await fetch('/api/lich-kham?limit=1000')
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard schedules')
      }
      
      const data = await response.json()
      return data.success ? data.data : []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refresh when user returns to dashboard
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 3,
  })
}

// Fetch calendar schedules
export function useCalendarSchedules() {
  return useQuery({
    queryKey: scheduleKeys.calendar(),
    queryFn: async (): Promise<Schedule[]> => {
      const response = await fetch('/api/lich-kham?limit=1000')
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar schedules')
      }
      
      const data = await response.json()
      return data.success ? data.data : []
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for calendar
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Fetch schedules for specific pet
export function usePetSchedules(maHoSo: string) {
  return useQuery({
    queryKey: scheduleKeys.pet(maHoSo),
    queryFn: async (): Promise<Schedule[]> => {
      const response = await fetch(`/api/ho-so-thu/${maHoSo}/lich-theo-doi`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch pet schedules')
      }
      
      const data = await response.json()
      return data.success ? data.data : []
    },
    enabled: !!maHoSo,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Create schedule mutation
export function useCreateSchedule() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: ScheduleFormData): Promise<Schedule> => {
      const response = await fetch('/api/lich-kham', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create schedule')
      }
      
      const result = await response.json()
      return result.data
    },
    onSuccess: (newSchedule) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.calendar() })
      
      if (newSchedule.hoSoThu?.maHoSo) {
        queryClient.invalidateQueries({ queryKey: scheduleKeys.pet(newSchedule.hoSoThu.maHoSo) })
      }
      
      toast.success('Tạo lịch khám thành công!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi tạo lịch khám')
    },
  })
}

// Update schedule mutation
export function useUpdateSchedule() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ScheduleFormData> }): Promise<Schedule> => {
      const response = await fetch(`/api/lich-kham/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update schedule')
      }
      
      const result = await response.json()
      return result.data
    },
    onSuccess: (updatedSchedule) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.calendar() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(updatedSchedule.id.toString()) })
      
      if (updatedSchedule.hoSoThu?.maHoSo) {
        queryClient.invalidateQueries({ queryKey: scheduleKeys.pet(updatedSchedule.hoSoThu.maHoSo) })
      }
      
      toast.success('Cập nhật lịch khám thành công!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật lịch khám')
    },
  })
}

// Delete schedule mutation
export function useDeleteSchedule() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/lich-kham/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete schedule')
      }
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.calendar() })
      
      toast.success('Xóa lịch khám thành công!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi xóa lịch khám')
    },
  })
}

// Prefetch schedules for better UX
export function usePrefetchSchedules() {
  const queryClient = useQueryClient()
  
  const prefetchSchedules = (params: ScheduleParams = {}) => {
    queryClient.prefetchQuery({
      queryKey: scheduleKeys.list(params),
      queryFn: async (): Promise<ScheduleResponse> => {
        const searchParams = new URLSearchParams()
        
        if (params.search) searchParams.set('search', params.search)
        if (params.page) searchParams.set('page', params.page.toString())
        if (params.limit) searchParams.set('limit', params.limit.toString())
        if (params.trangThaiKham) searchParams.set('trangThaiKham', params.trangThaiKham)
        
        const response = await fetch(`/api/lich-kham?${searchParams.toString()}`)
        return response.json()
      },
      staleTime: 5 * 60 * 1000,
    })
  }
  
  const prefetchPetSchedules = (maHoSo: string) => {
    queryClient.prefetchQuery({
      queryKey: scheduleKeys.pet(maHoSo),
      queryFn: async (): Promise<Schedule[]> => {
        const response = await fetch(`/api/ho-so-thu/${maHoSo}/lich-theo-doi`)
        const data = await response.json()
        return data.success ? data.data : []
      },
      staleTime: 5 * 60 * 1000,
    })
  }
  
  return {
    prefetchSchedules,
    prefetchPetSchedules,
  }
}