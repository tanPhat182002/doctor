'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {  formatPhoneNumber } from '@/lib/utils'

interface Customer {
  maKhachHang: string
  tenKhachHang: string
  soDienThoai: string
  diaChi: string | null
  createdAt: Date
  hoSoThu: {
    maHoSo: string
    tenThu: string
    loai: string
    trangThai: string
  }[]
}

interface CustomerTableProps {
  customers: Customer[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function CustomerTable({ customers, pagination }: CustomerTableProps) {
  const router = useRouter()

  const handleRowClick = (maKhachHang: string) => {
    router.push(`/admin/ho-so-thu?khachHang=${maKhachHang}`)
  }

  return (
    <div className="space-y-4" suppressHydrationWarning>
      <Table>
        <TableHeader>
          <TableRow>

            <TableHead>Tên khách hàng</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Số thú cưng</TableHead>
            
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow 
              key={customer.maKhachHang}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleRowClick(customer.maKhachHang)}
            >
              
              <TableCell>{customer.tenKhachHang}</TableCell>
              <TableCell>{formatPhoneNumber(customer.soDienThoai)}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {customer.diaChi || 'Chưa có địa chỉ'}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  {customer.hoSoThu.length} thú cưng
                </span>
              </TableCell>
             
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
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