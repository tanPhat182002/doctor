'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Edit, Trash2, Eye, Loader2, Phone, MapPin, User, Users, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {  formatPhoneNumber } from '@/lib/utils'

import type { CustomerTableData, CustomerTableProps } from '@/types'

export function CustomerTable({ data: customers, pagination }: CustomerTableProps) {
  const router = useRouter()
  const [deletingCustomer, setDeletingCustomer] = useState<string | null>(null)

  const handleDelete = async (customer: CustomerTableData) => {
    if (customer.hoSoThu.length > 0) {
      alert('Không thể xóa khách hàng có thú cưng. Vui lòng xóa tất cả thú cưng trước.')
      return
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customer.tenKhachHang}"? Hành động này không thể hoàn tác.`)) {
      return
    }

    setDeletingCustomer(customer.maKhachHang)
    try {
      const response = await fetch(`/api/khach-hang/${customer.maKhachHang}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/khach-hang')
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Có lỗi xảy ra khi xóa khách hàng')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Có lỗi xảy ra khi kết nối đến server')
    } finally {
      setDeletingCustomer(null)
    }
  }

  const handleCardClick = (maKhachHang: string) => {
    router.push(`/admin/ho-so-thu?khachHang=${maKhachHang}`)
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có khách hàng</h3>
        <p className="text-gray-500 mb-6">Bắt đầu bằng cách thêm khách hàng đầu tiên</p>
        <Link href="/admin/khach-hang/them-moi">
          <Button>
            <User className="mr-2 h-4 w-4" />
            Thêm khách hàng
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4" suppressHydrationWarning>
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer: CustomerTableData) => {
          // Check if any pet has upcoming recheck within 3 days
          const hasUpcomingRecheck = customer.hoSoThu.some(pet => {
            if (!pet.lichTheoDoi || pet.lichTheoDoi.length === 0) return false
            const lastCheckup = pet.lichTheoDoi[0]
            if (!lastCheckup.ngayTaiKham) return false
            
            const recheckDate = new Date(lastCheckup.ngayTaiKham)
            const today = new Date()
            const threeDaysFromNow = new Date()
            
            // Set time to start/end of day for accurate comparison
            today.setHours(0, 0, 0, 0)
            threeDaysFromNow.setDate(today.getDate() + 3)
            threeDaysFromNow.setHours(23, 59, 59, 999)
            
            const recheckDateOnly = new Date(recheckDate)
            recheckDateOnly.setHours(0, 0, 0, 0)
            
            return recheckDateOnly >= today && recheckDateOnly <= threeDaysFromNow
          })
          
          const cardStyle = hasUpcomingRecheck 
            ? "cursor-pointer hover:shadow-md transition-shadow bg-red-50 border-red-200 hover:bg-red-100"
            : "cursor-pointer hover:shadow-md transition-shadow bg-white border-gray-200"
          
          return (
          <Card 
            key={customer.maKhachHang}
            className={cardStyle}
            onClick={() => handleCardClick(customer.maKhachHang)}
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <h3 className={`font-semibold text-lg ${
                    hasUpcomingRecheck ? 'text-red-700 font-bold' : 'text-gray-900'
                  }`}>
                    {customer.tenKhachHang}
                  </h3>
                  {hasUpcomingRecheck && (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </div>
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
                      <Link href={`/admin/khach-hang/${customer.maKhachHang}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/khach-hang/${customer.maKhachHang}/chinh-sua`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      disabled={deletingCustomer === customer.maKhachHang}
                      onClick={() => handleDelete(customer)}
                    >
                      {deletingCustomer === customer.maKhachHang ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang xóa...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <Link 
                    href={`tel:${customer.soDienThoai}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {formatPhoneNumber(customer.soDienThoai)}
                  </Link>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {customer.xa?.tenXa || 'Chưa có xã'}
                  </span>
                </div>
                
                {customer.diaChi && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-600 line-clamp-2">
                      {customer.diaChi}
                    </span>
                  </div>
                )}
              </div>

              {/* Pet Count */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Thú cưng
                  </span>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                      {customer.hoSoThu.length} thú cưng
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )
        })}
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between px-2" suppressHydrationWarning>
        <div className="text-sm text-muted-foreground" suppressHydrationWarning>
          Hiển thị {((pagination.page - 1) * pagination.limit) + 1} đến{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{' '}
          {pagination.total} khách hàng
        </div>
        <div className="flex items-center space-x-2" suppressHydrationWarning>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            asChild
          >
            <Link href={`?page=${pagination.page - 1}`}>
              Trước
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            asChild
          >
            <Link href={`?page=${pagination.page + 1}`}>
              Sau
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}