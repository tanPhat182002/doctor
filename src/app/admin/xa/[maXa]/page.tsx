import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, MapPin, Edit, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerTable } from '@/components/tables/customer-table'
import { SearchBar } from '@/components/shared/search-bar'
import type { CustomerTableData } from '@/types'

interface Address {
  maXa: string
  tenXa: string
  _count: {
    khachHangs: number
  }
}

// Using CustomerTableData from types instead of local interface

interface AddressDetailPageProps {
  params: Promise<{ maXa: string }>
  searchParams: Promise<{
    search?: string
    page?: string
    limit?: string
  }>
}

export default async function AddressDetailPage({ params, searchParams }: AddressDetailPageProps) {
  const { maXa } = await params
  const searchParamsResolved = await searchParams
  const search = searchParamsResolved.search || ''
  const page = parseInt(searchParamsResolved.page || '1')
  const limit = parseInt(searchParamsResolved.limit || '10')

  // Fetch address details
  const addressResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/xa/${maXa}`,
    { cache: 'no-store' }
  )

  if (!addressResponse.ok) {
    notFound()
  }

  const addressData = await addressResponse.json()
   const address: Address = addressData.data

  // Fetch customers for this address
  const customersResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/khach-hang?maXa=${maXa}&search=${search}&page=${page}&limit=${limit}`,
    { cache: 'no-store' }
  )

  if (!customersResponse.ok) {
    throw new Error('Failed to fetch customers')
  }

  const customersData = await customersResponse.json()
     const customers: CustomerTableData[] = customersData.customers || []
     const pagination = customersData.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 }

   if (!address) {
     notFound()
   }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/xa">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>
      </div>

      {/* Address Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin xã</h3>
                  <p className="text-sm text-gray-600">Chi tiết địa phương</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="bg-white hover:bg-gray-50">
                <Link href={`/admin/xa/${maXa}/chinh-sua`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Link>
              </Button>
            </div>
            <div className="space-y-3">
              <div className="bg-white/60 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600 mb-1">Tên xã</p>
                <p className="text-xl font-bold text-gray-900">{address.tenXa}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        
      </div>

      {/* Customers Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Danh sách khách hàng ({pagination.total})
            </CardTitle>
            <Button asChild>
              <Link href={`/admin/khach-hang/them-moi?maXa=${maXa}`}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm khách hàng
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <SearchBar 
              defaultValue={search}
              placeholder="Tìm kiếm khách hàng theo tên, số điện thoại..."
            />
          </div>

          {/* Customers Table */}
          <Suspense fallback={<TableSkeleton />}>
            <CustomerTable 
               data={customers}
               pagination={pagination}
             />
          </Suspense>
        </CardContent>
      </Card>
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