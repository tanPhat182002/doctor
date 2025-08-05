import Link from 'next/link'
import { MoreHorizontal, Edit, Trash2, Eye, Calendar, Phone, User } from 'lucide-react'
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
import { useExamStatus } from '@/hooks/useStatusManager'

import type { ScheduleTableData, ScheduleTableProps, ExamStatus } from '@/types'
import { ANIMAL_EMOJIS } from '@/types/constants'



export function ScheduleTable({ data: schedules, pagination }: ScheduleTableProps) {
  const examStatus = useExamStatus()
  
  return (
    <div className="space-y-4" suppressHydrationWarning>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thú cưng</TableHead>
            <TableHead>Chủ nhân</TableHead>
            <TableHead>Ngày khám</TableHead>
            <TableHead>Ngày tái khám</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ghi chú</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule: ScheduleTableData) => {
            const status = examStatus.getConfig(schedule.trangThaiKham as ExamStatus) || {
              label: schedule.trangThaiKham,
              className: 'bg-gray-100 text-gray-800',
              emoji: '❓'
            }
            const animalEmoji = ANIMAL_EMOJIS[schedule.hoSoThu.loai] || '🐾'

            return (
              <TableRow key={schedule.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{animalEmoji}</span>
                      <Link 
                        href={`/admin/ho-so-thu/${schedule.hoSoThu.maHoSo}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {schedule.hoSoThu.tenThu}
                      </Link>
                    </div>
                    <div className="text-xs text-gray-500">
                      {schedule.hoSoThu.loai} • {schedule.hoSoThu.maHoSo}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="font-medium">{schedule.hoSoThu.khachHang.tenKhachHang}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      <Link 
                        href={`tel:${schedule.hoSoThu.khachHang.soDienThoai}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {formatPhoneNumber(schedule.hoSoThu.khachHang.soDienThoai)}
                      </Link>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {formatDate(schedule.ngayKham)}
                  </div>
                </TableCell>
                <TableCell>
                  {schedule.ngayTaiKham ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {formatDate(schedule.ngayTaiKham)}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Không có</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${status.className}`}>
                    <span>{status.emoji}</span>
                    {status.label}
                  </span>
                </TableCell>
                <TableCell>
                  {schedule.ghiChu ? (
                    <div className="max-w-[200px] truncate text-sm" title={schedule.ghiChu}>
                      {schedule.ghiChu}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Không có</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/ho-so-thu/${schedule.hoSoThu.maHoSo}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem hồ sơ
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/lich-kham/${schedule.id}/chinh-sua`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/lich-kham/them-moi?petId=${schedule.hoSoThu.maHoSo}`}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Thêm lịch mới
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
          {pagination.total} lịch khám
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