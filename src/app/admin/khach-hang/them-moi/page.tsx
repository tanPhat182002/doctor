'use client'

import { useState, useEffect, Suspense } from 'react'
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

function ThemKhachHangContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [addressOptions, setAddressOptions] = useState<SelectOption[]>([])
  const [formData, setFormData] = useState<CustomerFormData>({
    tenKhachHang: '',
    soDienThoai: '',
    diaChi: '',
    maXa: ''
  })
  const [errors, setErrors] = useState<CustomerFormErrors>({})

  // Load addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/xa?limit=1000') // Get all addresses
        const data = await response.json()
        if (data.success) {
          // Convert to SelectOption format
          const options: SelectOption[] = data.data.map((addr: Address) => ({
            value: addr.maXa,
            label: addr.tenXa || 'Không có tên'
          }))
          setAddressOptions(options)
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
      } finally {
        setLoadingAddresses(false)
      }
    }

    fetchAddresses()
  }, [])

  // Auto-fill maXa from URL parameter and determine back URL
  const [backUrl, setBackUrl] = useState('/admin/khach-hang')
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const maXaParam = urlParams.get('maXa')
      if (maXaParam) {
        setFormData(prev => ({ ...prev, maXa: maXaParam }))
        // If maXa is provided, set back URL to that xa's detail page
        setBackUrl(`/admin/xa/${maXaParam}`)
      }
    }
  }, [])

  const validateForm = (): boolean => {
    const newErrors = FormValidator.validateCustomer(formData)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/khach-hang', {
        method: 'POST',
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
          setErrors({ submit: errorData.message || 'Có lỗi xảy ra khi tạo khách hàng' })
        }
        return
      }

      const result = await response.json()
      
      // Redirect back to the appropriate page
      const urlParams = new URLSearchParams(window.location.search)
      const maXaParam = urlParams.get('maXa')
      if (maXaParam) {
        // If came from xa detail page, go back there
        router.push(`/admin/xa/${maXaParam}?success=created&id=${result.maKhachHang}`)
      } else {
        // Otherwise go to customer list
        router.push(`/admin/khach-hang?success=created&id=${result.maKhachHang}`)
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      setErrors({ submit: 'Có lỗi xảy ra khi kết nối đến server' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={backUrl}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm khách hàng mới</h1>
          <p className="mt-1 text-sm text-gray-600">
            Nhập thông tin để tạo khách hàng mới trong hệ thống
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
                    Tên khách hàng <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="tenKhachHang"
                    type="text"
                    value={formData.tenKhachHang}
                    onChange={(e) => handleInputChange('tenKhachHang', e.target.value)}
                    placeholder="Nhập tên khách hàng"
                    className={errors.tenKhachHang ? 'border-red-500 focus-visible:border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.tenKhachHang && (
                    <p className="mt-1 text-sm text-red-600">{errors.tenKhachHang}</p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label htmlFor="soDienThoai" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="soDienThoai"
                    type="tel"
                    value={formData.soDienThoai}
                    onChange={(e) => handleInputChange('soDienThoai', e.target.value)}
                    placeholder="0xxx xxx xxx"
                    className={errors.soDienThoai ? 'border-red-500 focus-visible:border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.soDienThoai && (
                    <p className="mt-1 text-sm text-red-600">{errors.soDienThoai}</p>
                  )}
                </div>

                {/* Địa chỉ */}
                <div>
                  <label htmlFor="diaChi" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Địa chỉ
                  </label>
                  <Input
                    id="diaChi"
                    type="text"
                    value={formData.diaChi}
                    onChange={(e) => handleInputChange('diaChi', e.target.value)}
                    placeholder="Nhập địa chỉ (tùy chọn)"
                    className={errors.diaChi ? 'border-red-500 focus-visible:border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.diaChi && (
                    <p className="mt-1 text-sm text-red-600">{errors.diaChi}</p>
                  )}
                </div>

                {/* Xã/Phường */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                     <MapPin className="h-4 w-4" />
                     Xã/Phường
                   </label>
                   <Select
                      value={formData.maXa}
                      onValueChange={(value) => handleInputChange('maXa', value)}
                      placeholder="Chọn xã/phường"
                      options={addressOptions}
                      disabled={isLoading}
                      loading={loadingAddresses}
                      error={!!errors.maXa}
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
              <Link href={backUrl}>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Hủy
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Tạo khách hàng
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Help Text */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Lưu ý:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Tên khách hàng và số điện thoại là thông tin bắt buộc</li>
          <li>• Số điện thoại phải là số Việt Nam hợp lệ (10-11 số)</li>
          <li>• Mỗi số điện thoại chỉ có thể đăng ký một lần trong hệ thống</li>
          <li>• Sau khi tạo thành công, bạn có thể thêm thông tin thú cưng cho khách hàng</li>
        </ul>
      </div>
    </div>
  )
}

export default function ThemKhachHangPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThemKhachHangContent />
    </Suspense>
  )
}