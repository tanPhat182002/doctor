'use client'

import { Bell, Search, User, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { data: session } = useSession()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={cn(
        'sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b lg:ml-64 transition-all duration-200',
        isScrolled ? 'border-gray-300 shadow-sm' : 'border-gray-200'
      )}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile logo & menu */}
            <div className="flex items-center gap-3 lg:hidden">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="text-xl">🏥</span>
                <span className="font-semibold text-blue-600">VetCare</span>
              </Link>
            </div>

            {/* Search bar - Desktop */}
            <div className="hidden lg:block flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Tìm kiếm khách hàng, thú cưng..."
                  className="w-full rounded-xl border border-gray-300 bg-gray-50/50 pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Mobile search button */}
              <motion.button
                type="button"
                onClick={() => setShowMobileSearch(true)}
                className="lg:hidden p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="h-5 w-5" />
              </motion.button>

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                </motion.button>

                {/* Notifications dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-xl ring-1 ring-black/5 border border-gray-200"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Thông báo
                        </h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <NotificationItem
                          title="Lịch tái khám"
                          message="Lucky - KH: Huỳnh Công Hiếu có lịch tái khám ngày mai"
                          time="5 phút trước"
                        />
                        <NotificationItem
                          title="Khách hàng mới"
                          message="Nguyễn Văn A vừa được thêm vào hệ thống"
                          time="1 giờ trước"
                        />
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <Link
                          href="/notifications"
                          className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Xem tất cả
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User menu */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium">
                    {session?.user?.name || 'Admin'}
                  </span>
                </motion.button>

                {/* User dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl ring-1 ring-black/5 border border-gray-200"
                    >
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          Thông tin cá nhân
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          Cài đặt
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => {/* Handle logout */}}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search overlay */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setShowMobileSearch(false)}
          >
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white p-4 shadow-lg"
              onClick={(e) => e.stopPropagation()}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 50 || info.velocity.y > 300) {
                  setShowMobileSearch(false)
                }
              }}
            >
              {/* Drag indicator */}
              <div className="flex justify-center mb-2">
                <div className="w-8 h-1 bg-gray-300 rounded-full" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Tìm kiếm khách hàng, thú cưng..."
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    autoFocus
                  />
                </div>
                <motion.button
                  onClick={() => setShowMobileSearch(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function NotificationItem({
  title,
  message,
  time,
}: {
  title: string
  message: string
  time: string
}) {
  return (
    <motion.div
      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message}</p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </motion.div>
  )
}