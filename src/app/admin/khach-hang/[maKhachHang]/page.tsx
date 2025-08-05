'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, User, Phone, MapPin, Heart, Calendar, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'


interface Customer {
  maKhachHang: string
  tenKhachHang: string
  soDienThoai: string
  diaChi: string | null
  maXa: string | null
  xa: {
    maXa: string
    tenXa: string | null
  } | null
  hoSoThu: {
    maHoSo: string
    tenThu: string
    loai: string
    trangThai: string
    ngayTao: string
  }[]
}

interface CustomerDetailPageProps {
  params: Promise<{ maKhachHang: string }>
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const router = useRouter()
  const [maKhachHang, setMaKhachHang] = useState<string>('')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  // Get params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setMaKhachHang(resolvedParams.maKhachHang)
    }
    getParams()
  }, [params])

  // Load customer data
  useEffect(() => {
    if (!maKhachHang) return

    const loadCustomer = async () => {
      try {
        const response = await fetch(`/api/khach-hang/${maKhachHang}`)
        if (response.ok) {
          const data = await response.json()
          setCustomer(data.data)
        } else {
          router.push('/admin/khach-hang')
        }
      } catch (error) {
        console.error('Error loading customer:', error)
        router.push('/admin/khach-hang')
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomer()
  }, [maKhachHang, router])

  const handleDelete = async () => {
    if (!customer) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/khach-hang/${customer.maKhachHang}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/khach-hang?success=deleted')
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Có lỗi xảy ra khi xóa khách hàng')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Có lỗi xảy ra khi kết nối đến server')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không tìm thấy khách hàng</p>
        <Link href="/admin/khach-hang">
          <Button className="mt-4">Quay lại danh sách</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/khach-hang">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.tenKhachHang}</h1>
            <p className="mt-1 text-sm text-gray-600">
              Mã khách hàng: {customer.maKhachHang}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/admin/khach-hang/${customer.maKhachHang}/chinh-sua`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </Link>
          
          <Button 
            variant="destructive" 
            disabled={customer.hoSoThu.length > 0 || isDeleting}
            onClick={() => {
              if (confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customer.tenKhachHang}"? Hành động này không thể hoàn tác.`)) {
                handleDelete()
              }
            }}
          >
            {isDeleting ? (
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
          </Button>
        </div>
      </div>

      {/* Customer Information */}
      <div className="rounded-lg bg-white shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin khách hàng
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên khách hàng
              </label>
              <p className="text-gray-900">{customer.tenKhachHang}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="inline h-4 w-4 mr-1" />
                Số điện thoại
              </label>
              <p className="text-gray-900">{customer.soDienThoai}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline h-4 w-4 mr-1" />
                Địa chỉ
              </label>
              <p className="text-gray-900">{customer.diaChi || 'Chưa có thông tin'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xã/Phường
              </label>
              <p className="text-gray-900">{customer.xa?.tenXa || 'Chưa có thông tin'}</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Pet Information */}
      <div className="rounded-lg bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Thú cưng ({customer.hoSoThu.length})
            </h3>
            <Link href={`/admin/ho-so-thu/them-moi?khachHang=${customer.maKhachHang}`}>
              <Button size="sm">
                Thêm thú cưng
              </Button>
            </Link>
          </div>
          
          {customer.hoSoThu.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Khách hàng chưa có thú cưng nào</p>
              <Link href={`/admin/ho-so-thu/them-moi?maKhachHang=${customer.maKhachHang}`}>
                <Button className="mt-4" size="sm">
                  Thêm thú cưng đầu tiên
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {customer.hoSoThu.map((pet) => (
                <Link
                  key={pet.maHoSo}
                  href={`/admin/ho-so-thu/${pet.maHoSo}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{pet.tenThu}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      pet.trangThai === 'Khỏe mạnh' 
                        ? 'bg-green-100 text-green-800'
                        : pet.trangThai === 'Đang điều trị'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pet.trangThai}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Loại: {pet.loai}</p>
                  <p className="text-sm text-gray-600">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    Tạo: {new Date(pet.ngayTao).toLocaleDateString('vi-VN')}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Warning for deletion */}
      {customer.hoSoThu.length > 0 && (
        <div className="rounded-lg bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Không thể xóa khách hàng</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Khách hàng này có {customer.hoSoThu.length} thú cưng. 
                Vui lòng xóa tất cả thú cưng trước khi xóa khách hàng.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}