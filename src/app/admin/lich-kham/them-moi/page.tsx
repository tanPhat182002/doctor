'use client'

import { useState, useEffect } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// Removed Card import - using native HTML elements instead
import { ArrowLeft, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'

interface FormData {
  petId: string
  ngayKham: string
  ngayTaiKham: string
  ghiChu: string
  trangThaiKham: string
}

interface FormErrors {
  petId?: string
  ngayKham?: string
  ngayTaiKham?: string
  ghiChu?: string
  trangThaiKham?: string
}

interface Pet {
  maHoSo: string
  tenThu: string
  loai: string
  trangThai: string
  khachHang: {
    tenKhachHang: string
    soDienThoai: string
  }
}

export default function ThemLichKhamPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [petId, setPetId] = useState<string | null>(null)

  // Get petId from searchParams after component mounts
  useEffect(() => {
    const id = searchParams.get('petId')
    setPetId(id)
  }, [searchParams])

  const [formData, setFormData] = useState<FormData>({
    petId: petId || '',
    ngayKham: '',
    ngayTaiKham: '',
    ghiChu: '',
    trangThaiKham: 'CHUA_KHAM'
  })

  const [errors, setErrors] = useState<FormErrors>({})
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
    const newErrors: FormErrors = {}

    if (!formData.petId.trim()) {
      newErrors.petId = 'Vui lòng chọn thú cưng'
    }

    if (!formData.ngayKham.trim()) {
      newErrors.ngayKham = 'Vui lòng chọn ngày khám'
    } else {
      const examDate = new Date(formData.ngayKham)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (examDate < today) {
        newErrors.ngayKham = 'Ngày khám không thể là ngày trong quá khứ'
      }
    }

    if (formData.ngayTaiKham.trim()) {
      const reExamDate = new Date(formData.ngayTaiKham)
      const examDate = new Date(formData.ngayKham)
      if (reExamDate <= examDate) {
        newErrors.ngayTaiKham = 'Ngày tái khám phải sau ngày khám'
      }
    }

    if (!formData.trangThaiKham.trim()) {
      newErrors.trangThaiKham = 'Vui lòng chọn trạng thái khám'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
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
        router.push('/admin/ho-so-thu')
      } else {
        console.error('Error creating schedule:', result.error)
        alert('Có lỗi xảy ra khi tạo lịch khám. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Có lỗi xảy ra khi tạo lịch khám. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link 
          href="/admin/ho-so-thu" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách hồ sơ
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Thêm lịch khám mới</h1>
        <p className="text-gray-600 mt-2">
          Tạo lịch khám mới cho thú cưng. Ngày khám và trạng thái khám là bắt buộc.
        </p>
      </div>

      {/* Pet Information Card */}
      {pet && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Thông tin thú cưng
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Tên thú cưng</label>
              <p className="text-sm text-gray-900">{pet.tenThu}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Loại</label>
              <p className="text-sm text-gray-900">{pet.loai}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Chủ nhân</label>
              <p className="text-sm text-gray-900">{pet.khachHang.tenKhachHang}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
              <p className="text-sm text-gray-900">{pet.khachHang.soDienThoai}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Thông tin lịch khám
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Điền thông tin chi tiết cho lịch khám mới
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pet ID (hidden if coming from pet table) */}
            {!petId && (
              <div className="space-y-2">
                <label htmlFor="petId">Mã hồ sơ thú cưng *</label>
                <Input
                  id="petId"
                  value={formData.petId}
                  onChange={(e) => handleInputChange('petId', e.target.value)}
                  placeholder="Nhập mã hồ sơ thú cưng"
                  className={errors.petId ? 'border-red-500' : ''}
                />
                {errors.petId && (
                  <p className="text-sm text-red-600">{errors.petId}</p>
                )}
              </div>
            )}

            {/* Examination Date */}
            <div className="space-y-2">
              <label htmlFor="ngayKham">Ngày khám *</label>
              <Input
                id="ngayKham"
                type="datetime-local"
                value={formData.ngayKham}
                onChange={(e) => handleInputChange('ngayKham', e.target.value)}
                className={errors.ngayKham ? 'border-red-500' : ''}
              />
              {errors.ngayKham && (
                <p className="text-sm text-red-600">{errors.ngayKham}</p>
              )}
            </div>

            {/* Re-examination Date */}
            <div className="space-y-2">
              <label htmlFor="ngayTaiKham">Ngày tái khám</label>
              <Input
                id="ngayTaiKham"
                type="datetime-local"
                value={formData.ngayTaiKham}
                onChange={(e) => handleInputChange('ngayTaiKham', e.target.value)}
                className={errors.ngayTaiKham ? 'border-red-500' : ''}
              />
              {errors.ngayTaiKham && (
                <p className="text-sm text-red-600">{errors.ngayTaiKham}</p>
              )}
              <p className="text-sm text-gray-500">
                Tùy chọn. Nếu có, ngày tái khám phải sau ngày khám.
              </p>
            </div>

            {/* Examination Status */}
            <div className="space-y-2">
              <label htmlFor="trangThaiKham">Trạng thái khám *</label>
              <select
                value={formData.trangThaiKham}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('trangThaiKham', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.trangThaiKham ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Chọn trạng thái khám</option>
                <option value="CHUA_KHAM">Chưa khám</option>
                <option value="DA_KHAM">Đã khám</option>
                <option value="HUY">Hủy</option>
                <option value="HOAN">Hoãn</option>
              </select>
              {errors.trangThaiKham && (
                <p className="text-sm text-red-600">{errors.trangThaiKham}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="ghiChu">Ghi chú</label>
              <textarea
                id="ghiChu"
                value={formData.ghiChu}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('ghiChu', e.target.value)}
                placeholder="Nhập ghi chú về lịch khám (tùy chọn)"
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ghiChu ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.ghiChu && (
                <p className="text-sm text-red-600">{errors.ghiChu}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo lịch khám'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}