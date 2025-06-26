'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, FileText, User, Heart, Loader2, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

interface Customer {
  maKhachHang: string
  tenKhachHang: string
  soDienThoai: string
  diaChi: string | null
}

interface FormData {
  tenThu: string
  loai: string
  trangThai: string
  maKhachHang: string
  // Lịch theo dõi
  ngayKham: string
  ngayTaiKham: string
  ghiChu: string
  trangThaiKham: string
}

interface FormErrors {
  tenThu?: string
  loai?: string
  trangThai?: string
  maKhachHang?: string
  ngayKham?: string
  ngayTaiKham?: string
  ghiChu?: string
  trangThaiKham?: string
  submit?: string
}

const animalTypes = [
  { value: 'CHO', label: 'Chó', emoji: '🐕' },
  { value: 'MEO', label: 'Mèo', emoji: '🐱' },
  { value: 'CHIM', label: 'Chim', emoji: '🐦' },
  { value: 'CA', label: 'Cá', emoji: '🐠' },
  { value: 'THO', label: 'Thỏ', emoji: '🐰' },
  { value: 'HAMSTER', label: 'Hamster', emoji: '🐹' },
]

const healthStatuses = [
  { value: 'KHOE_MANH', label: 'Khỏe mạnh', emoji: '💚' },
  { value: 'THEO_DOI', label: 'Theo dõi', emoji: '⚠️' },
  { value: 'MANG_THAI', label: 'Mang thai', emoji: '🤰' },
  { value: 'SAU_SINH', label: 'Sau sinh', emoji: '👶' },
  { value: 'CACH_LY', label: 'Cách ly', emoji: '🚨' },
]

const examStatuses = [
  { value: 'DA_KHAM', label: 'Đã khám', emoji: '✅' },
  { value: 'CHUA_KHAM', label: 'Chưa khám', emoji: '⏳' },
  { value: 'HUY', label: 'Hủy', emoji: '❌' },
]

export default function ThemHoSoThuPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    tenThu: '',
    loai: '',
    trangThai: 'KHOE_MANH',
    maKhachHang: '',
    // Lịch theo dõi
    ngayKham: new Date().toISOString().slice(0, 16), // Current datetime
    ngayTaiKham: '',
    ghiChu: '',
    trangThaiKham: 'CHUA_KHAM'
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Load customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/khach-hang?limit=1000')
        if (response.ok) {
          const data = await response.json()
          setCustomers(data.customers)
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
      } finally {
        setLoadingCustomers(false)
      }
    }

    fetchCustomers()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate tên thú
    if (!formData.tenThu.trim()) {
      newErrors.tenThu = 'Tên thú là bắt buộc'
    } else if (formData.tenThu.trim().length < 2) {
      newErrors.tenThu = 'Tên thú phải có ít nhất 2 ký tự'
    }

    // Validate loại
    if (!formData.loai) {
      newErrors.loai = 'Loại thú là bắt buộc'
    }

    // Validate trạng thái
    if (!formData.trangThai) {
      newErrors.trangThai = 'Trạng thái là bắt buộc'
    }

    // Validate khách hàng
    if (!formData.maKhachHang) {
      newErrors.maKhachHang = 'Chủ nhân là bắt buộc'
    }

    // Validate lịch theo dõi
    if (!formData.ngayKham) {
      newErrors.ngayKham = 'Ngày khám là bắt buộc'
    }

    if (!formData.trangThaiKham) {
      newErrors.trangThaiKham = 'Trạng thái khám là bắt buộc'
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
      const response = await fetch('/api/ho-so-thu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenThu: formData.tenThu.trim(),
          loai: formData.loai,
          trangThai: formData.trangThai,
          maKhachHang: formData.maKhachHang,
          // Lịch theo dõi
          lichTheoDoi: {
            ngayKham: new Date(formData.ngayKham),
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
      
      // Redirect to pet detail page or back to list
      router.push(`/admin/ho-so-thu?success=created&id=${result.maHoSo}`)
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
        <Link href="/admin/ho-so-thu">
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

                {/* Loại thú */}
                <div>
                  <label htmlFor="loai" className="block text-sm font-medium text-gray-700 mb-2">
                    Loại thú <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="loai"
                    value={formData.loai}
                    onChange={(e) => handleInputChange('loai', e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.loai ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Chọn loại thú</option>
                    {animalTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.emoji} {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.loai && (
                    <p className="mt-1 text-sm text-red-600">{errors.loai}</p>
                  )}
                </div>

                {/* Trạng thái sức khỏe */}
                <div>
                  <label htmlFor="trangThai" className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái sức khỏe <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="trangThai"
                    value={formData.trangThai}
                    onChange={(e) => handleInputChange('trangThai', e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.trangThai ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    {healthStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.emoji} {status.label}
                      </option>
                    ))}
                  </select>
                  {errors.trangThai && (
                    <p className="mt-1 text-sm text-red-600">{errors.trangThai}</p>
                  )}
                </div>

                {/* Chủ nhân */}
                <div>
                  <label htmlFor="maKhachHang" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Chủ nhân <span className="text-red-500">*</span>
                  </label>
                  {loadingCustomers ? (
                    <div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500">
                      Đang tải danh sách khách hàng...
                    </div>
                  ) : (
                    <select
                      id="maKhachHang"
                      value={formData.maKhachHang}
                      onChange={(e) => handleInputChange('maKhachHang', e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.maKhachHang ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    >
                      <option value="">Chọn chủ nhân</option>
                      {customers.map((customer) => (
                        <option key={customer.maKhachHang} value={customer.maKhachHang}>
                          {customer.tenKhachHang} - {customer.soDienThoai}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.maKhachHang && (
                    <p className="mt-1 text-sm text-red-600">{errors.maKhachHang}</p>
                  )}
                  {customers.length === 0 && !loadingCustomers && (
                    <p className="mt-1 text-sm text-gray-500">
                      Chưa có khách hàng nào. 
                      <Link href="/admin/khach-hang/them-moi" className="text-blue-600 hover:underline">
                        Thêm khách hàng mới
                      </Link>
                    </p>
                  )}
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

                {/* Ngày tái khám */}
                <div>
                  <label htmlFor="ngayTaiKham" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Ngày tái khám (tùy chọn)
                  </label>
                  <Input
                    id="ngayTaiKham"
                    type="datetime-local"
                    value={formData.ngayTaiKham}
                    onChange={(e) => handleInputChange('ngayTaiKham', e.target.value)}
                    disabled={isLoading}
                  />
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
                    {examStatuses.map((status) => (
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
              <Link href="/admin/ho-so-thu">
                <Button type="button" variant="outline" disabled={isLoading}>
                  Hủy
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading || loadingCustomers}>
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
          <li>• Thông tin thú cưng và ngày khám đầu tiên là bắt buộc</li>
          <li>• Tên thú nên đặt dễ nhớ và phù hợp với loại thú</li>
          <li>• Lịch theo dõi đầu tiên sẽ được tạo cùng với hồ sơ thú</li>
          <li>• Ngày tái khám và ghi chú là tùy chọn, có thể bổ sung sau</li>
          <li>• Sau khi tạo thành công, bạn có thể thêm nhiều lịch khám khác</li>
        </ul>
      </div>
    </div>
  )
}