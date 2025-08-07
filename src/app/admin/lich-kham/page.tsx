'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Filter, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// Removed Card import - using native HTML elements instead
import { ScheduleTable } from '@/components/tables/schedule-table'

interface Schedule {
  id: number
  ngayKham: Date
  soNgay: number
  ngayTaiKham: Date | null
  ghiChu: string | null
  trangThaiKham: string
  hoSoThu: {
    maHoSo: string
    tenThu: string
    loai: string
    trangThai: string
    khachHang: {
      maKhachHang: string
      tenKhachHang: string
      soDienThoai: string
      diaChi: string | null
    }
  }
}

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

function LichKhamContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  // Initialize search params after component mounts
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '')
    setStatusFilter(searchParams.get('trangThaiKham') || '')
  }, [searchParams])
  
  const fetchSchedules = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (searchParams.get('page')) params.set('page', searchParams.get('page')!)
      if (searchParams.get('limit')) params.set('limit', searchParams.get('limit')!)
      if (searchTerm) params.set('search', searchTerm)
      if (statusFilter) params.set('trangThaiKham', statusFilter)
      
      const response = await fetch(`/api/lich-kham?${params.toString()}`)
      const data: ScheduleResponse = await response.json()
      
      if (data.success) {
        setSchedules(data.data)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching schedules:', data)
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setIsLoading(false)
    }
  }, [searchParams, searchTerm, statusFilter])
  
  useEffect(() => {
    fetchSchedules()
  }, [searchParams, fetchSchedules])
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    
    if (searchTerm) {
      params.set('search', searchTerm)
    } else {
      params.delete('search')
    }
    
    if (statusFilter) {
      params.set('trangThaiKham', statusFilter)
    } else {
      params.delete('trangThaiKham')
    }
    
    params.set('page', '1') // Reset to first page
    router.push(`/admin/lich-kham?${params.toString()}`)
  }
  
  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    router.push('/admin/lich-kham')
  }
  
  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch khám</h1>
          <p className="text-gray-600 mt-2">
            Quản lý và theo dõi lịch khám của các thú cưng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/lich-kham/calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Xem dạng lịch
            </Link>
          </Button>
         
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm kiếm và lọc
          </h3>
          <p className="text-gray-600 mt-2">
            Tìm kiếm theo tên thú cưng, tên chủ nhân hoặc ghi chú
          </p>
        </div>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Tìm kiếm
              </label>
              <Input
                id="search"
                placeholder="Nhập tên thú cưng, chủ nhân..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Trạng thái khám
              </label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="CHUA_KHAM">Chưa khám</option>
                <option value="DA_KHAM">Đã khám</option>
                <option value="HUY">Hủy</option>
                <option value="HOAN">Hoãn</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Search className="mr-2 h-4 w-4" />
                  Tìm kiếm
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="flex-1"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Tổng lịch khám</p>
              <p className="text-2xl font-bold">{pagination.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Chưa khám</p>
              <p className="text-2xl font-bold">
                {schedules.filter(s => s.trangThaiKham === 'CHUA_KHAM').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Đã khám</p>
              <p className="text-2xl font-bold">
                {schedules.filter(s => s.trangThaiKham === 'DA_KHAM').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Hủy/Hoãn</p>
              <p className="text-2xl font-bold">
                {schedules.filter(s => ['HUY', 'HOAN'].includes(s.trangThaiKham)).length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Schedule Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Danh sách lịch khám
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {pagination.total > 0 
              ? `Hiển thị ${schedules.length} trong tổng số ${pagination.total} lịch khám`
              : 'Không có lịch khám nào'
            }
          </p>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Đang tải...</div>
            </div>
          ) : (
            <ScheduleTable data={schedules} pagination={pagination} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function LichKhamPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </div>
    }>
      <LichKhamContent />
    </Suspense>
  )
}