'use client'

import { Bell, Search, User, Menu } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 lg:ml-64">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden -ml-2 p-2 text-gray-700 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Tìm kiếm khách hàng, thú cưng..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Mobile search button */}
          <button
            type="button"
            className="lg:hidden p-2 text-gray-700 hover:text-gray-900"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Right section */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="p-4 border-b border-gray-200">
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
                  <div className="p-2 border-t border-gray-200">
                    <Link
                      href="/notifications"
                      className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2"
                    >
                      Xem tất cả
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <span className="hidden lg:block text-sm font-medium">
                  {session?.user?.name || 'Admin'}
                </span>
              </button>

              {/* User dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Thông tin cá nhân
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cài đặt
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {/* Handle logout */}}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="lg:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Tìm kiếm..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>
    </header>
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
    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-600 mt-1">{message}</p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  )
}