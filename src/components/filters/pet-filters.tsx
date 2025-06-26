'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

const statusOptions = [
  { value: 'KHOE_MANH', label: 'Khỏe mạnh', emoji: '💚' },
  { value: 'THEO_DOI', label: 'Theo dõi', emoji: '⚠️' },
  { value: 'MANG_THAI', label: 'Mang thai', emoji: '🤰' },
  { value: 'SAU_SINH', label: 'Sau sinh', emoji: '👶' },
  { value: 'CACH_LY', label: 'Cách ly', emoji: '🚨' },
]

const typeOptions = [
  { value: 'CHO', label: 'Chó', emoji: '🐕' },
  { value: 'MEO', label: 'Mèo', emoji: '🐱' },
  { value: 'CHIM', label: 'Chim', emoji: '🐦' },
  { value: 'CA', label: 'Cá', emoji: '🐠' },
  { value: 'THO', label: 'Thỏ', emoji: '🐰' },
  { value: 'HAMSTER', label: 'Hamster', emoji: '🐹' },
]

export function PetFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedStatus, setSelectedStatus] = useState<string[]>(
    searchParams.get('status')?.split(',').filter(Boolean) || []
  )
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get('type')?.split(',').filter(Boolean) || []
  )

  const updateFilters = (newStatus: string[], newTypes: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (newStatus.length > 0) {
      params.set('status', newStatus.join(','))
    } else {
      params.delete('status')
    }
    
    if (newTypes.length > 0) {
      params.set('type', newTypes.join(','))
    } else {
      params.delete('type')
    }
    
    // Reset to first page when filters change
    params.set('page', '1')
    
    router.push(`?${params.toString()}`)
  }

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked
      ? [...selectedStatus, status]
      : selectedStatus.filter(s => s !== status)
    
    setSelectedStatus(newStatus)
    updateFilters(newStatus, selectedTypes)
  }

  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...selectedTypes, type]
      : selectedTypes.filter(t => t !== type)
    
    setSelectedTypes(newTypes)
    updateFilters(selectedStatus, newTypes)
  }

  const clearFilters = () => {
    setSelectedStatus([])
    setSelectedTypes([])
    updateFilters([], [])
  }

  const hasActiveFilters = selectedStatus.length > 0 || selectedTypes.length > 0

  return (
    <div className="flex items-center gap-2">
      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Trạng thái
            {selectedStatus.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedStatus.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statusOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedStatus.includes(option.value)}
              onCheckedChange={(checked) => handleStatusChange(option.value, checked)}
            >
              <span className="mr-2">{option.emoji}</span>
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Loại thú
            {selectedTypes.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedTypes.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Lọc theo loại thú</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {typeOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedTypes.includes(option.value)}
              onCheckedChange={(checked) => handleTypeChange(option.value, checked)}
            >
              <span className="mr-2">{option.emoji}</span>
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" />
          Xóa bộ lọc
        </Button>
      )}

      {/* Active Filter Badges */}
      {selectedStatus.length > 0 && (
        <div className="flex items-center gap-1">
          {selectedStatus.map((status) => {
            const option = statusOptions.find(opt => opt.value === status)
            return option ? (
              <Badge key={status} variant="secondary" className="text-xs">
                <span className="mr-1">{option.emoji}</span>
                {option.label}
                <button
                  onClick={() => handleStatusChange(status, false)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null
          })}
        </div>
      )}

      {selectedTypes.length > 0 && (
        <div className="flex items-center gap-1">
          {selectedTypes.map((type) => {
            const option = typeOptions.find(opt => opt.value === type)
            return option ? (
              <Badge key={type} variant="secondary" className="text-xs">
                <span className="mr-1">{option.emoji}</span>
                {option.label}
                <button
                  onClick={() => handleTypeChange(type, false)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}