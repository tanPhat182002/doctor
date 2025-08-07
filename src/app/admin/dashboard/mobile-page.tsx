'use client'

import { useState, useEffect } from 'react'
import { MobileDashboard } from '@/components/mobile/mobile-dashboard'
import { useIsMobile } from '@/hooks/use-mobile'

interface Schedule {
  maLichTaiKham: string
  ngayTaiKham: string
  trangThai: string
  ghiChu?: string
  hoSoThu: {
    maHoSo: string
    tenThu: string
    khachHang: {
      tenKhachHang: string
      soDienThoai: string
    }
  }
}

export function MobileDashboardPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/lich-tai-kham')
        if (response.ok) {
          const data = await response.json()
          setSchedules(data)
        }
      } catch (error) {
        console.error('Error fetching schedules:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [])

  // Only render mobile dashboard on mobile devices
  if (!isMobile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        <MobileDashboard schedules={schedules} loading={loading} />
      </div>
    </div>
  )
}