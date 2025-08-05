import { Suspense } from 'react'
import Link from 'next/link'
import { Plus,  MapPin } from 'lucide-react'
import { AddressTable } from '@/components/tables/address-table'
import { SearchBar } from '@/components/shared/search-bar'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

async function getAddresses(searchParams: {
  search?: string
  page?: string
  limit?: string
}) {
  const page = parseInt(searchParams.page || '1')
  const limit = parseInt(searchParams.limit || '10')
  const search = searchParams.search || ''

  const where = search && search.length >= 2
    ? {
        tenXa: {
          contains: search,
          mode: 'insensitive' as const
        }
      }
    : {}

  const [addresses, total] = await Promise.all([
    prisma.address.findMany({
      where,
      include: {
        _count: {
          select: {
            khachHangs: true
          }
        },
        khachHangs: {
          include: {
            hoSoThu: {
              include: {
                lichTheoDoi: {
                  select: {
                    ngayTaiKham: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { tenXa: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.address.count({ where }),
  ])

  return {
    addresses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export default async function XaPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; limit?: string }>
}) {
  const params = await searchParams
  const { addresses, pagination } = await getAddresses(params)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Quản lý xã
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý danh sách các xã/phường trong hệ thống
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          
          <Link href="/admin/xa/them-moi">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm xã mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="w-full max-w-md">
            <SearchBar
              placeholder="Tìm kiếm theo tên xã..."
              defaultValue={params.search}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Tìm thấy</span>
          <span className="font-semibold text-gray-900">{pagination.total}</span>
          <span>xã</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white shadow-sm">
        <Suspense fallback={<TableSkeleton />}>
          <AddressTable 
            data={addresses} 
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