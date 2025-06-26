'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Calendar, Plus, FileText, User, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Pet {
  maHoSo: string
  tenThu: string
  loai: string
  tuoi?: number
  canNang?: number
  trangThai: string
  moTa?: string
 
  khachHang: {
    maKhachHang: string
    tenKhachHang: string
    soDienThoai: string
    diaChi: string | null
  }
  lichTheoDoi: {
    id: string
    ngayKham: string
    ngayTaiKham: string | null
    trangThaiKham: string
    ghiChu: string | null
  }[]
}

interface FormData {
  tenThu: string
  loai: string
  tuoi: string
  canNang: string
  trangThai: string
  moTa: string
}

interface FormErrors {
  tenThu?: string
  loai?: string
  tuoi?: string
  canNang?: string
  trangThai?: string
  moTa?: string
}

const statusConfig = {
  KHOE_MANH: { label: 'Khỏe mạnh', color: 'bg-green-100 text-green-800' },
  THEO_DOI: { label: 'Theo dõi', color: 'bg-yellow-100 text-yellow-800' },
  MANG_THAI: { label: 'Mang thai', color: 'bg-purple-100 text-purple-800' },
  SAU_SINH: { label: 'Sau sinh', color: 'bg-pink-100 text-pink-800' },
  CACH_LY: { label: 'Cách ly', color: 'bg-red-100 text-red-800' }
}

const scheduleStatusConfig = {
  CHUA_KHAM: { label: 'Chưa khám', color: 'bg-gray-100 text-gray-800' },
  DA_KHAM: { label: 'Đã khám', color: 'bg-green-100 text-green-800' },
  HUY: { label: 'Hủy', color: 'bg-red-100 text-red-800' },
  HOAN: { label: 'Hoãn', color: 'bg-yellow-100 text-yellow-800' }
}

const animalEmojis = {
  CHO: '🐕',
  MEO: '🐱',
  CHIM: '🐦',
  CA: '🐠',
  THO: '🐰',
  HAMSTER: '🐹'
}

export default function PetDetailPage() {
  const params = useParams()
  const maHoSo = params.maHoSo as string

  const [pet, setPet] = useState<Pet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    tenThu: '',
    loai: '',
    tuoi: '',
    canNang: '',
    trangThai: '',
    moTa: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Fetch pet details
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await fetch(`/api/ho-so-thu/${maHoSo}`)
        const data = await response.json()
        
        if (data.success) {
          setPet(data.data)
          setFormData({
            tenThu: data.data.tenThu,
            loai: data.data.loai,
            tuoi: data.data.tuoi?.toString() || '',
            canNang: data.data.canNang?.toString() || '',
            trangThai: data.data.trangThai,
            moTa: data.data.moTa || ''
          })
        } else {
          console.error('Error fetching pet:', data.error)
        }
      } catch (error) {
        console.error('Error fetching pet:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (maHoSo) {
      fetchPet()
    }
  }, [maHoSo])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.tenThu.trim()) {
      newErrors.tenThu = 'Vui lòng nhập tên thú cưng'
    }

    if (!formData.loai.trim()) {
      newErrors.loai = 'Vui lòng chọn loại thú cưng'
    }

    if (!formData.trangThai.trim()) {
      newErrors.trangThai = 'Vui lòng chọn trạng thái sức khỏe'
    }

    

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/ho-so-thu/${maHoSo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenThu: formData.tenThu,
          loai: formData.loai,
         
          trangThai: formData.trangThai,
          moTa: formData.moTa || null
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        setPet(prev => prev ? { ...prev, ...result.data } : null)
        setIsEditing(false)
        alert('Cập nhật thông tin thành công!')
      } else {
        console.error('Error updating pet:', result.error)
        alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Không tìm thấy hồ sơ thú cưng</div>
        </div>
      </div>
    )
  }

  const status = statusConfig[pet.trangThai as keyof typeof statusConfig]
  const emoji = animalEmojis[pet.loai as keyof typeof animalEmojis] || '🐾'

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/admin/ho-so-thu" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách hồ sơ
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {emoji} {pet.tenThu}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status?.color}`}>
                {status?.label}
              </span>
            </h1>
            <p className="text-gray-600 mt-1">Mã hồ sơ: {pet.maHoSo}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            )}
            <Link href={`/admin/lich-kham/them-moi?petId=${pet.maHoSo}`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm lịch khám
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pet Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin thú cưng
              </h3>
            </div>
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên thú cưng *
                      </label>
                      <Input
                        value={formData.tenThu}
                        onChange={(e) => handleInputChange('tenThu', e.target.value)}
                        className={errors.tenThu ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                      />
                      {errors.tenThu && (
                        <p className="text-sm text-red-600 mt-1">{errors.tenThu}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại thú cưng *
                      </label>
                      <select
                        value={formData.loai}
                        onChange={(e) => handleInputChange('loai', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.loai ? 'border-red-500' : 'border-gray-300'}`}
                        disabled={isSubmitting}
                      >
                        <option value="">Chọn loại thú cưng</option>
                        <option value="CHO">Chó</option>
                        <option value="MEO">Mèo</option>
                        <option value="CHIM">Chim</option>
                        <option value="CA">Cá</option>
                        <option value="THO">Thỏ</option>
                        <option value="HAMSTER">Hamster</option>
                      </select>
                      {errors.loai && (
                        <p className="text-sm text-red-600 mt-1">{errors.loai}</p>
                      )}
                    </div>

                   

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trạng thái sức khỏe *
                      </label>
                      <select
                        value={formData.trangThai}
                        onChange={(e) => handleInputChange('trangThai', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.trangThai ? 'border-red-500' : 'border-gray-300'}`}
                        disabled={isSubmitting}
                      >
                        <option value="">Chọn trạng thái</option>
                        <option value="KHOE_MANH">Khỏe mạnh</option>
                        <option value="THEO_DOI">Theo dõi</option>
                        <option value="MANG_THAI">Mang thai</option>
                        <option value="SAU_SINH">Sau sinh</option>
                        <option value="CACH_LY">Cách ly</option>
                      </select>
                      {errors.trangThai && (
                        <p className="text-sm text-red-600 mt-1">{errors.trangThai}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả
                      </label>
                      <textarea
                        value={formData.moTa}
                        onChange={(e) => handleInputChange('moTa', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.moTa ? 'border-red-500' : 'border-gray-300'}`}
                        disabled={isSubmitting}
                        placeholder="Mô tả thêm về thú cưng..."
                      />
                      {errors.moTa && (
                        <p className="text-sm text-red-600 mt-1">{errors.moTa}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false)
                        setErrors({})
                        // Reset form data
                        setFormData({
                          tenThu: pet.tenThu,
                          loai: pet.loai,
                          tuoi: pet.tuoi?.toString() || '',
                          canNang: pet.canNang?.toString() || '',
                          trangThai: pet.trangThai,
                          moTa: pet.moTa || ''
                        })
                      }}
                      disabled={isSubmitting}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tên thú cưng</label>
                    <p className="text-sm text-gray-900 mt-1">{pet.tenThu}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Loại</label>
                    <p className="text-sm text-gray-900 mt-1">{pet.loai}</p>
                  </div>
                 
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Mô tả</label>
                    <p className="text-sm text-gray-900 mt-1">{pet.moTa || 'Chưa có mô tả'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Owner Information & Schedule History */}
        <div className="space-y-6">
          {/* Owner Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin chủ nhân
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900">{pet.khachHang.tenKhachHang}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900">{pet.khachHang.soDienThoai}</span>
              </div>
              {pet.khachHang.diaChi && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900">{pet.khachHang.diaChi}</span>
                </div>
              )}
            </div>
          </div>

          {/* Schedule History */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lịch sử khám
              </h3>
            </div>
            <div className="p-6">
              {pet.lichTheoDoi.length > 0 ? (
                <div className="space-y-3">
                  {pet.lichTheoDoi.slice(0, 5).map((schedule) => {
                    const scheduleStatus = scheduleStatusConfig[schedule.trangThaiKham as keyof typeof scheduleStatusConfig]
                    return (
                      <div key={schedule.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {new Date(schedule.ngayKham).toLocaleDateString('vi-VN')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${scheduleStatus?.color}`}>
                            {scheduleStatus?.label}
                          </span>
                        </div>
                        {schedule.ngayTaiKham && (
                          <p className="text-xs text-gray-600 mb-1">
                            Tái khám: {new Date(schedule.ngayTaiKham).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                        {schedule.ghiChu && (
                          <p className="text-xs text-gray-600">{schedule.ghiChu}</p>
                        )}
                      </div>
                    )
                  })}
                  {pet.lichTheoDoi.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      Và {pet.lichTheoDoi.length - 5} lịch khám khác...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có lịch khám nào
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}