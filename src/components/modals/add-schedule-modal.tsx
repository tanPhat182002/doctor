'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { calculateFollowUpDate } from '@/utils/date-calculator'

interface ScheduleFormData {
  maHoSo: string
  ngayKham: string
  soNgay: string
  ngayTaiKham: string
  trangThaiKham: string
  ghiChu: string
}

interface ScheduleFormErrors {
  maHoSo?: string
  ngayKham?: string
  soNgay?: string
  ngayTaiKham?: string
  trangThaiKham?: string
  ghiChu?: string
}

interface Pet {
  maHoSo: string
  tenThu: string
  khachHang: {
    tenKhachHang: string
  }
}

interface AddScheduleModalProps {
  petId?: string
  onSuccess?: () => void
  triggerButton: React.ReactNode
}

const EXAM_STATUSES = [
  { value: 'CHUA_KHAM', label: '🟡 Chưa khám' },
  { value: 'DANG_KHAM', label: '🔵 Đang khám' },
  { value: 'DA_KHAM', label: '🟢 Đã khám' },
  { value: 'HUY', label: '🔴 Hủy' }
]

export function AddScheduleModal({ petId, onSuccess, triggerButton }: AddScheduleModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<ScheduleFormErrors>({})
  const [pet, setPet] = useState<Pet | null>(null)
  const [formData, setFormData] = useState<ScheduleFormData>({
    maHoSo: petId || '',
    ngayKham: new Date().toISOString().slice(0, 16), // Set current date and time
    soNgay: '',
    ngayTaiKham: '',
    trangThaiKham: 'CHUA_KHAM',
    ghiChu: ''
  })

  // Fetch pet data if petId is provided
  useEffect(() => {
    const fetchPet = async () => {
      if (!petId) return
      
      try {
        const response = await fetch(`/api/ho-so-thu/${petId}`)
        const data = await response.json()
        
        if (data.success) {
          setPet(data.data)
        }
      } catch (error) {
        console.error('Error fetching pet:', error)
      }
    }

    if (petId) {
      fetchPet()
      setFormData(prev => ({ ...prev, maHoSo: petId }))
    }
  }, [petId])

  // Auto calculate ngayTaiKham when ngayKham or soNgay changes
  useEffect(() => {
    if (formData.ngayKham && formData.soNgay) {
      const calculatedDate = calculateFollowUpDate(formData.ngayKham, formData.soNgay)
      
      if (calculatedDate && calculatedDate !== formData.ngayTaiKham) {
        setFormData(prev => ({ ...prev, ngayTaiKham: calculatedDate }))
      }
    }
  }, [formData.ngayKham, formData.soNgay, formData.ngayTaiKham])

  const validateForm = (): boolean => {
    const newErrors: ScheduleFormErrors = {}
    
    if (!formData.maHoSo.trim()) {
      newErrors.maHoSo = 'Mã hồ sơ thú cưng là bắt buộc'
    }
    
    if (!formData.ngayKham) {
      newErrors.ngayKham = 'Ngày khám là bắt buộc'
    }
    
    if (!formData.soNgay.trim()) {
      newErrors.soNgay = 'Số ngày là bắt buộc'
    } else {
      const soNgayNum = parseInt(formData.soNgay)
      if (isNaN(soNgayNum) || soNgayNum < 0) {
        newErrors.soNgay = 'Số ngày phải là số không âm'
      }
    }
    
    if (!formData.trangThaiKham) {
      newErrors.trangThaiKham = 'Trạng thái khám là bắt buộc'
    }
    
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
          maHoSo: formData.maHoSo,
          ngayKham: new Date(formData.ngayKham).toISOString(),
          soNgay: parseInt(formData.soNgay) || 0,
          ngayTaiKham: formData.ngayTaiKham ? new Date(formData.ngayTaiKham).toISOString() : null,
          trangThaiKham: formData.trangThaiKham,
          ghiChu: formData.ghiChu || null
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setIsOpen(false)
        setFormData({
          maHoSo: petId || '',
          ngayKham: '',
          soNgay: '',
          ngayTaiKham: '',
          trangThaiKham: 'CHUA_KHAM',
          ghiChu: ''
        })
        setErrors({})
        onSuccess?.()
      } else {
        console.error('Failed to create schedule:', result.message)
      }
    } catch (error) {
      console.error('Error creating schedule:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm lịch khám mới</DialogTitle>
        </DialogHeader>
        
        {pet && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-blue-900 mb-2">Thông tin thú cưng</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p><span className="font-medium">Mã hồ sơ:</span> {pet.maHoSo}</p>
              <p><span className="font-medium">Tên thú cưng:</span> {pet.tenThu}</p>
              <p><span className="font-medium">Chủ nhân:</span> {pet.khachHang.tenKhachHang}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!petId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã hồ sơ thú cưng <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.maHoSo}
                onChange={(e) => handleInputChange('maHoSo', e.target.value)}
                className={errors.maHoSo ? 'border-red-500' : ''}
                disabled={isSubmitting}
                placeholder="Nhập mã hồ sơ thú cưng"
              />
              {errors.maHoSo && (
                <p className="text-sm text-red-600 mt-1">{errors.maHoSo}</p>
              )}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày khám <span className="text-red-500">*</span>
            </label>
            <Input
              type="datetime-local"
              value={formData.ngayKham}
              onChange={(e) => handleInputChange('ngayKham', e.target.value)}
              className={errors.ngayKham ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.ngayKham && (
              <p className="text-sm text-red-600 mt-1">{errors.ngayKham}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số ngày tái khám
            </label>
            <Input
              type="number"
              value={formData.soNgay}
              onChange={(e) => handleInputChange('soNgay', e.target.value)}
              className={errors.soNgay ? 'border-red-500' : ''}
              disabled={isSubmitting}
              placeholder="Nhập số ngày"
              min="0"
            />
            {errors.soNgay && (
              <p className="text-sm text-red-600 mt-1">{errors.soNgay}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày tái khám
            </label>
            <Input
              type="datetime-local"
              value={formData.ngayTaiKham}
              onChange={(e) => handleInputChange('ngayTaiKham', e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái khám <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.trangThaiKham}
              onChange={(e) => handleInputChange('trangThaiKham', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.trangThaiKham 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
              disabled={isSubmitting}
            >
              {EXAM_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {errors.trangThaiKham && (
              <p className="text-sm text-red-600 mt-1">{errors.trangThaiKham}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú khám
            </label>
            <textarea
              value={formData.ghiChu}
              onChange={(e) => handleInputChange('ghiChu', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              disabled={isSubmitting}
              placeholder="Nhập ghi chú về lịch khám (tùy chọn)"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
                </>
              ) : (
                'Tạo lịch khám'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}