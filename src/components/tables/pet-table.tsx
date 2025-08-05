'use client'

import Link from 'next/link'
import { Calendar, Edit, Eye, MoreHorizontal, Phone, Trash2, QrCode, MapPin, User } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate, formatPhoneNumber } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { PetTableData, PetTableProps } from '@/types'

// Status configuration
// Status config removed as trangThai field doesn't exist in schema

function QRCodeButton({ petId, petName }: { petId: string; petName: string }) {
  const [showQR, setShowQR] = useState(false)
  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin/ho-so-thu/${petId}` : ''

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowQR(!showQR)
        }}
        title="Hiển thị mã QR"
      >
        <QrCode className="h-4 w-4" />
      </Button>
      
      {showQR && (
        <div className="absolute right-0 top-10 z-50 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <div className="text-center">
            <div className="mb-2">
              <QRCodeSVG
                value={profileUrl}
                size={100}
                level="M"
                includeMargin={true}
                title={`QR Code cho ${petName}`}
              />
            </div>
            <p className="text-xs text-gray-600 max-w-[100px] truncate">
              {petName}
            </p>
          </div>
          <div className="absolute -top-2 right-4 h-4 w-4 rotate-45 border-l border-t border-gray-200 bg-white"></div>
        </div>
      )}
    </div>
  )
}

export function PetTable({ data: pets, pagination }: PetTableProps) {
  const router = useRouter()
  
  if (pets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có hồ sơ thú cưng</h3>
        <p className="text-gray-500 mb-6">Bắt đầu bằng cách thêm hồ sơ thú cưng đầu tiên</p>
        <Link href="/admin/ho-so-thu/them-moi">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Thêm hồ sơ thú
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4" suppressHydrationWarning>
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.map((pet: PetTableData) => {
          const lastCheckup = pet.lichTheoDoi[0]
          
          // Kiểm tra ngày tái khám trong 3 ngày tới
          const isUpcomingRecheck = lastCheckup?.ngayTaiKham ? (() => {
            const recheckDate = new Date(lastCheckup.ngayTaiKham)
            const today = new Date()
            today.setHours(0, 0, 0, 0) // Reset time to start of day
            
            const threeDaysFromNow = new Date(today)
            threeDaysFromNow.setDate(today.getDate() + 3)
            threeDaysFromNow.setHours(23, 59, 59, 999) // End of the 3rd day
            
            const recheckDateOnly = new Date(recheckDate)
            recheckDateOnly.setHours(0, 0, 0, 0) // Reset time to start of day
            
            return recheckDateOnly >= today && recheckDateOnly <= threeDaysFromNow
          })() : false
          
          const cardStyle = isUpcomingRecheck 
            ? 'bg-red-50 border-red-200 hover:bg-red-100' 
            : 'bg-white border-gray-200 hover:bg-gray-50'

          return (
            <Card 
              key={pet.maHoSo} 
              className={`cursor-pointer hover:shadow-md transition-all border ${cardStyle}`}
              onClick={() => router.push(`/admin/ho-so-thu/${pet.maHoSo}`)}
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {pet.tenThu}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <QRCodeButton petId={pet.maHoSo} petName={pet.tenThu} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/ho-so-thu/${pet.maHoSo}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/ho-so-thu/${pet.maHoSo}/chinh-sua`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/lich-kham/them-moi?petId=${pet.maHoSo}`}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Đặt lịch khám
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {pet.khachHang.tenKhachHang}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <Link 
                      href={`tel:${pet.khachHang.soDienThoai}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {formatPhoneNumber(pet.khachHang.soDienThoai)}
                    </Link>
                  </div>
                  
                  {pet.khachHang.diaChi && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600 line-clamp-2">
                        {pet.khachHang.diaChi}
                      </span>
                    </div>
                  )}
                </div>

                {/* Last Checkup */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Khám gần nhất
                    </span>
                    {lastCheckup ? (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Calendar className="h-3 w-3" />
                          {formatDate(lastCheckup.ngayKham)}
                        </div>
                        {lastCheckup.ngayTaiKham && (
                          <div className={`text-xs mt-1 ${
                            isUpcomingRecheck ? 'text-red-600 font-semibold' : 'text-blue-600'
                          }`}>
                            Tái khám: {formatDate(lastCheckup.ngayTaiKham)}
                            {isUpcomingRecheck && (
                              <span className="ml-1 text-red-500">⚠️</span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Chưa khám</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2" suppressHydrationWarning>
        <div className="text-sm text-gray-700" suppressHydrationWarning>
          Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{' '}
          {pagination.total} hồ sơ
        </div>
        <div className="flex items-center gap-2" suppressHydrationWarning>
          <Link
            href={`?page=${Math.max(1, pagination.page - 1)}`}
            className={`px-3 py-1 text-sm border rounded ${
              pagination.page <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Trước
          </Link>
          <span className="px-3 py-1 text-sm">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <Link
            href={`?page=${Math.min(pagination.totalPages, pagination.page + 1)}`}
            className={`px-3 py-1 text-sm border rounded ${
              pagination.page >= pagination.totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Sau
          </Link>
        </div>
      </div>
    </div>
  )
}