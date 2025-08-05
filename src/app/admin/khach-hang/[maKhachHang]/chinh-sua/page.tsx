'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, User, Phone, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Select, type SelectOption } from '@/components/ui/select'
import type { CustomerFormData, CustomerFormErrors } from '@/types'
import { FormValidator } from '@/lib/validation'

interface Address {
  maXa: string
  tenXa: string | null
}

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
  }[]
}

interface EditCustomerPageProps {
  params: Promise<{ maKhachHang: string }>
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
  const router = useRouter()
  const [maKhachHang, setMaKhachHang] = useState<string>('')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [addressOptions, setAddressOptions] = useState<SelectOption[]>([])
  const [formData, setFormData] = useState<CustomerFormData>({
    tenKhachHang: '',
    soDienThoai: '',
    diaChi: '',
    maXa: ''
  })
  const [errors, setErrors] = useState<CustomerFormErrors>({})

  // Get params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setMaKhachHang(resolvedParams.maKhachHang)
    }
    getParams()
  }, [params])

  // Load customer data and addresses
  useEffect(() => {
    if (!maKhachHang) return

    const loadData = async () => {
      try {
        // Load customer data
        const customerResponse = await fetch(`/api/khach-hang/${maKhachHang}`)
        if (customerResponse.ok) {
          const customerData = await customerResponse.json()
          const customerInfo = customerData.data
          setCustomer(customerInfo)
          setFormData({
            tenKhachHang: customerInfo.tenKhachHang,
            soDienThoai: customerInfo.soDienThoai,
            diaChi: customerInfo.diaChi || '',
            maXa: customerInfo.maXa || ''
          })
        } else {
          router.push('/admin/khach-hang')
          return
        }

        // Load addresses
        const addressResponse = await fetch('/api/xa?limit=1000')
        if (addressResponse.ok) {
          const addressData = await addressResponse.json()
          const options: SelectOption[] = addressData.addresses.map((addr: Address) => ({
            value: addr.maXa,
            label: addr.tenXa || 'Không có tên'
          }))
          setAddressOptions(options)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [maKhachHang, router])

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors = FormValidator.validateCustomer(formData)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch(`/api/khach-hang/${maKhachHang}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenKhachHang: formData.tenKhachHang.trim(),
          soDienThoai: formData.soDienThoai.replace(/\s/g, ''),
          diaChi: formData.diaChi.trim() || null,
          maXa: formData.maXa || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 409) {
          setErrors({ soDienThoai: 'Số điện thoại đã tồn tại trong hệ thống' })
        } else {
          setErrors({ submit: errorData.message || 'Có lỗi xảy ra khi cập nhật khách hàng' })
        }
        return
      }

      // Redirect back to customer list
      router.push(`/admin/khach-hang?success=updated&id=${maKhachHang}`)
    } catch (error) {
      console.error('Error updating customer:', error)
      setErrors({ submit: 'Có lỗi xảy ra khi kết nối đến server' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
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
      <div className="flex items-center gap-4">
        <Link href="/admin/khach-hang">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa khách hàng</h1>
          <p className="mt-1 text-sm text-gray-600">
            Cập nhật thông tin khách hàng: {customer.tenKhachHang}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg bg-white shadow-sm">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.submit}</div>
              </div>
            )}

            {/* Thông tin cơ bản */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cơ bản
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Tên khách hàng */}
                <div className="sm:col-span-2">
                  <label htmlFor="tenKhachHang" className="block text-sm font-medium text-gray-700 mb-2">
                    Tên khách hàng *
                  </label>
                  <Input
                    id="tenKhachHang"
                    type="text"
                    value={formData.tenKhachHang}
                    onChange={(e) => handleInputChange('tenKhachHang', e.target.value)}
                    className={errors.tenKhachHang ? 'border-red-500' : ''}
                    placeholder="Nhập tên khách hàng"
                    disabled={isLoading}
                  />
                  {errors.tenKhachHang && (
                    <p className="mt-1 text-sm text-red-600">{errors.tenKhachHang}</p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label htmlFor="soDienThoai" className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Số điện thoại *
                  </label>
                  <Input
                    id="soDienThoai"
                    type="tel"
                    value={formData.soDienThoai}
                    onChange={(e) => handleInputChange('soDienThoai', e.target.value)}
                    className={errors.soDienThoai ? 'border-red-500' : ''}
                    placeholder="0xxx xxx xxx"
                    disabled={isLoading}
                  />
                  {errors.soDienThoai && (
                    <p className="mt-1 text-sm text-red-600">{errors.soDienThoai}</p>
                  )}
                </div>

                {/* Địa chỉ */}
                <div>
                  <label htmlFor="diaChi" className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Địa chỉ
                  </label>
                  <Input
                    id="diaChi"
                    type="text"
                    value={formData.diaChi}
                    onChange={(e) => handleInputChange('diaChi', e.target.value)}
                    className={errors.diaChi ? 'border-red-500' : ''}
                    placeholder="Nhập địa chỉ (tùy chọn)"
                    disabled={isLoading}
                  />
                  {errors.diaChi && (
                    <p className="mt-1 text-sm text-red-600">{errors.diaChi}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Thông tin địa chỉ */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Thông tin xã/phường
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Xã */}
                <div>
                  <label htmlFor="maXa" className="block text-sm font-medium text-gray-700 mb-2">
                    Xã/Phường
                  </label>
                  <Select
                    value={formData.maXa}
                    onValueChange={(value) => handleInputChange('maXa', value)}
                    placeholder="Chọn xã/phường"
                    options={addressOptions}
                    disabled={isLoading}
                    className={errors.maXa ? 'border-red-500' : ''}
                  />
                  {errors.maXa && (
                    <p className="mt-1 text-sm text-red-600">{errors.maXa}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3">
              <Link href="/admin/khach-hang">
                <Button type="button" variant="outline" disabled={isLoading}>
                  Hủy
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Cập nhật khách hàng
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Customer Info */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Thông tin khách hàng:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Mã khách hàng: {customer.maKhachHang}</li>
          <li>• Số thú cưng: {customer.hoSoThu.length}</li>
          <li>• Xã hiện tại: {customer.xa?.tenXa || 'Chưa có'}</li>
        </ul>
      </div>
    </div>
  )
}