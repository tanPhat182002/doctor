'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Calendar, User, Heart, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'

interface PetCardProps {
  pet: {
    maHoSo: string
    tenThu: string
    loai: string
    trangThai: 'KHOE_MANH' | 'THEO_DOI' | 'MANG_THAI' | 'SAU_SINH' | 'CACH_LY'
    khachHang: {
      tenKhachHang: string
      soDienThoai: string
    }
    ngayKhamGanNhat?: string
    ngayTaiKham?: string
  }
  variant?: 'default' | 'compact'
  showActions?: boolean
}

const statusConfig = {
  KHOE_MANH: {
    label: 'Khỏe mạnh',
    className: 'bg-green-100 text-green-800',
    icon: '💚',
  },
  THEO_DOI: {
    label: 'Theo dõi',
    className: 'bg-yellow-100 text-yellow-800',
    icon: '👁️',
  },
  MANG_THAI: {
    label: 'Mang thai',
    className: 'bg-purple-100 text-purple-800',
    icon: '🤰',
  },
  SAU_SINH: {
    label: 'Sau sinh',
    className: 'bg-blue-100 text-blue-800',
    icon: '👶',
  },
  CACH_LY: {
    label: 'Cách ly',
    className: 'bg-red-100 text-red-800',
    icon: '🚫',
  },
}

const animalEmojis: Record<string, string> = {
  CHO: '🐕',
  MEO: '🐈',
  BO: '🐄',
  TRAU: '🐃',
  HEO: '🐖',
  DE: '🐐',
  KHAC: '🐾',
}

function QRCodeButton({ petId, petName }: { petId: string; petName: string }) {
  const [showQR, setShowQR] = useState(false)
  const profileUrl = `${window.location.origin}/admin/ho-so-thu/${petId}`

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowQR(!showQR)
        }}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
        title="Hiển thị mã QR"
      >
        <QrCode className="h-4 w-4" />
      </button>
      
      {showQR && (
        <div className="absolute right-0 top-10 z-50 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <div className="text-center">
            <div className="mb-2">
              <QRCodeSVG
                value={profileUrl}
                size={120}
                level="M"
                includeMargin={true}
                title={`QR Code cho ${petName}`}
              />
            </div>
            <p className="text-xs text-gray-600">Quét để xem hồ sơ {petName}</p>
          </div>
          <div className="absolute -top-2 right-4 h-4 w-4 rotate-45 border-l border-t border-gray-200 bg-white"></div>
        </div>
      )}
    </div>
  )
}

export function PetCard({ pet, variant = 'default', showActions = true }: PetCardProps) {
  const status = statusConfig[pet.trangThai]
  const emoji = animalEmojis[pet.loai] || '🐾'

  if (variant === 'compact') {
    return (
      <Link
        href={`/admin/ho-so-thu/${pet.maHoSo}`}
        className="block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-2xl">
            {emoji}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{pet.tenThu}</h3>
            <p className="text-sm text-gray-600">
              {pet.loai} • {pet.khachHang.tenKhachHang}
            </p>
          </div>
          
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              status.className
            )}
          >
            {status.label}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/admin/ho-so-thu/${pet.maHoSo}`} className="block">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md cursor-pointer">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-3xl">
              {emoji}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{pet.tenThu}</h3>
              <p className="text-sm text-gray-600">{pet.loai} • Mã: {pet.maHoSo}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <QRCodeButton petId={pet.maHoSo} petName={pet.tenThu} />
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium',
                status.className
              )}
            >
              <span>{status.icon}</span>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span className="font-medium">Chủ:</span>
          <span>{pet.khachHang.tenKhachHang}</span>
          <span className="text-gray-400">•</span>
          <span>{pet.khachHang.soDienThoai}</span>
        </div>

        {pet.ngayKhamGanNhat && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Khám gần nhất:</span>
            <span>{new Date(pet.ngayKhamGanNhat).toLocaleDateString('vi-VN')}</span>
          </div>
        )}

        {pet.ngayTaiKham && (
          <div className="flex items-center gap-2 text-sm">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="font-medium text-red-600">Tái khám:</span>
            <span className="text-red-600">
              {new Date(pet.ngayTaiKham).toLocaleDateString('vi-VN')}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.location.href = `/admin/ho-so-thu/${pet.maHoSo}`
              }}
              className="flex-1 rounded-lg bg-blue-50 px-4 py-2 text-center text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              Xem chi tiết
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.location.href = `/admin/lich-kham/them-moi?maHoSo=${pet.maHoSo}`
              }}
              className="flex-1 rounded-lg bg-gray-50 px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Đặt lịch khám
            </button>
          </div>
        </div>
      )}
      </div>
    </Link>
  )
}