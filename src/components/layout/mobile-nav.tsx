'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, FileText, Calendar, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', icon: Home, label: 'Dashboard' },
  { href: '/admin/xa', icon: MapPin, label: 'Xã' },
  { href: '/admin/khach-hang', icon: Users, label: 'Khách hàng' },
  { href: '/admin/ho-so-thu', icon: FileText, label: 'Hồ sơ thú' },
  { href: '/admin/lich-kham', icon: Calendar, label: 'Lịch khám' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 z-50 shadow-lg">
    
      <div className="grid grid-cols-5 h-16 relative">
        {/* Active indicator */}
        <div 
          className="absolute top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{
            width: '20%',
            left: `${navItems.findIndex(item => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) * 20}%`,
          }}
        />
        
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center text-xs transition-all duration-200 ease-out relative group',
                'hover:bg-blue-50/50 active:scale-95',
                isActive
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-blue-500'
              )}
            >
              {/* Icon with animation */}
              <div className={cn(
                'relative transition-all duration-200 ease-out',
                isActive ? 'scale-110' : 'group-hover:scale-105'
              )}>
                <Icon className={cn(
                  'h-5 w-5 transition-all duration-200',
                  isActive ? 'drop-shadow-sm' : ''
                )} />
                
                {/* Pulse effect for active item */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                )}
              </div>
              
              {/* Label with smooth transition */}
              <span className={cn(
                'mt-1 transition-all duration-200 ease-out',
                isActive ? 'font-medium text-blue-600' : 'text-gray-600 group-hover:text-blue-500'
              )}>
                {item.label}
              </span>
              
              {/* Ripple effect on tap */}
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/10 scale-0 group-active:scale-100 transition-transform duration-150 ease-out rounded-lg" />
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}