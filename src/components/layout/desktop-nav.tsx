'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, FileText, Calendar, BarChart3, Settings, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', icon: Home, label: 'Dashboard' },
  { href: '/admin/khach-hang', icon: Users, label: 'Khách hàng' },
  { href: '/admin/ho-so-thu', icon: FileText, label: 'Hồ sơ thú' },
  { href: '/admin/lich-kham', icon: Calendar, label: 'Lịch khám' },
  { href: '/admin/xa', icon: MapPin, label: 'Quản lý xã' },
  { href: '/admin/bao-cao', icon: BarChart3, label: 'Báo cáo' },
  { href: '/admin/cai-dat', icon: Settings, label: 'Cài đặt' },
]

export function DesktopNav() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <span className="text-xl font-semibold">VetCare</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>


      </div>
    </aside>
  )
}