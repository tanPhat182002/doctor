'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, FileText, Calendar, BarChart3, Settings, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white/95 backdrop-blur-md border-r border-gray-200/50 shadow-xl">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-gray-200/50">
          <Link href="/" className="flex items-center gap-2 group transition-all duration-200 hover:scale-105">
            <span className="text-2xl transition-transform duration-200 group-hover:rotate-12">🏥</span>
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              VetCare
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 relative">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            const isHovered = hoveredItem === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ease-out relative group overflow-hidden',
                  'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 shadow-sm border border-blue-200/50'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 hover:text-gray-900'
                )}
              >
                {/* Background gradient effect */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 transition-all duration-300 ease-out',
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                )} />
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full" />
                )}
                
                {/* Icon with animation */}
                <div className={cn(
                  'relative z-10 transition-all duration-200 ease-out',
                  isActive ? 'scale-110' : isHovered ? 'scale-105' : ''
                )}>
                  <Icon className={cn(
                    'h-5 w-5 transition-all duration-200',
                    isActive ? 'drop-shadow-sm' : ''
                  )} />
                  
                  {/* Pulse effect for active item */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse" />
                  )}
                </div>
                
                {/* Label with smooth transition */}
                <span className={cn(
                  'relative z-10 transition-all duration-200 ease-out',
                  isActive ? 'font-semibold' : 'font-medium'
                )}>
                  {item.label}
                </span>
                
                {/* Hover effect */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 ease-out',
                  isHovered ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
                )} />
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50">
          <div className="text-xs text-gray-500 text-center">
            <div className="font-medium">VetCare System</div>
            <div className="mt-1">v2.0.0</div>
          </div>
        </div>
      </div>
    </aside>
  )
}