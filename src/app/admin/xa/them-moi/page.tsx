'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
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

export default function ThemXaPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<AddressFormData>({
    tenXa: '',
  })
  const [errors, setErrors] = useState<AddressFormErrors>({})

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
      const response = await fetch('/api/xa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Tạo xã mới thành công!', {
          duration: 3000,
          icon: '✅'
        })
        setTimeout(() => {
          router.push('/admin/xa')
          router.refresh()
        }, 1000)
      } else {
        toast.error(data.error || 'Có lỗi xảy ra khi tạo xã mới', {
          duration: 4000,
          icon: '❌'
        })
      }
    } catch (error) {
      console.error('Error creating address:', error)
      toast.error('Có lỗi xảy ra khi tạo xã mới', {
        duration: 4000,
        icon: '❌'
      })
    } finally {
      setIsLoading(false)
    }
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
            <h1 className="text-xl font-semibold text-gray-900">Thêm xã mới</h1>
            <p className="text-sm text-gray-600">Tạo thông tin xã mới trong hệ thống</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Form */}
      <div className="mx-auto max-w-2xl space-y-6">
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
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Tạo xã mới
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