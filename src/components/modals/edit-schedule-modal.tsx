'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { calculateFollowUpDate } from '@/utils/date-calculator'
import { Edit, Trash2 } from 'lucide-react'
import { useDeleteSchedule } from '@/hooks/api/use-schedules'
import type { ExamStatus } from '@/types'

// Modal-specific schedule interface
interface ModalSchedule {
  id: number
  ngayKham: Date
  soNgay: number
  ngayTaiKham: Date | null
  trangThaiKham: ExamStatus
  ghiChu: string | null
  maHoSo: string
}

interface ScheduleFormData {
  ngayKham: string
  soNgay: string
  ngayTaiKham: string
  trangThaiKham: string
  ghiChu: string
}

interface ScheduleFormErrors {
  ngayKham?: string
  soNgay?: string
  ngayTaiKham?: string
  trangThaiKham?: string
  ghiChu?: string
}

interface EditScheduleModalProps {
  schedule: ModalSchedule
  onSuccess?: () => void
}

interface DeleteScheduleModalProps {
  schedule: ModalSchedule
  onSuccess?: () => void
}

const EXAM_STATUSES = [
  { value: 'CHUA_KHAM', label: '🟡 Chưa khám' },
  { value: 'DANG_KHAM', label: '🔵 Đang khám' },
  { value: 'DA_KHAM', label: '🟢 Đã khám' },
  { value: 'HUY', label: '🔴 Hủy' }
]

export function DeleteScheduleModal({ schedule, onSuccess }: DeleteScheduleModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const deleteSchedule = useDeleteSchedule()

  const handleDelete = async () => {
    try {
      await deleteSchedule.mutateAsync(schedule.id.toString())
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error deleting schedule:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận xóa lịch khám</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Bạn có chắc chắn muốn xóa lịch khám ngày{' '}
            <span className="font-semibold">
              {new Date(schedule.ngayKham).toLocaleDateString('vi-VN')}
            </span>{' '}
            không? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={deleteSchedule.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteSchedule.isPending}
            >
              {deleteSchedule.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function EditScheduleModal({ schedule, onSuccess }: EditScheduleModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<ScheduleFormErrors>({})
  const [formData, setFormData] = useState<ScheduleFormData>({
    ngayKham: '',
    soNgay: '',
    ngayTaiKham: '',
    trangThaiKham: '',
    ghiChu: ''
  })

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && schedule) {
      setFormData({
        ngayKham: schedule.ngayKham instanceof Date ? schedule.ngayKham.toISOString().slice(0, 16) : new Date(schedule.ngayKham).toISOString().slice(0, 16),
        soNgay: schedule.soNgay.toString(),
        ngayTaiKham: schedule.ngayTaiKham ? (schedule.ngayTaiKham instanceof Date ? schedule.ngayTaiKham.toISOString().slice(0, 16) : new Date(schedule.ngayTaiKham).toISOString().slice(0, 16)) : '',
        trangThaiKham: schedule.trangThaiKham,
        ghiChu: schedule.ghiChu || ''
      })
    }
  }, [isOpen, schedule])

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
      const response = await fetch(`/api/lich-kham/${Number(schedule.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        setErrors({})
        onSuccess?.()
      } else {
        console.error('Failed to update schedule:', result.message)
      }
    } catch (error) {
      console.error('Error updating schedule:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lịch khám</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật lịch khám'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}