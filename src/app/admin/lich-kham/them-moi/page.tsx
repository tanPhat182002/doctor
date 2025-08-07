'use client'

import { useState, useEffect, Suspense } from 'react'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, FileText, Clock, Heart, User, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { ScheduleFormData, ScheduleFormErrors, Pet } from '@/types'

import { FormValidator } from '@/lib/validation'

function ThemLichKhamContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [petId, setPetId] = useState<string | null>(null)

  // Get petId from searchParams after component mounts
  useEffect(() => {
    const id = searchParams.get('petId')
    setPetId(id)
  }, [searchParams])

  // Determine back URL based on where user came from
  const maHoSo = searchParams.get('petId') || searchParams.get('maHoSo')
  const maKhachHang = searchParams.get('maKhachHang')
  const backUrl = maHoSo 
    ? `/admin/ho-so-thu/${maHoSo}${maKhachHang ? `?maKhachHang=${maKhachHang}` : ''}`
    : '/admin/lich-kham'

  const [formData, setFormData] = useState<ScheduleFormData>({
    petId: petId || '',
    ngayKham: '',
    ngayTaiKham: '',
    ghiChu: '',
    trangThaiKham: 'CHUA_KHAM'
  })

  const [errors, setErrors] = useState<ScheduleFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pet, setPet] = useState<Pet | null>(null)

  // Fetch pet information if petId is provided
  useEffect(() => {
    if (petId) {
      fetch(`/api/ho-so-thu/${petId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPet(data.data)
          }
        })
        .catch(err => console.error('Error fetching pet:', err))
    }
  }, [petId])

  const validateForm = (): boolean => {
    const newErrors = FormValidator.validateSchedule(formData)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ScheduleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/lich-kham', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maHoSo: formData.petId,
          ngayKham: formData.ngayKham,
          ngayTaiKham: formData.ngayTaiKham || null,
          ghiChu: formData.ghiChu || null,
          trangThaiKham: formData.trangThaiKham
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Tạo lịch khám thành công!', {
          duration: 3000,
          icon: '✅'
        })
        setTimeout(() => {
          router.push(backUrl)
        }, 1000)
      } else {
        console.error('Error creating schedule:', result.error)
        toast.error('Có lỗi xảy ra khi tạo lịch khám. Vui lòng thử lại.', {
          duration: 4000,
          icon: '❌'
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Có lỗi xảy ra khi tạo lịch khám. Vui lòng thử lại.', {
        duration: 4000,
        icon: '❌'
      })
    } finally {
      setIsSubmitting(false)
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
            <Calendar className="h-6 w-6" />
            Thêm lịch khám mới
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Tạo lịch khám mới cho thú cưng trong hệ thống
          </p>
        </div>
      </div>

      {/* Pet Information Card */}
      {pet && (
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Thông tin thú cưng
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Tên thú</p>
                <p className="text-sm font-semibold text-blue-900">{pet.tenThu}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-indigo-600 font-medium">Mã hồ sơ</p>
                <p className="text-sm font-semibold text-indigo-900">{pet.maHoSo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium">Chủ nhân</p>
                <p className="text-sm font-semibold text-purple-900">{pet.khachHang.tenKhachHang}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white shadow-sm">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin lịch khám */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Thông tin lịch khám
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Pet ID (hidden if coming from pet table) */}
                {!petId && (
                  <div className="sm:col-span-2 space-y-2">
                    <label htmlFor="petId" className="block text-sm font-medium text-gray-700 mb-2">
                      Mã hồ sơ thú cưng <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="petId"
                      value={formData.petId}
                      onChange={(e) => handleInputChange('petId', e.target.value)}
                      placeholder="Nhập mã hồ sơ thú cưng"
                      className={errors.petId ? 'border-red-500 focus-visible:border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.petId && (
                      <p className="mt-1 text-sm text-red-600">{errors.petId}</p>
                    )}
                  </div>
                )}

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
                    disabled={isSubmitting}
                  />
                  {errors.ngayKham && (
                    <p className="mt-1 text-sm text-red-600">{errors.ngayKham}</p>
                  )}
                </div>

                {/* Ngày tái khám */}
                <div>
                  <label htmlFor="ngayTaiKham" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Ngày tái khám
                  </label>
                  <Input
                    id="ngayTaiKham"
                    type="datetime-local"
                    value={formData.ngayTaiKham}
                    onChange={(e) => handleInputChange('ngayTaiKham', e.target.value)}
                    className={errors.ngayTaiKham ? 'border-red-500 focus-visible:border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.ngayTaiKham && (
                    <p className="mt-1 text-sm text-red-600">{errors.ngayTaiKham}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Để trống nếu chưa xác định ngày tái khám
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
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('trangThaiKham', e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.trangThaiKham ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={isSubmitting}
                  >
                    
               
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
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('ghiChu', e.target.value)}
                    placeholder="Nhập ghi chú về tình trạng sức khỏe, triệu chứng, hoặc kết quả khám..."
                    rows={3}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ghiChu ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={isSubmitting}
                  />
                  {errors.ghiChu && (
                    <p className="mt-1 text-sm text-red-600">{errors.ghiChu}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3">
              <Link href={backUrl}>
                 <Button type="button" variant="outline" disabled={isSubmitting}>
                   Hủy
                 </Button>
               </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Tạo lịch khám
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
          <li>• Ngày khám và trạng thái khám là thông tin bắt buộc</li>
          <li>• Ngày tái khám có thể để trống nếu chưa xác định</li>
          <li>• Ghi chú giúp theo dõi tình trạng sức khỏe của thú cưng</li>
          <li>• Sau khi tạo thành công, lịch khám sẽ xuất hiện trong danh sách</li>
          <li>• Bạn có thể chỉnh sửa hoặc cập nhật trạng thái sau khi tạo</li>
        </ul>
      </div>
    </div>
  )
}

export default function ThemLichKhamPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </div>
    }>
      <ThemLichKhamContent />
    </Suspense>
  )
}