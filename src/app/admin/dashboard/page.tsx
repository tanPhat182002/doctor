'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Phone, User, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface LichKham {
  id: number
  ngayKham: string
  ngayTaiKham: string | null
  ghiChu: string | null
  trangThaiKham: 'CHUA_KHAM' | 'DA_KHAM' | 'HUY' | 'HOAN'
  hoSoThu: {
    maHoSo: string
    tenThu: string
    loai: string
    trangThai: string
    khachHang: {
      tenKhachHang: string
      soDienThoai: string
      diaChi: string | null
    }
  }
}

interface DashboardStats {
  today: number
  next3Days: number
  total: number
}

export default function DashboardPage() {
  const [schedules, setSchedules] = useState<LichKham[]>([])
  const [stats, setStats] = useState<DashboardStats>({ today: 0, next3Days: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string>('today')

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/lich-kham?limit=1000')
      const data = await response.json()
      
      if (data.success) {
        const allSchedules = data.data
        const today = new Date()
        const next3Days = new Date()
        next3Days.setDate(today.getDate() + 3)
        
        // Filter schedules for re-examination (ngayTaiKham)
        const reExamSchedules = allSchedules.filter((schedule: LichKham) => 
          schedule.ngayTaiKham && new Date(schedule.ngayTaiKham) >= today
        )
        
        // Calculate stats
        const todaySchedules = reExamSchedules.filter((schedule: LichKham) => {
          const examDate = new Date(schedule.ngayTaiKham!)
          return examDate.toDateString() === today.toDateString()
        })
        
        const next3DaysSchedules = reExamSchedules.filter((schedule: LichKham) => {
          const examDate = new Date(schedule.ngayTaiKham!)
          return examDate >= today && examDate <= next3Days
        })
        
        setSchedules(reExamSchedules)
        setStats({
          today: todaySchedules.length,
          next3Days: next3DaysSchedules.length,
          total: reExamSchedules.length
        })
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredSchedules = () => {
    const today = new Date()
    const next3Days = new Date()
    next3Days.setDate(today.getDate() + 3)
    
    switch (selectedDay) {
      case 'today':
        return schedules.filter(schedule => {
          const examDate = new Date(schedule.ngayTaiKham!)
          return examDate.toDateString() === today.toDateString()
        })
      case 'next3days':
        return schedules.filter(schedule => {
          const examDate = new Date(schedule.ngayTaiKham!)
          return examDate >= today && examDate <= next3Days
        })
      default:
        return schedules
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CHUA_KHAM': return 'bg-yellow-100 text-yellow-800'
      case 'DA_KHAM': return 'bg-green-100 text-green-800'
      case 'HUY': return 'bg-red-100 text-red-800'
      case 'HOAN': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CHUA_KHAM': return 'Chưa khám'
      case 'DA_KHAM': return 'Đã khám'
      case 'HUY': return 'Đã hủy'
      case 'HOAN': return 'Hoãn'
      default: return status
    }
  }

  const getPetIcon = (loai: string) => {
    switch (loai.toLowerCase()) {
      case 'cho': return '🐕'
      case 'meo': return '🐱'
      case 'chim': return '🐦'
      case 'ca': return '🐠'
      case 'tho': return '🐰'
      case 'hamster': return '🐹'
      default: return '🐾'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const filteredSchedules = getFilteredSchedules()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md lg:max-w-6xl mx-auto px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg lg:text-2xl font-bold text-gray-900">Dashboard Tái Khám</h1>
            <Link href="/admin/lich-kham/calendar">
              <Button variant="outline" size="sm" className="lg:size-default">
                <Calendar className="h-4 w-4 lg:h-5 lg:w-5 lg:mr-2" />
                <span className="hidden lg:inline">Xem Lịch</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-md lg:max-w-6xl mx-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm text-gray-600">Hôm nay</p>
                  <p className="text-xl lg:text-2xl font-bold text-blue-600">{stats.today}</p>
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm text-gray-600">3 ngày tới</p>
                  <p className="text-xl lg:text-2xl font-bold text-green-600">{stats.next3Days}</p>
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm text-gray-600">Tổng tái khám</p>
                  <p className="text-xl lg:text-2xl font-bold text-purple-600">{stats.total}</p>
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm text-gray-600">Đang chờ</p>
                  <p className="text-xl lg:text-2xl font-bold text-orange-600">{schedules.filter(s => s.trangThaiKham === 'CHUA_KHAM').length}</p>
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Layout */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Filter Sidebar - Desktop */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              {/* Filter Tabs */}
              <div className="flex lg:flex-col bg-white rounded-lg p-1 lg:p-2 shadow-sm lg:space-y-2">
                <button
                  onClick={() => setSelectedDay('today')}
                  className={`flex-1 lg:flex-none py-2 px-3 lg:py-3 lg:px-4 rounded-md text-sm lg:text-base font-medium transition-colors lg:text-left ${
                    selectedDay === 'today'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900 lg:hover:bg-gray-50'
                  }`}
                >
                  <div className="lg:flex lg:items-center lg:justify-between">
                    <span>Hôm nay</span>
                    <span className={`lg:ml-2 lg:px-2 lg:py-1 lg:rounded-full lg:text-xs ${
                      selectedDay === 'today' ? 'lg:bg-blue-400' : 'lg:bg-gray-200 lg:text-gray-700'
                    }`}>
                      {stats.today}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setSelectedDay('next3days')}
                  className={`flex-1 lg:flex-none py-2 px-3 lg:py-3 lg:px-4 rounded-md text-sm lg:text-base font-medium transition-colors lg:text-left ${
                    selectedDay === 'next3days'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900 lg:hover:bg-gray-50'
                  }`}
                >
                  <div className="lg:flex lg:items-center lg:justify-between">
                    <span>3 ngày tới</span>
                    <span className={`lg:ml-2 lg:px-2 lg:py-1 lg:rounded-full lg:text-xs ${
                      selectedDay === 'next3days' ? 'lg:bg-blue-400' : 'lg:bg-gray-200 lg:text-gray-700'
                    }`}>
                      {stats.next3Days}
                    </span>
                  </div>
                </button>
              </div>
              
              {/* Quick Actions - Desktop */}
              <div className="hidden lg:block mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Thao tác nhanh</h3>
                <div className="space-y-2">
                  <Link href="/admin/lich-kham" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Tất cả lịch khám
                    </Button>
                  </Link>
                  <Link href="/admin/ho-so-thu" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Hồ sơ thú cưng
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-9 mt-4 lg:mt-0">
            {/* Schedule List */}
            <div className="space-y-3 lg:grid lg:grid-cols-1 xl:grid-cols-2 lg:gap-4 lg:space-y-0">
          {filteredSchedules.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {selectedDay === 'today' ? 'Không có lịch tái khám hôm nay' : 'Không có lịch tái khám trong 3 ngày tới'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSchedules.map((schedule) => (
              <Card key={schedule.id} className="shadow-sm hover:shadow-md transition-shadow lg:h-fit">
                <CardContent className="p-4 lg:p-5">
                  <div className="flex items-start space-x-3">
                    {/* Pet Icon */}
                    <div className="text-2xl lg:text-3xl">
                      {getPetIcon(schedule.hoSoThu.loai)}
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm lg:text-base">
                            {schedule.hoSoThu.tenThu}
                          </h3>
                          <p className="text-xs lg:text-sm text-gray-600">
                            {schedule.hoSoThu.khachHang.tenKhachHang}
                          </p>
                        </div>
                        <Badge className={`text-xs lg:text-sm ${getStatusColor(schedule.trangThaiKham)}`}>
                          {getStatusText(schedule.trangThaiKham)}
                        </Badge>
                      </div>
                      
                      {/* Date & Time */}
                      <div className="flex items-center space-x-4 text-xs lg:text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span>{formatDate(schedule.ngayTaiKham!)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span>{formatTime(schedule.ngayTaiKham!)}</span>
                        </div>
                      </div>
                      
                      {/* Contact Info */}
                      <div className="flex items-center justify-between text-xs lg:text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Phone className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span>{schedule.hoSoThu.khachHang.soDienThoai}</span>
                        </div>
                        <Link href={`/admin/ho-so-thu/${schedule.hoSoThu.maHoSo}`}>
                          <Button variant="outline" size="sm" className="h-6 lg:h-8 px-2 lg:px-3 text-xs lg:text-sm">
                            Chi tiết
                          </Button>
                        </Link>
                      </div>
                      
                      {/* Notes */}
                      {schedule.ghiChu && (
                        <div className="mt-2 p-2 lg:p-3 bg-yellow-50 rounded text-xs lg:text-sm text-yellow-800">
                          <strong>Ghi chú:</strong> {schedule.ghiChu}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
            </div>
          </div>
        </div>

        {/* Quick Actions - Mobile Only */}
        <div className="grid grid-cols-2 gap-3 pt-4 lg:hidden">
          <Link href="/admin/lich-kham">
            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Tất cả lịch khám
            </Button>
          </Link>
          <Link href="/admin/ho-so-thu">
            <Button variant="outline" className="w-full">
              <User className="h-4 w-4 mr-2" />
              Hồ sơ thú cưng
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}