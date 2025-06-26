import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, Download, FileText } from 'lucide-react'
import { PetTable } from '@/components/tables/pet-table'
import { PetFilters } from '@/components/filters/pet-filters'
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
}) {
  const page = parseInt(searchParams.page || '1')
  const limit = parseInt(searchParams.limit || '10')
  const search = searchParams.search || ''
  const status = searchParams.status
  const type = searchParams.type
  const khachHang = searchParams.khachHang

  // Build where clause dynamically
  const whereClause: {
    OR?: Array<{
      tenThu?: { contains: string; mode: 'insensitive' }
      maHoSo?: { contains: string }
      loai?: { contains: string; mode: 'insensitive' }
      khachHang?: { 
        tenKhachHang?: { contains: string; mode: 'insensitive' }
        soDienThoai?: { contains: string }
      }
    }>
    trangThai?: string
    loai?: string
    maKhachHang?: string
  } = {}
  
  // Search filter
  if (search && search.length >= 2) {
    whereClause.OR = [
      { tenThu: { contains: search, mode: 'insensitive' as const } },
      { maHoSo: { contains: search } },
      { loai: { contains: search, mode: 'insensitive' as const } },
      { khachHang: { tenKhachHang: { contains: search, mode: 'insensitive' as const } } },
      { khachHang: { soDienThoai: { contains: search } } },
    ]
  }

  // Status filter
  if (status && status !== 'all') {
    whereClause.trangThai = status
  }

  // Type filter
  if (type && type !== 'all') {
    whereClause.loai = type
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
  }>
}) {
  const params = await searchParams
  const { pets, pagination } = await getPets(params)
  const customerInfo = params.khachHang ? await getCustomerInfo(params.khachHang) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Hồ sơ thú
            {customerInfo && (
              <span className="text-lg font-normal text-gray-600">
                - {customerInfo.tenKhachHang}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {customerInfo 
              ? `Danh sách hồ sơ thú cưng của khách hàng ${customerInfo.tenKhachHang}`
              : 'Quản lý thông tin hồ sơ và sức khỏe thú cưng'
            }
          </p>
          {customerInfo && (
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <span>📞 {customerInfo.soDienThoai}</span>
              {customerInfo.diaChi && <span>📍 {customerInfo.diaChi}</span>}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
          <div className="flex items-center gap-3">
            {customerInfo && (
              <Link href="/admin/khach-hang">
                <Button variant="outline">
                  ← Quay lại danh sách khách hàng
                </Button>
              </Link>
            )}
            <Link href={customerInfo ? `/admin/ho-so-thu/them-moi?maKhachHang=${customerInfo.maKhachHang}` : "/admin/ho-so-thu/them-moi"}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm hồ sơ thú
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <SearchBar placeholder="Tìm kiếm theo tên thú, chủ nhân..." />
        </div>
        <Suspense fallback={<div>Loading filters...</div>}>
          <PetFilters />
        </Suspense>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng hồ sơ</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Khỏe mạnh</p>
              <p className="text-2xl font-bold text-green-600">
                {pets.filter(pet => pet.trangThai === 'KHOE_MANH').length}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-lg">💚</span>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Theo dõi</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pets.filter(pet => pet.trangThai === 'THEO_DOI').length}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-600 text-lg">⚠️</span>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cách ly</p>
              <p className="text-2xl font-bold text-red-600">
                {pets.filter(pet => pet.trangThai === 'CACH_LY').length}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-lg">🚨</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white shadow-sm">
        <Suspense fallback={<TableSkeleton />}>
          <PetTable pets={pets} pagination={pagination} />
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