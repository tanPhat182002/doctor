'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Edit, Trash2, Users, Eye, MapPin, MoreVertical, AlertTriangle, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'

interface Address {
  maXa: string
  tenXa: string | null
  _count: {
    khachHangs: number
  }
  khachHangs: {
    hoSoThu: {
      lichTheoDoi: {
        ngayTaiKham: Date | null
      }[]
    }[]
  }[]
}

interface AddressTableProps {
  data: Address[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function AddressTable({ data, pagination }: AddressTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (maXa: string) => {
    const deletePromise = new Promise(async (resolve, reject) => {
      const confirmed = confirm('Bạn có chắc chắn muốn xóa xã này? Hành động này không thể hoàn tác.')
      
      if (!confirmed) {
        reject(new Error('Đã hủy xóa'))
        return
      }

      setDeletingId(maXa)
      
      try {
        const response = await fetch(`/api/xa/${maXa}`, {
          method: 'DELETE',
        })
        
        const result = await response.json()
        
        if (result.success) {
          resolve('Xóa xã thành công!')
          setTimeout(() => {
            router.refresh()
          }, 1000)
        } else {
          reject(new Error(result.error || 'Có lỗi xảy ra khi xóa xã'))
        }
      } catch (error) {
        console.error('Error deleting address:', error)
        reject(new Error('Có lỗi xảy ra khi xóa xã'))
      } finally {
        setDeletingId(null)
      }
    })

    toast.promise(
      deletePromise,
      {
        loading: 'Đang xóa xã...',
        success: (message) => message as string,
        error: (err) => err.message === 'Đã hủy xóa' ? '' : err.message,
      },
      {
        success: {
          duration: 3000,
          icon: '✅'
        },
        error: {
          duration: 4000,
          icon: '❌'
        },
        loading: {
          icon: '⏳'
        }
      }
    ).catch(() => {
      // Xử lý trường hợp người dùng hủy xóa
    })
  }

  const handleEdit = (maXa: string) => {
    toast.loading('Đang chuyển đến trang chỉnh sửa...', {
      duration: 1000,
      icon: '📝'
    })
    router.push(`/admin/xa/${maXa}/chinh-sua`)
  }

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      {data.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có xã nào</h3>
            <p className="text-gray-500 max-w-sm">
              Hiện tại chưa có dữ liệu xã nào trong hệ thống. Hãy thêm xã mới để bắt đầu.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {data.map((address) => {
            // Check if any customer in this address has pets with upcoming recheck
            const hasUpcomingRecheck = address.khachHangs.some(customer => 
              customer.hoSoThu.some(pet => 
                pet.lichTheoDoi.some(schedule => {
                  if (!schedule.ngayTaiKham) return false
                  const recheckDate = new Date(schedule.ngayTaiKham)
                  const today = new Date()
                  const threeDaysFromNow = new Date()
                  threeDaysFromNow.setDate(today.getDate() + 3)
                  return recheckDate >= today && recheckDate <= threeDaysFromNow
                })
              )
            )

            return (
            <Card 
               key={address.maXa} 
               className={`group hover:shadow-lg transition-all duration-200 cursor-pointer ${
                 hasUpcomingRecheck 
                   ? 'bg-red-50 border-red-200 hover:border-red-300 hover:bg-red-100' 
                   : 'border-gray-200 hover:border-gray-300'
               }`}
               onClick={() => router.push(`/admin/xa/${address.maXa}`)}
             >
               <CardContent className="p-3 md:p-4">
                 {/* Header */}
                 <div className="flex items-start justify-between mb-3">
                   <div className="flex items-center gap-2 flex-1 min-w-0">
                     <div className="p-1.5 md:p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors flex-shrink-0">
                       <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                         {hasUpcomingRecheck && (
                           <AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-500 flex-shrink-0" />
                         )}
                         <h3 className={`font-medium md:font-semibold truncate text-sm md:text-base transition-colors ${
                           hasUpcomingRecheck 
                             ? 'text-red-700 font-bold hover:text-red-800' 
                             : 'text-gray-900 hover:text-blue-600'
                         }`}>
                           {address.tenXa || 'Chưa có tên'}
                         </h3>
                       </div>
                     </div>
                   </div>
                   
                   {/* Actions Menu */}
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button
                         variant="ghost"
                         size="sm"
                         className="h-6 w-6 md:h-7 md:w-7 p-0 hover:bg-gray-100 flex-shrink-0"
                         onClick={(e) => e.stopPropagation()}
                       >
                         <MoreVertical className="h-3.5 w-3.5 md:h-4 md:w-4" />
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="w-40">
                       <DropdownMenuItem
                         onClick={(e) => {
                           e.stopPropagation()
                           router.push(`/admin/xa/${address.maXa}`)
                         }}
                         className="flex items-center gap-2"
                       >
                         <Eye className="h-4 w-4" />
                         Xem chi tiết
                       </DropdownMenuItem>
                       <DropdownMenuItem
                         onClick={(e) => {
                           e.stopPropagation()
                           router.push(`/admin/khach-hang/them-moi?maXa=${address.maXa}`)
                         }}
                         className="flex items-center gap-2"
                       >
                         <UserPlus className="h-4 w-4" />
                         Thêm khách hàng
                       </DropdownMenuItem>
                       <DropdownMenuItem
                         onClick={(e) => {
                           e.stopPropagation()
                           handleEdit(address.maXa)
                         }}
                         className="flex items-center gap-2"
                       >
                         <Edit className="h-4 w-4" />
                         Chỉnh sửa
                       </DropdownMenuItem>
                       <DropdownMenuItem
                         onClick={(e) => {
                           e.stopPropagation()
                           if (address._count.khachHangs > 0) {
                             toast.error(`Không thể xóa xã "${address.tenXa}" vì đang được sử dụng bởi ${address._count.khachHangs} khách hàng.`, {
                               duration: 4000,
                               icon: '⚠️'
                             })
                             return
                           }
                           handleDelete(address.maXa)
                         }}
                         className="flex items-center gap-2 text-red-600 focus:text-red-600"
                         disabled={deletingId === address.maXa}
                       >
                         <Trash2 className="h-4 w-4" />
                         Xóa
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                 </div>

                 {/* Customer Count Badge */}
                 <div className="flex justify-center">
                   <Badge variant="secondary" className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700">
                     <Users className="h-3 w-3" />
                     <span className="text-xs font-medium">{address._count.khachHangs}</span>
                   </Badge>
                 </div>
              </CardContent>
            </Card>
             )
           })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} xã
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => {
                const params = new URLSearchParams(window.location.search)
                params.set('page', String(pagination.page - 1))
                router.push(`?${params.toString()}`)
              }}
            >
              Trước
            </Button>
            <span className="text-sm">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => {
                const params = new URLSearchParams(window.location.search)
                params.set('page', String(pagination.page + 1))
                router.push(`?${params.toString()}`)
              }}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}