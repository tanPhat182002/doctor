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
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
]

const petCountOptions = [
  { value: '0', label: 'Chưa có thú cưng' },
  { value: '1', label: '1 thú cưng' },
  { value: '2-5', label: '2-5 thú cưng' },
  { value: '5+', label: 'Trên 5 thú cưng' },
]

export function CustomerFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedStatus, setSelectedStatus] = useState<string[]>(
    searchParams.get('status')?.split(',') || []
  )
  const [selectedPetCount, setSelectedPetCount] = useState<string[]>(
    searchParams.get('petCount')?.split(',') || []
  )

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (selectedStatus.length > 0) {
      params.set('status', selectedStatus.join(','))
    } else {
      params.delete('status')
    }
    
    if (selectedPetCount.length > 0) {
      params.set('petCount', selectedPetCount.join(','))
    } else {
      params.delete('petCount')
    }
    
    params.set('page', '1') // Reset to first page when filtering
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    setSelectedStatus([])
    setSelectedPetCount([])
    const params = new URLSearchParams(searchParams.toString())
    params.delete('status')
    params.delete('petCount')
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  const hasActiveFilters = selectedStatus.length > 0 || selectedPetCount.length > 0
  const activeFilterCount = selectedStatus.length + selectedPetCount.length

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Bộ lọc
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
          {statusOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedStatus.includes(option.value)}
              onCheckedChange={(checked: boolean) => {
                if (checked) {
                  setSelectedStatus([...selectedStatus, option.value])
                } else {
                  setSelectedStatus(selectedStatus.filter(s => s !== option.value))
                }
              }}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Số lượng thú cưng</DropdownMenuLabel>
          {petCountOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedPetCount.includes(option.value)}
              onCheckedChange={(checked: boolean) => {
                if (checked) {
                  setSelectedPetCount([...selectedPetCount, option.value])
                } else {
                  setSelectedPetCount(selectedPetCount.filter(s => s !== option.value))
                }
              }}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <div className="flex gap-2 p-2">
            <Button size="sm" onClick={applyFilters} className="flex-1">
              Áp dụng
            </Button>
            {hasActiveFilters && (
              <Button size="sm" variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}