'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Search, SortAsc, SortDesc } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MobileList, MobileListItem } from '@/components/layout/mobile-layout'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface MobileTableColumn {
  key: string
  label: string
  sortable?: boolean
  render?: (value: unknown, item: Record<string, unknown>) => ReactNode
}

interface MobileTableProps {
  data: Record<string, unknown>[]
  columns: MobileTableColumn[]
  onRowClick?: (item: Record<string, unknown>) => void
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  loading?: boolean
  className?: string
  primaryKey?: string
  secondaryKeys?: string[]
  statusKey?: string
  avatarKey?: string
}

export function MobileTable({
  data,
  columns,
  onRowClick,
  searchable = true,
  searchPlaceholder = 'Tìm kiếm...',
  emptyMessage = 'Không có dữ liệu',
  loading = false,
  className,
  primaryKey,
  secondaryKeys = [],
  statusKey,
  avatarKey
}: MobileTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const isMobile = useIsMobile()

  // Only render mobile table on mobile devices
  if (!isMobile) {
    return null
  }

  // Filter data based on search term
  const filteredData = data.filter(item => {
    if (!searchTerm) return true
    
    return columns.some(column => {
      const value = item[column.key]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase())
      }
      return false
    })
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0
    
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    
    // Convert to string for comparison
    const aStr = String(aValue || '')
    const bStr = String(bValue || '')
    
    if (aStr < bStr) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aStr > bStr) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  const getPrimaryValue = (item: Record<string, unknown>) => {
    if (primaryKey) {
      return String(item[primaryKey] || '')
    }
    return columns[0] ? String(item[columns[0].key] || '') : ''
  }

  const getSecondaryValues = (item: Record<string, unknown>) => {
    if (secondaryKeys.length > 0) {
      return secondaryKeys.map(key => String(item[key] || '')).filter(Boolean)
    }
    return columns.slice(1, 3).map(col => String(item[col.key] || '')).filter(Boolean)
  }

  const getAvatar = (item: Record<string, unknown>) => {
    if (avatarKey && item[avatarKey]) {
      return String(item[avatarKey])
    }
    return null
  }

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {searchable && (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-lg"></div>
          </div>
        )}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filters */}
      {searchable && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          {/* Sort Options */}
          {columns.some(col => col.sortable) && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {columns
                .filter(col => col.sortable)
                .map(column => (
                  <Button
                    key={column.key}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort(column.key)}
                    className={cn(
                      'flex items-center space-x-1 whitespace-nowrap',
                      sortConfig?.key === column.key && 'bg-blue-50 border-blue-300'
                    )}
                  >
                    <span>{column.label}</span>
                    {sortConfig?.key === column.key && (
                      sortConfig.direction === 'asc' 
                        ? <SortAsc className="h-3 w-3" />
                        : <SortDesc className="h-3 w-3" />
                    )}
                  </Button>
                ))
              }
            </div>
          )}
        </motion.div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {searchTerm ? (
          <span>Tìm thấy {sortedData.length} kết quả cho &ldquo;{searchTerm}&rdquo;</span>
        ) : (
          <span>Hiển thị {sortedData.length} mục</span>
        )}
      </div>

      {/* Table Content */}
      <AnimatePresence mode="wait">
        {sortedData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500">{emptyMessage}</p>
          </motion.div>
        ) : (
          <MobileList>
            {sortedData.map((item, index) => {
              const primaryValue = getPrimaryValue(item)
              const secondaryValues = getSecondaryValues(item)
              const avatar = getAvatar(item)
              const status = statusKey ? String(item[statusKey] || '') : null
              
              return (
                <motion.div
                  key={String(item.id || index)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MobileListItem
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      onRowClick && 'cursor-pointer hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      {avatar && (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                          {avatar.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {primaryValue}
                          </h3>
                          {status && (
                            <Badge variant="outline" className="text-xs ml-2">
                              {status}
                            </Badge>
                          )}
                        </div>
                        
                        {secondaryValues.length > 0 && (
                          <div className="space-y-1">
                            {secondaryValues.map((value, idx) => (
                              <p key={idx} className="text-sm text-gray-600 truncate">
                                {String(value)}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Arrow */}
                      {onRowClick && (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </MobileListItem>
                </motion.div>
              )
            })}
          </MobileList>
        )}
      </AnimatePresence>
    </div>
  )
}

// Specialized mobile table for common use cases
export function MobileCustomerTable({ customers, onCustomerClick, loading }: {
  customers: Record<string, unknown>[]
  onCustomerClick?: (customer: Record<string, unknown>) => void
  loading?: boolean
}) {
  const columns: MobileTableColumn[] = [
    { key: 'tenKhachHang', label: 'Tên khách hàng', sortable: true },
    { key: 'soDienThoai', label: 'Số điện thoại' },
    { key: 'diaChi', label: 'Địa chỉ' },
    { key: 'trangThai', label: 'Trạng thái' }
  ]

  return (
    <MobileTable
      data={customers}
      columns={columns}
      onRowClick={onCustomerClick}
      primaryKey="tenKhachHang"
      secondaryKeys={['soDienThoai', 'diaChi']}
      statusKey="trangThai"
      searchPlaceholder="Tìm kiếm khách hàng..."
      emptyMessage="Không có khách hàng nào"
      loading={loading}
    />
  )
}

export function MobilePetTable({ pets, onPetClick, loading }: {
  pets: Record<string, unknown>[]
  onPetClick?: (pet: Record<string, unknown>) => void
  loading?: boolean
}) {
  const columns: MobileTableColumn[] = [
    { key: 'tenThu', label: 'Tên thú cưng', sortable: true },
    { key: 'loai', label: 'Loại' },
    { key: 'tuoi', label: 'Tuổi' },
    { key: 'trangThai', label: 'Trạng thái' }
  ]

  return (
    <MobileTable
      data={pets}
      columns={columns}
      onRowClick={onPetClick}
      primaryKey="tenThu"
      secondaryKeys={['loai', 'tuoi']}
      statusKey="trangThai"
      avatarKey="tenThu"
      searchPlaceholder="Tìm kiếm thú cưng..."
      emptyMessage="Không có thú cưng nào"
      loading={loading}
    />
  )
}