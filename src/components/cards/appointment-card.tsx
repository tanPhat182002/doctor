'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Clock, MapPin, Phone, Calendar, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useExamStatus } from '@/hooks/useStatusManager'
import type { ExamStatus } from '@/types'

interface AppointmentCardProps {
  appointment: {
    id: number
    ngayKham: string
    gioKham?: string
    lyDoKham?: string
    trangThai: 'CHO_KHAM' | 'DANG_KHAM' | 'DA_KHAM' | 'HUY'
    hoSoThu: {
      maHoSo: string
      tenThu: string
      loai: string
      khachHang: {
        tenKhachHang: string
        soDienThoai: string
        diaChi?: string
      }
    }
    ghiChu?: string
  }
  variant?: 'default' | 'compact' | 'timeline'
  showActions?: boolean
}

// Removed inline status config - now using status manager

export function AppointmentCard({ 
  appointment, 
  variant = 'default', 
  showActions = true 
}: AppointmentCardProps) {
  const examStatus = useExamStatus()
  const status = examStatus.getConfig(appointment.trangThai as ExamStatus) || {
    label: appointment.trangThai,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    dotClass: 'bg-gray-500',
    emoji: '❓'
  }
  const isToday = new Date(appointment.ngayKham).toDateString() === new Date().toDateString()
  const isPast = new Date(appointment.ngayKham) < new Date()

  if (variant === 'timeline') {
    return (
      <div className="relative flex gap-4 pb-8">
        {/* Timeline line */}
        <div className="absolute left-2.5 top-4 h-full w-0.5 bg-gray-200" />
        
        {/* Timeline dot */}
        <div className={cn('h-5 w-5 rounded-full ring-4 ring-white', status.dotClass)} />
        
        {/* Content */}
        <div className="flex-1 -mt-1">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {appointment.gioKham || '09:00'} - {appointment.hoSoThu.tenThu}
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                  status.className
                )}
              >
                {status.label}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {appointment.lyDoKham || 'Khám định kỳ'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              KH: {appointment.hoSoThu.khachHang.tenKhachHang}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/lich-kham/${appointment.id}`}
        className={cn(
          'block rounded-lg border bg-white p-4 transition-all hover:shadow-sm',
          isToday ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {appointment.gioKham || '09:00'} - {appointment.hoSoThu.tenThu}
              </p>
              <p className="text-sm text-gray-600">
                {appointment.hoSoThu.khachHang.tenKhachHang}
              </p>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
              status.className
            )}
          >
            {status.label}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-white shadow-sm transition-all hover:shadow-md',
        isToday && 'border-blue-300 ring-2 ring-blue-100',
        isPast && appointment.trangThai === 'CHO_KHAM' && 'border-red-300'
      )}
    >
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {appointment.hoSoThu.tenThu}
              </h3>
              <span className="text-sm text-gray-600">
                ({appointment.hoSoThu.loai})
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {appointment.lyDoKham || 'Khám định kỳ'}
            </p>
          </div>
          
          <div className="text-right">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                status.className
              )}
            >
              {status.label}
            </span>
            {isToday && (
              <p className="mt-1 text-xs font-medium text-blue-600">Hôm nay</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-700">Ngày:</span>
            <span className="text-gray-900">{formatDate(appointment.ngayKham)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-700">Giờ:</span>
            <span className="text-gray-900">{appointment.gioKham || '09:00'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-700">Khách hàng:</span>
            <span className="text-gray-900">
              {appointment.hoSoThu.khachHang.tenKhachHang} - {appointment.hoSoThu.khachHang.soDienThoai}
            </span>
          </div>
          
          {appointment.hoSoThu.khachHang.diaChi && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <span className="font-medium text-gray-700">Địa chỉ:</span>
              <span className="text-gray-900 flex-1">
                {appointment.hoSoThu.khachHang.diaChi}
              </span>
            </div>
          )}
        </div>

        {appointment.ghiChu && (
          <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Ghi chú:</p>
              <p className="text-sm text-yellow-700">{appointment.ghiChu}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && appointment.trangThai === 'CHO_KHAM' && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700">
              Bắt đầu khám
            </button>
            <button className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
              Dời lịch
            </button>
            <button className="rounded-lg bg-red-50 px-4 py-2 text-center text-sm font-medium text-red-700 transition-colors hover:bg-red-100">
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}