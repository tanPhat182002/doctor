'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppointmentCalendar } from '@/components/calendar/appointment-calendar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, List } from 'lucide-react'
import Link from 'next/link'

interface Schedule {
  id: number
  ngayKham: Date
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

interface AppointmentEvent {
  id: number
  title: string
  start: Date
  end: Date
  resource: {
    id: number
    maHoSo: string
    tenThu: string
    loai: string
    trangThaiKham: string
    khachHang: {
      tenKhachHang: string
      soDienThoai: string
    }
    ghiChu?: string
  }
}

export default function CalendarPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<AppointmentEvent[]>([])

  // Fetch schedules from API
  const fetchSchedules = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/lich-kham?limit=1000') // Get all schedules
      const data: ScheduleResponse = await response.json()
      
      if (data.success) {
        
        // Transform schedules to calendar events
        const calendarEvents: AppointmentEvent[] = []
        
        data.data.forEach(schedule => {
          // Add main appointment
          const mainEvent: AppointmentEvent = {
            id: schedule.id,
            title: `${schedule.hoSoThu.tenThu} - ${schedule.hoSoThu.khachHang.tenKhachHang}`,
            start: new Date(schedule.ngayKham),
            end: new Date(new Date(schedule.ngayKham).getTime() + 60 * 60 * 1000), // 1 hour duration
            resource: {
              id: schedule.id,
              maHoSo: schedule.hoSoThu.maHoSo,
              tenThu: schedule.hoSoThu.tenThu,
              loai: schedule.hoSoThu.loai,
              trangThaiKham: schedule.trangThaiKham,
              khachHang: {
                tenKhachHang: schedule.hoSoThu.khachHang.tenKhachHang,
                soDienThoai: schedule.hoSoThu.khachHang.soDienThoai
              },
              ghiChu: schedule.ghiChu || undefined
            }
          }
          calendarEvents.push(mainEvent)
          
          // Add follow-up appointment if exists
          if (schedule.ngayTaiKham) {
            const followUpEvent: AppointmentEvent = {
              id: schedule.id + 10000, // Unique ID for follow-up
              title: `[Tái khám] ${schedule.hoSoThu.tenThu} - ${schedule.hoSoThu.khachHang.tenKhachHang}`,
              start: new Date(schedule.ngayTaiKham),
              end: new Date(new Date(schedule.ngayTaiKham).getTime() + 60 * 60 * 1000), // 1 hour duration
              resource: {
                id: schedule.id,
                maHoSo: schedule.hoSoThu.maHoSo,
                tenThu: schedule.hoSoThu.tenThu,
                loai: schedule.hoSoThu.loai,
                trangThaiKham: 'CHUA_KHAM', // Follow-up appointments are usually pending
                khachHang: {
                  tenKhachHang: schedule.hoSoThu.khachHang.tenKhachHang,
                  soDienThoai: schedule.hoSoThu.khachHang.soDienThoai
                },
                ghiChu: schedule.ghiChu || undefined
              }
            }
            calendarEvents.push(followUpEvent)
          }
        })
        
        setEvents(calendarEvents)
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  const handleSelectEvent = (event: AppointmentEvent) => {
    // Navigate to pet detail page
    router.push(`/admin/ho-so-thu/${event.resource.maHoSo}`)
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // Navigate to create new appointment with pre-filled date
    const startDate = slotInfo.start.toISOString().split('T')[0]
    router.push(`/admin/lich-kham/them-moi?date=${startDate}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/lich-kham">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Lịch Tái Khám</h1>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải lịch khám...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/admin/lich-kham">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Quay lại</span>
              <span className="sm:hidden">Về</span>
            </Button>
          </Link>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Lịch Tái Khám</h1>
        </div>
        
        <div className="flex items-center gap-2 justify-end">
          <Link href="/admin/lich-kham">
            <Button variant="outline" size="sm">
              <List className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Xem dạng bảng</span>
              <span className="sm:hidden">Bảng</span>
            </Button>
          </Link>
          <Button variant="default" size="sm">
            <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Xem dạng lịch</span>
            <span className="sm:hidden">Lịch</span>
          </Button>
        </div>
      </div>



      {/* Calendar Component */}
      <AppointmentCalendar
        appointments={events}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
      />


    </div>
  )
}