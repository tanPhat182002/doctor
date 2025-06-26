'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, User, Phone, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

interface FormData {
  tenKhachHang: string
  soDienThoai: string
  diaChi: string
}

interface FormErrors {
  tenKhachHang?: string
  soDienThoai?: string
  diaChi?: string
  submit?: string
}

export default function ThemKhachHangPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    tenKhachHang: '',
    soDienThoai: '',
    diaChi: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate tên khách hàng
    if (!formData.tenKhachHang.trim()) {
      newErrors.tenKhachHang = 'Tên khách hàng là bắt buộc'
    } else if (formData.tenKhachHang.trim().length < 2) {
      newErrors.tenKhachHang = 'Tên khách hàng phải có ít nhất 2 ký tự'
    }

    // Validate số điện thoại
    if (!formData.soDienThoai.trim()) {
      newErrors.soDienThoai = 'Số điện thoại là bắt buộc'
    } else {
      const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/
      if (!phoneRegex.test(formData.soDienThoai.replace(/\s/g, ''))) {
        newErrors.soDienThoai = 'Số điện thoại không hợp lệ'
      }
    }

    // Validate địa chỉ (optional but if provided, should have minimum length)
    if (formData.diaChi.trim() && formData.diaChi.trim().length < 5) {
      newErrors.diaChi = 'Địa chỉ phải có ít nhất 5 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
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
          diaChi: formData.diaChi.trim() || null
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
      
      // Redirect to customer detail page or back to list
      router.push(`/admin/khach-hang?success=created&id=${result.maKhachHang}`)
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
        <Link href="/admin/khach-hang">
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