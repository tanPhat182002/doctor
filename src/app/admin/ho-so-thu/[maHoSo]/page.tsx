'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Calendar, Plus, FileText, User, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Pet } from '@/types'
import { AddScheduleModal } from '../../../../components/modals/add-schedule-modal'
import { EditScheduleModal, DeleteScheduleModal } from '@/components/modals/edit-schedule-modal'
import { useExamStatus } from '@/hooks/useStatusManager'
import type { ExamStatus } from '@/types'

interface PetEditFormData {
  tenThu: string
}

interface PetEditFormErrors {
  tenThu?: string
}

const ITEMS_PER_PAGE = 6

export default function PetDetailPage() {
  const params = useParams()
  const maHoSo = params.maHoSo as string
  const examStatus = useExamStatus()
  
  const [pet, setPet] = useState<Pet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<PetEditFormErrors>({})
  const [currentSchedulePage, setCurrentSchedulePage] = useState(0)
  const [formData, setFormData] = useState<PetEditFormData>({
    tenThu: ''
  })

  // Fetch pet data
  useEffect(() => {
    const fetchPet = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/ho-so-thu/${maHoSo}`)
        const data = await response.json()
        
        if (data.success) {
          setPet(data.data)
          setFormData({
            tenThu: data.data.tenThu
          })
        } else {
          console.error('Failed to fetch pet:', data.message)
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

  const handleInputChange = (field: keyof PetEditFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: PetEditFormErrors = {}
    
    if (!formData.tenThu.trim()) {
      newErrors.tenThu = 'Tên thú cưng là bắt buộc'
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
          tenThu: formData.tenThu
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setPet(result.data)
        setIsEditing(false)
        setErrors({})
      } else {
        console.error('Failed to update pet:', result.message)
      }
    } catch (error) {
      console.error('Error updating pet:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy hồ sơ</h1>
          <p className="text-gray-600 mb-4">Hồ sơ thú cưng không tồn tại hoặc đã bị xóa.</p>
          <Link href="/admin/ho-so-thu">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentSchedules = pet.lichTheoDoi.slice(
    currentSchedulePage * ITEMS_PER_PAGE,
    (currentSchedulePage + 1) * ITEMS_PER_PAGE
  )
  const totalSchedulePages = Math.ceil(pet.lichTheoDoi.length / ITEMS_PER_PAGE)

  const nextSchedulePage = () => {
    if (currentSchedulePage < totalSchedulePages - 1) {
      setCurrentSchedulePage(prev => prev + 1)
    }
  }

  const prevSchedulePage = () => {
    if (currentSchedulePage > 0) {
      setCurrentSchedulePage(prev => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header - Mobile & Desktop */}
        <div className="mb-6">
          {/* Mobile Header */}
          <div className="sm:hidden">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/admin/ho-so-thu">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-900 truncate">{pet.tenThu}</h1>
                <p className="text-sm text-gray-600">Mã: {pet.maHoSo}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              )}
             
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin/ho-so-thu">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{pet.tenThu}</h1>
                  <p className="text-gray-600">Mã hồ sơ: {pet.maHoSo}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                {!isEditing && (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="transition-all hover:shadow-md"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa thông tin
                  </Button>
                )}
               
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thông tin thú cưng */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="hidden sm:inline">Thông tin thú cưng</span>
                  <span className="sm:hidden">Thông tin</span>
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên thú cưng <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.tenThu}
                        onChange={(e) => handleInputChange('tenThu', e.target.value)}
                        className={`transition-all ${errors.tenThu ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                        disabled={isSubmitting}
                        placeholder="Nhập tên thú cưng"
                      />
                      {errors.tenThu && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <span className="text-red-500">⚠</span> {errors.tenThu}
                        </p>
                      )}
                    </div>

                    

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none transition-all hover:shadow-md"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang lưu...
                          </>
                        ) : (
                          'Lưu thay đổi'
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false)
                          setErrors({})
                          setFormData({
                            tenThu: pet.tenThu
                          })
                        }}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none transition-all hover:shadow-md"
                      >
                        Hủy bỏ
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">Tên thú cưng</label>
                      <p className="text-lg font-semibold text-gray-900">{pet.tenThu}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Trạng thái sức khỏe hiện tại</label>
                      <p className="text-lg font-semibold text-gray-900">{pet.trangThai}</p>
                    </div>
                    
                    {/* Hiển thị thông tin từ lịch sử khám gần nhất */}
                    {pet.lichTheoDoi && pet.lichTheoDoi.length > 0 && (() => {
                      const latestSchedule = pet.lichTheoDoi.sort((a, b) => new Date(b.ngayKham).getTime() - new Date(a.ngayKham).getTime())[0]
                      const status = examStatus.getConfig(latestSchedule.trangThaiKham as ExamStatus)
                      return (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Trạng thái khám gần nhất</label>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${status?.className || 'bg-gray-100 text-gray-800'}`}>
                                {status?.label || latestSchedule.trangThaiKham}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({new Date(latestSchedule.ngayKham).toLocaleDateString('vi-VN')})
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-sm font-medium text-gray-700 block mb-2">Ghi chú từ lịch khám gần nhất</label>
                            <p className="text-gray-900 leading-relaxed">
                              {latestSchedule.ghiChu || (
                                <span className="text-gray-500 italic">Chưa có ghi chú nào từ lịch khám gần nhất</span>
                              )}
                            </p>
                          </div>
                        </>
                      )
                    })()}
                    
                    
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thông tin chủ nhân */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <span className="hidden sm:inline">Thông tin chủ nhân</span>
                <span className="sm:hidden">Chủ nhân</span>
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-700 block mb-2">Tên khách hàng</label>
                  <p className="text-lg font-semibold text-gray-900">{pet.khachHang.tenKhachHang}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-700 block mb-2">Số điện thoại</label>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <a 
                      href={`tel:${pet.khachHang.soDienThoai}`}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      {pet.khachHang.soDienThoai}
                    </a>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-700 block mb-2">Địa chỉ</label>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg mt-0.5">
                      <MapPin className="h-4 w-4 text-red-600" />
                    </div>
                    <p className="text-gray-900 leading-relaxed flex-1">
                      {pet.khachHang.diaChi}
                      {pet.khachHang.xa && `, ${pet.khachHang.xa.tenXa}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lịch sử khám */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="hidden sm:inline">Lịch sử khám bệnh ({pet.lichTheoDoi.length} lần khám)</span>
                    <span className="sm:hidden">Lịch khám ({pet.lichTheoDoi.length})</span>
                  </h2>
                  <AddScheduleModal 
                    petId={pet.maHoSo}
                    onSuccess={() => {
                      // Refresh lịch khám sau khi thêm thành công
                      window.location.reload()
                    }}
                    triggerButton={
                      <Button size="sm" className="ml-3">
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Thêm lịch khám</span>
                        <span className="sm:hidden">Thêm</span>
                      </Button>
                    }
                  />
                </div>
                {totalSchedulePages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevSchedulePage}
                      disabled={currentSchedulePage === 0}
                      className="transition-all hover:shadow-md"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600 px-2">
                      {currentSchedulePage + 1} / {totalSchedulePages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextSchedulePage}
                      disabled={currentSchedulePage === totalSchedulePages - 1}
                      className="transition-all hover:shadow-md"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {pet.lichTheoDoi.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentSchedules.map((schedule) => {
                    return (
                      <div key={schedule.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300 relative">
                        <div className="absolute top-2 right-2">
                          <DeleteScheduleModal 
                            schedule={schedule}
                            onSuccess={() => {
                              // Refresh lịch khám sau khi xóa thành công
                              window.location.reload()
                            }}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 pr-8">
                          <span className="text-sm font-semibold text-gray-900">
                            {new Date(schedule.ngayKham).toLocaleDateString('vi-VN')}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${(() => {
                              const status = examStatus.getConfig(schedule.trangThaiKham as ExamStatus)
                              return status?.className || 'bg-gray-100 text-gray-800'
                            })()}`}>
                              {(() => {
                                const status = examStatus.getConfig(schedule.trangThaiKham as ExamStatus)
                                return status?.label || schedule.trangThaiKham
                              })()}
                            </span>
                            <EditScheduleModal 
                              schedule={schedule}
                              onSuccess={() => {
                                // Refresh lịch khám sau khi sửa thành công
                                window.location.reload()
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Thời gian theo dõi:</span>
                            <span className="text-gray-900">{schedule.soNgay} ngày</span>
                          </div>
                          
                          {schedule.ngayTaiKham && (
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Tái khám:</span>
                              <span className="text-gray-900">{new Date(schedule.ngayTaiKham).toLocaleDateString('vi-VN')}</span>
                            </div>
                          )}
                        </div>
                        
                        {schedule.ghiChu && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-600 leading-relaxed">
                              <span className="font-medium">Ghi chú:</span> {schedule.ghiChu}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch khám</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Thú cưng này chưa có lịch sử khám bệnh nào. Hãy tạo lịch khám đầu tiên.
                  </p>
                  <Link href={`/admin/lich-kham/them-moi?maHoSo=${pet.maHoSo}`}>
                    <Button className="w-full sm:w-auto transition-all hover:shadow-md">
                      <Plus className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Thêm lịch khám đầu tiên</span>
                      <span className="sm:hidden">Thêm lịch khám</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}