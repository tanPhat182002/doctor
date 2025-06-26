import { Suspense } from 'react'
import Link from 'next/link'
import { Plus,   Download } from 'lucide-react'
import { CustomerTable } from '@/components/tables/customer-table'
import { CustomerFilters } from '@/components/filters/customer-filters'
import { SearchBar } from '@/components/shared/search-bar'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

async function getCustomers(searchParams: {
  search?: string
  page?: string
  limit?: string
}) {
  const page = parseInt(searchParams.page || '1')
  const limit = parseInt(searchParams.limit || '10')
  const search = searchParams.search || ''

  const where = search && search.length >= 2
    ? {
        OR: [
          { tenKhachHang: { contains: search, mode: 'insensitive' as const } },
          { soDienThoai: { contains: search } },
          { diaChi: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [customers, total] = await Promise.all([
    prisma.khachHang.findMany({
      where,
      include: {
        hoSoThu: {
          select: {
            maHoSo: true,
            tenThu: true,
            loai: true,
            trangThai: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.khachHang.count({ where }),
  ])

  return {
    customers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export default async function KhachHangPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; limit?: string }>
}) {
  const params = await searchParams
  const { customers, pagination } = await getCustomers(params)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khách hàng</h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý thông tin khách hàng và thú cưng
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
          <Link href="/admin/khach-hang/them-moi">
             <Button>
               <Plus className="mr-2 h-4 w-4" />
               Thêm khách hàng
             </Button>
           </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="w-full max-w-md">
            <SearchBar
              placeholder="Tìm theo tên, SĐT, địa chỉ..."
              defaultValue={params.search}
            />
          </div>
          <CustomerFilters />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Tìm thấy</span>
          <span className="font-semibold text-gray-900">{pagination.total}</span>
          <span>khách hàng</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white shadow-sm">
        <Suspense fallback={<TableSkeleton />}>
          <CustomerTable 
            customers={customers} 
            pagination={pagination}
          />
        </Suspense>
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="animate-pulse p-6">
      <div className="h-10 bg-gray-200 rounded mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 rounded mb-2" />
      ))}
    </div>
  )
}