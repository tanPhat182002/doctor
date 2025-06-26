'use client'

import Link from 'next/link'
import { Calendar, Edit, Eye, MoreHorizontal, Phone, Trash2, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
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
import { formatDate, formatPhoneNumber } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Pet {
  maHoSo: string
  tenThu: string
  loai: string
  trangThai: string
  createdAt: Date
  khachHang: {
    maKhachHang: string
    tenKhachHang: string
    soDienThoai: string
    diaChi: string | null
  }
  lichTheoDoi: {
    id: number
    ngayKham: Date
    ngayTaiKham: Date | null
    trangThaiKham: string
  }[]
}

interface PetTableProps {
  pets: Pet[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Status configuration
const statusConfig = {
  KHOE_MANH: {
    label: 'Khỏe mạnh',
    className: 'bg-green-100 text-green-800',
    emoji: '💚'
  },
  THEO_DOI: {
    label: 'Theo dõi',
    className: 'bg-yellow-100 text-yellow-800',
    emoji: '⚠️'
  },
  MANG_THAI: {
    label: 'Mang thai',
    className: 'bg-pink-100 text-pink-800',
    emoji: '🤰'
  },
  SAU_SINH: {
    label: 'Sau sinh',
    className: 'bg-purple-100 text-purple-800',
    emoji: '👶'
  },
  CACH_LY: {
    label: 'Cách ly',
    className: 'bg-red-100 text-red-800',
    emoji: '🚨'
  }
}

// Animal type emojis
const animalEmojis: { [key: string]: string } = {
  CHO: '🐕',
  MEO: '🐱',
  CHIM: '🐦',
  CA: '🐠',
  THO: '🐰',
  HAMSTER: '🐹'
}

function QRCodeTableButton({ petId, petName }: { petId: string; petName: string }) {
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

export function PetTable({ pets, pagination }: PetTableProps) {
  const router = useRouter()
  return (
    <div className="space-y-4" suppressHydrationWarning>
      <Table>
        <TableHeader>
          <TableRow>
         
            <TableHead>Tên thú</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[50px]">Mã QR</TableHead>
            <TableHead>Chủ nhân</TableHead>
            <TableHead>Liên hệ</TableHead>
            <TableHead>Khám gần nhất</TableHead>
     
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pets.map((pet) => {
            const status = statusConfig[pet.trangThai as keyof typeof statusConfig] || {
              label: pet.trangThai,
              className: 'bg-gray-100 text-gray-800',
              emoji: '❓'
            }
            const animalEmoji = animalEmojis[pet.loai] || '🐾'
            const lastCheckup = pet.lichTheoDoi[0]

            return (
              
              <TableRow 
                key={pet.maHoSo} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`/admin/ho-so-thu/${pet.maHoSo}`)}
              >
                  
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{animalEmoji}</span>
                    <span className="font-medium">{pet.tenThu}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{pet.loai.toLowerCase()}</span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${status.className}`}>
                    <span>{status.emoji}</span>
                    {status.label}
                  </span>
                </TableCell>
                <TableCell>
                  <QRCodeTableButton petId={pet.maHoSo} petName={pet.tenThu} />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{pet.khachHang.tenKhachHang}</div>
                    {pet.khachHang.diaChi && (
                      <div className="text-sm text-gray-500 truncate max-w-[150px]">
                        {pet.khachHang.diaChi}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-3 w-3" />
                    <Link 
                      href={`tel:${pet.khachHang.soDienThoai}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {formatPhoneNumber(pet.khachHang.soDienThoai)}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  {lastCheckup ? (
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(lastCheckup.ngayKham)}
                      </div>
                      {lastCheckup.ngayTaiKham && (
                        <div className="text-xs text-gray-500">
                          Tái khám: {formatDate(lastCheckup.ngayTaiKham)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Chưa khám</span>
                  )}
                </TableCell>
             
              
                <TableCell>
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
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

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