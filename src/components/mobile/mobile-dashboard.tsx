'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Phone, User, ChevronRight, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { MobileCard, MobileButton, MobileList, MobileListItem } from '@/components/layout/mobile-layout'
import { cn } from '@/lib/utils'

interface Schedule {
  maLichTaiKham: string
  ngayTaiKham: string
  trangThai: string
  ghiChu?: string
  hoSoThu: {
    maHoSo: string
    tenThu: string
    khachHang: {
      tenKhachHang: string
      soDienThoai: string
    }
  }
}

interface MobileDashboardProps {
  schedules: Schedule[]
  loading: boolean
}

export function MobileDashboard({ schedules, loading }: MobileDashboardProps) {
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'all'>('today')
  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    total: 0,
    pending: 0
  })

  useEffect(() => {
    if (schedules) {
      const today = new Date().toISOString().split('T')[0]
      const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const todayCount = schedules.filter(s => s.ngayTaiKham === today).length
      const upcomingCount = schedules.filter(s => s.ngayTaiKham <= threeDaysFromNow && s.ngayTaiKham >= today).length
      const pendingCount = schedules.filter(s => s.trangThai === 'pending').length
      
      setStats({
        today: todayCount,
        upcoming: upcomingCount,
        total: schedules.length,
        pending: pendingCount
      })
    }
  }, [schedules])

  const filteredSchedules = schedules?.filter(schedule => {
    const today = new Date().toISOString().split('T')[0]
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    switch (filter) {
      case 'today':
        return schedule.ngayTaiKham === today
      case 'upcoming':
        return schedule.ngayTaiKham <= threeDaysFromNow && schedule.ngayTaiKham >= today
      default:
        return true
    }
  }) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành'
      case 'pending': return 'Chờ khám'
      case 'cancelled': return 'Đã hủy'
      default: return 'Không xác định'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Loading List */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Quản lý lịch tái khám thú cưng</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <MobileCard className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
          <div className="text-sm text-gray-600">Hôm nay</div>
        </MobileCard>
        
        <MobileCard className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
          <div className="text-sm text-gray-600">3 ngày tới</div>
        </MobileCard>
        
        <MobileCard className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Tổng cộng</div>
        </MobileCard>
        
        <MobileCard className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Đang chờ</div>
        </MobileCard>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex bg-gray-100 rounded-xl p-1"
      >
        {[
          { key: 'today', label: 'Hôm nay' },
          { key: 'upcoming', label: '3 ngày tới' },
          { key: 'all', label: 'Tất cả' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as 'today' | 'upcoming' | 'all')}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200',
              filter === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Schedule List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Lịch tái khám ({filteredSchedules.length})
          </h2>
          <Link href="/admin/lich-kham">
            <MobileButton variant="outline" size="sm">
              Xem tất cả
            </MobileButton>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {filteredSchedules.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Không có lịch tái khám nào</p>
              <Link href="/admin/lich-kham/them-moi">
                <MobileButton>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm lịch mới
                </MobileButton>
              </Link>
            </motion.div>
          ) : (
            <MobileList>
              {filteredSchedules.map((schedule, index) => (
                <motion.div
                  key={schedule.maLichTaiKham}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MobileListItem
                    onClick={() => window.location.href = `/admin/ho-so-thu/${schedule.hoSoThu.maHoSo}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Pet Name & Status */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {schedule.hoSoThu.tenThu}
                          </h3>
                          <Badge className={cn('text-xs', getStatusColor(schedule.trangThai))}>
                            {getStatusText(schedule.trangThai)}
                          </Badge>
                        </div>
                        
                        {/* Customer Info */}
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{schedule.hoSoThu.khachHang.tenKhachHang}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{schedule.hoSoThu.khachHang.soDienThoai}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(schedule.ngayTaiKham).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                        
                        {/* Notes */}
                        {schedule.ghiChu && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-800">
                            <strong>Ghi chú:</strong> {schedule.ghiChu}
                          </div>
                        )}
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                    </div>
                  </MobileListItem>
                </motion.div>
              ))}
            </MobileList>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-3"
      >
        <Link href="/admin/lich-kham">
          <MobileButton variant="outline" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Xem lịch
          </MobileButton>
        </Link>
        
        <Link href="/admin/ho-so-thu">
          <MobileButton variant="outline" className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Hồ sơ thú
          </MobileButton>
        </Link>
      </motion.div>
    </div>
  )
}