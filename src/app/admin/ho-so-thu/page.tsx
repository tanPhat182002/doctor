import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { PetTable } from '@/components/tables/pet-table'
import { SearchBar } from '@/components/shared/search-bar'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

async function getPets(searchParams: {
  search?: string
  page?: string
  limit?: string
  status?: string
  type?: string
  khachHang?: string
  maKhachHang?: string
}) {
  const page = parseInt(searchParams.page || '1')
  const limit = parseInt(searchParams.limit || '10')
  const search = searchParams.search || ''
  const khachHang = searchParams.khachHang || searchParams.maKhachHang

  // Build where clause dynamically
  const whereClause: {
    OR?: Array<{
      tenThu?: { contains: string; mode: 'insensitive' }
      maHoSo?: { contains: string }
      khachHang?: { 
        tenKhachHang?: { contains: string; mode: 'insensitive' }
        soDienThoai?: { contains: string }
      }
    }>
    maKhachHang?: string
  } = {}
  
  // Search filter
  if (search && search.length >= 2) {
    whereClause.OR = [
      { tenThu: { contains: search, mode: 'insensitive' as const } },
      { maHoSo: { contains: search } },
      { khachHang: { tenKhachHang: { contains: search, mode: 'insensitive' as const } } },
      { khachHang: { soDienThoai: { contains: search } } },
    ]
  }

  // Customer filter
  if (khachHang) {
    whereClause.maKhachHang = khachHang
  }

  const [pets, total] = await Promise.all([
    prisma.hoSoThu.findMany({
      where: whereClause,
      include: {
        khachHang: {
          select: {
            maKhachHang: true,
            tenKhachHang: true,
            soDienThoai: true,
            diaChi: true,
          },
        },
        lichTheoDoi: {
          select: {
            id: true,
            ngayKham: true,
            soNgay: true,
            ngayTaiKham: true,
            trangThaiKham: true,
          },
          orderBy: { ngayKham: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.hoSoThu.count({ where: whereClause }),
  ])

  return {
    pets,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// Get customer info if filtering by customer
async function getCustomerInfo(maKhachHang: string) {
  return await prisma.khachHang.findUnique({
    where: { maKhachHang },
    select: {
      maKhachHang: true,
      tenKhachHang: true,
      soDienThoai: true,
      diaChi: true,
    },
  })
}

export default async function HoSoThuPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    search?: string
    page?: string
    limit?: string
    status?: string
    type?: string
    khachHang?: string
    maKhachHang?: string
  }>
}) {
  const params = await searchParams
  const { pets, pagination } = await getPets(params)
  const customerId = params.khachHang || params.maKhachHang
  const customerInfo = customerId ? await getCustomerInfo(customerId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Hồ sơ thú cưng
                </h1>
                {customerInfo && (
                  <span className="text-lg font-medium text-blue-600">
                    {customerInfo.tenKhachHang}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-600 mb-3">
              {customerInfo 
                ? `Quản lý hồ sơ thú cưng của khách hàng ${customerInfo.tenKhachHang}`
                : 'Quản lý thông tin hồ sơ và sức khỏe thú cưng'
              }
            </p>
            {customerInfo && (
              <div className="flex flex-col sm:flex-row gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border">
                  <span className="text-blue-600">📞</span>
                  <span className="font-medium">{customerInfo.soDienThoai}</span>
                </div>
                {customerInfo.diaChi && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border">
                    <span className="text-green-600">📍</span>
                    <span className="font-medium truncate max-w-xs">{customerInfo.diaChi}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {customerInfo && (
              <Link href="/admin/khach-hang">
                <Button variant="outline" className="w-full sm:w-auto">
                  ← Quay lại danh sách
                </Button>
              </Link>
            )}
            <Link href={customerInfo ? `/admin/ho-so-thu/them-moi?maKhachHang=${customerInfo.maKhachHang}` : "/admin/ho-so-thu/them-moi"}>
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Thêm hồ sơ thú
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 max-w-lg">
            <SearchBar placeholder="Tìm kiếm theo tên thú, mã hồ sơ, chủ nhân..." />
          </div>
          <Suspense fallback={
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Đang tải bộ lọc...</span>
            </div>
          }>
          
          </Suspense>
        </div>
      </div>

  
        
       
           
      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Danh sách hồ sơ</h3>
              <p className="text-sm text-gray-600">
                Hiển thị {((pagination.page - 1) * pagination.limit) + 1} đến{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{' '}
                {pagination.total} hồ sơ
              </p>
            </div>
            {pagination.total > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="hidden sm:inline">Trang {pagination.page} / {pagination.totalPages}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs">Đã cập nhật</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <Suspense fallback={<TableSkeleton />}>
          <PetTable data={pets} pagination={pagination} />
        </Suspense>
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="animate-pulse p-4 lg:p-6">
      {/* Table header skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-4">
        <div className="h-4 bg-gray-200 rounded col-span-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
      
      {/* Table rows skeleton */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="grid grid-cols-1 lg:grid-cols-6 gap-4 py-4 border-b border-gray-100">
          <div className="col-span-2">
            <div className="h-4 bg-gray-100 rounded mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-3/4"></div>
          </div>
          <div className="h-4 bg-gray-100 rounded"></div>
          <div className="h-4 bg-gray-100 rounded"></div>
          <div className="h-4 bg-gray-100 rounded"></div>
          <div className="h-8 bg-gray-100 rounded w-8"></div>
        </div>
      ))}
      
      {/* Pagination skeleton */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <div className="h-4 bg-gray-200 rounded w-48"></div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}