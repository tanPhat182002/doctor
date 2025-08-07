'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, FileText, User, Heart, Loader2, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { CustomerSearch } from '@/components/shared/customer-search'
import type { PetFormData, PetFormErrors } from '@/types'
import { EXAM_STATUSES } from '@/lib/status-manager'
import { FormValidator } from '@/lib/validation'
import { calculateFollowUpDate, calculateDaysDifference } from '@/utils/date-calculator'

function ThemHoSoThuPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<PetFormData>({
    tenThu: '',
    soNgay: '',
    maKhachHang: '',
    // Lịch theo dõi
    ngayKham: new Date().toISOString().slice(0, 16), // Current datetime
    ngayTaiKham: '',
    ghiChu: '',
    trangThaiKham: 'CHUA_KHAM'
  })
  const [errors, setErrors] = useState<PetFormErrors>({})



  const isUpdatingRef = useRef(false)

  // Auto-fill customer info from URL parameter and determine back URL
  const [backUrl, setBackUrl] = useState('/admin/ho-so-thu')
  
  useEffect(() => {
    const maKhachHang = searchParams.get('maKhachHang')
    if (maKhachHang) {
      setFormData(prev => ({ ...prev, maKhachHang }))
      // If maKhachHang is provided, set back URL to that customer's detail page
      setBackUrl(`/admin/khach-hang/${maKhachHang}`)
    }
  }, [searchParams])

  // Auto calculate ngayTaiKham when ngayKham or soNgay changes
  useEffect(() => {
    if (isUpdatingRef.current) return
    
    if (formData.ngayKham && formData.soNgay) {
      const calculatedDate = calculateFollowUpDate(formData.ngayKham, parseInt(formData.soNgay))
      
      if (calculatedDate && calculatedDate !== formData.ngayTaiKham) {
        isUpdatingRef.current = true
        setFormData(prev => ({ ...prev, ngayTaiKham: calculatedDate }))
        setTimeout(() => { isUpdatingRef.current = false }, 0)
      }
    }
  }, [formData.ngayKham, formData.soNgay, formData.ngayTaiKham])

  // Auto calculate soNgay when ngayTaiKham changes
  useEffect(() => {
    if (isUpdatingRef.current) return
    
    if (formData.ngayKham && formData.ngayTaiKham) {
      const calculatedDays = calculateDaysDifference(formData.ngayKham, formData.ngayTaiKham)
      
      if (calculatedDays !== null && calculatedDays.toString() !== formData.soNgay) {
        isUpdatingRef.current = true
        setFormData(prev => ({ ...prev, soNgay: calculatedDays.toString() }))
        setTimeout(() => { isUpdatingRef.current = false }, 0)
      }
    }
  }, [formData.ngayKham, formData.ngayTaiKham, formData.soNgay])

  const validateForm = (): boolean => {
    const newErrors = FormValidator.validatePet(formData)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof PetFormData, value: string) => {
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
      const response = await fetch('/api/ho-so-thu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenThu: formData.tenThu.trim(),
          soNgay: parseInt(formData.soNgay) || 0,
          maKhachHang: formData.maKhachHang,
          // Lịch theo dõi
          lichTheoDoi: {
            ngayKham: new Date(formData.ngayKham),
            soNgay: parseInt(formData.soNgay) || 0,
            ngayTaiKham: formData.ngayTaiKham ? new Date(formData.ngayTaiKham) : null,
            ghiChu: formData.ghiChu.trim() || null,
            trangThaiKham: formData.trangThaiKham
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrors({ submit: errorData.message || 'Có lỗi xảy ra khi tạo hồ sơ thú' })
        return
      }

      const result = await response.json()
      
      // Redirect to pet list with customer filter
      const maKhachHang = searchParams.get('maKhachHang')
      if (maKhachHang) {
        // If came from customer detail page, go to pet list with customer filter
        router.push(`/admin/ho-so-thu?khachHang=${maKhachHang}&success=created&id=${result.maHoSo}`)
      } else {
        // Otherwise go to pet detail page
        router.push(`/admin/ho-so-thu/${result.maHoSo}?success=created`)
      }
    } catch (error) {
      console.error('Error creating pet record:', error)
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Thêm hồ sơ thú mới
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Nhập thông tin để tạo hồ sơ thú mới trong hệ thống
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

            {/* Thông tin thú cưng */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Thông tin thú cưng
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Tên thú */}
                <div>
                  <label htmlFor="tenThu" className="block text-sm font-medium text-gray-700 mb-2">
                    Tên thú <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="tenThu"
                    type="text"
                    value={formData.tenThu}
                    onChange={(e) => handleInputChange('tenThu', e.target.value)}
                    placeholder="Nhập tên thú cưng"
                    className={errors.tenThu ? 'border-red-500 focus-visible:border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.tenThu && (
                    <p className="mt-1 text-sm text-red-600">{errors.tenThu}</p>
                  )}
                </div>



                {/* Chủ nhân */}
                <div>
                  <label htmlFor="maKhachHang" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Chủ nhân <span className="text-red-500">*</span>
                  </label>
                  <CustomerSearch
                    value={formData.maKhachHang}
                    onChange={(customerId) => handleInputChange('maKhachHang', customerId)}
                    error={errors.maKhachHang}
                    disabled={isLoading}
                    placeholder="Tìm kiếm khách hàng theo tên hoặc số điện thoại..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Không tìm thấy khách hàng? 
                    <Link href="/admin/khach-hang/them-moi" className="text-blue-600 hover:underline">
                      Thêm khách hàng mới
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Lịch theo dõi */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lịch theo dõi đầu tiên
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Ngày khám */}
                <div>
                  <label htmlFor="ngayKham" className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày khám <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="ngayKham"
                    type="datetime-local"
                    value={formData.ngayKham}
                    onChange={(e) => handleInputChange('ngayKham', e.target.value)}
                    className={errors.ngayKham ? 'border-red-500 focus-visible:border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.ngayKham && (
                    <p className="mt-1 text-sm text-red-600">{errors.ngayKham}</p>
                  )}
                </div>

                {/* Số ngày */}
                <div>
                  <label htmlFor="soNgay" className="block text-sm font-medium text-gray-700 mb-2">
                    Số ngày theo dõi <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="soNgay"
                    type="number"
                    min="0"
                    value={formData.soNgay}
                    onChange={(e) => handleInputChange('soNgay', e.target.value)}
                    placeholder="Nhập số ngày theo dõi"
                    className={errors.soNgay ? 'border-red-500 focus-visible:border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.soNgay && (
                    <p className="mt-1 text-sm text-red-600">{errors.soNgay}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Ngày tái khám sẽ được tự động tính: Ngày khám + Số ngày theo dõi
                  </p>
                </div>

                {/* Ngày tái khám */}
                <div>
                  <label htmlFor="ngayTaiKham" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Ngày tái khám (tự động tính)
                  </label>
                  <Input
                    id="ngayTaiKham"
                    type="datetime-local"
                    value={formData.ngayTaiKham}
                    onChange={(e) => handleInputChange('ngayTaiKham', e.target.value)}
                    disabled={isLoading}
                    className="bg-gray-50"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Có thể chỉnh sửa thủ công nếu cần
                  </p>
                </div>

                {/* Trạng thái khám */}
                <div>
                  <label htmlFor="trangThaiKham" className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái khám <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="trangThaiKham"
                    value={formData.trangThaiKham}
                    onChange={(e) => handleInputChange('trangThaiKham', e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.trangThaiKham ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    {EXAM_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.emoji} {status.label}
                      </option>
                    ))}
                  </select>
                  {errors.trangThaiKham && (
                    <p className="mt-1 text-sm text-red-600">{errors.trangThaiKham}</p>
                  )}
                </div>

                {/* Ghi chú */}
                <div className="sm:col-span-2">
                  <label htmlFor="ghiChu" className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú khám
                  </label>
                  <textarea
                    id="ghiChu"
                    value={formData.ghiChu}
                    onChange={(e) => handleInputChange('ghiChu', e.target.value)}
                    placeholder="Nhập ghi chú về tình trạng sức khỏe, triệu chứng, hoặc kết quả khám..."
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
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
                    Tạo hồ sơ thú
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
          <li>• Thông tin thú cưng, ngày khám và số ngày theo dõi là bắt buộc</li>
          <li>• Tên thú nên đặt dễ nhớ và dễ phân biệt</li>
          <li>• Ngày tái khám và số ngày theo dõi sẽ tự động đồng bộ với nhau</li>
          <li>• Khi nhập số ngày, ngày tái khám sẽ được tự động tính</li>
          <li>• Khi chọn ngày tái khám, số ngày theo dõi sẽ được tự động tính</li>
          <li>• Sau khi tạo thành công, bạn có thể thêm nhiều lịch khám khác</li>
        </ul>
      </div>
    </div>
  )
}

export default function ThemHoSoThuPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThemHoSoThuPageContent />
    </Suspense>
  )
}