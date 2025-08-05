'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

interface AddressFormData {
  tenXa: string
}

interface AddressFormErrors {
  tenXa?: string
}

interface Address {
  maXa: string
  tenXa: string | null
  _count: {
    khachHangs: number
  }
}

export default function ChinhSuaXaPage({ params }: { params: Promise<{ maXa: string }> }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [address, setAddress] = useState<Address | null>(null)
  const [maXa, setMaXa] = useState<string>('')
  const [formData, setFormData] = useState<AddressFormData>({
    tenXa: '',
  })
  const [errors, setErrors] = useState<AddressFormErrors>({})

  // Get params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setMaXa(resolvedParams.maXa)
    }
    getParams()
  }, [params])

  // Load address data
  useEffect(() => {
    if (!maXa) return
    
    const fetchAddress = async () => {
      try {
        const response = await fetch(`/api/xa/${maXa}`)
        const data = await response.json()
        
        if (data.success) {
          setAddress(data.data)
          setFormData({
            tenXa: data.data.tenXa || '',
          })
        } else {
          alert('Không tìm thấy thông tin xã')
          router.push('/admin/xa')
        }
      } catch (error) {
        console.error('Error fetching address:', error)
        alert('Có lỗi xảy ra khi tải thông tin xã')
        router.push('/admin/xa')
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchAddress()
  }, [maXa, router])

  const validateForm = (): boolean => {
    const newErrors: AddressFormErrors = {}
    let isValid = true

    if (!formData.tenXa.trim()) {
      newErrors.tenXa = 'Tên xã là bắt buộc'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/xa/${maXa}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/admin/xa')
        router.refresh()
      } else {
        alert(data.error || 'Có lỗi xảy ra khi cập nhật xã')
      }
    } catch (error) {
      console.error('Error updating address:', error)
      alert('Có lỗi xảy ra khi cập nhật xã')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin xã...</p>
        </div>
      </div>
    )
  }

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin xã</p>
          <Link href="/admin/xa">
            <Button className="mt-4">
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/xa">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Chỉnh sửa xã</h1>
            <p className="text-sm text-gray-600">Cập nhật thông tin xã: {address.tenXa}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Form */}
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Address Info */}
        <div className="rounded-lg border bg-blue-50 p-4">
          <h3 className="font-medium text-blue-900 mb-2">Thông tin hiện tại</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Mã xã:</span>
              <span className="ml-2 font-mono">{address.maXa}</span>
            </div>
            <div>
              <span className="text-blue-700">Số khách hàng:</span>
              <span className="ml-2 font-semibold">{address._count.khachHangs}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="tenXa" className="block text-sm font-medium">
                Tên xã <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="tenXa"
                  type="text"
                  placeholder="Nhập tên xã"
                  className={`pl-10 ${errors.tenXa ? 'border-red-500' : ''}`}
                  value={formData.tenXa}
                  onChange={(e) => setFormData({ ...formData, tenXa: e.target.value })}
                />
              </div>
              {errors.tenXa && (
                <p className="text-sm text-red-600">{errors.tenXa}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Cập nhật xã
                  </>
                )}
              </Button>
              <Link href="/admin/xa" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                >
                  Hủy
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}