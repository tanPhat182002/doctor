'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'

interface SearchBarProps {
  placeholder?: string
  defaultValue?: string
  className?: string
}

export function SearchBar({ 
  placeholder = 'Tìm kiếm...', 
  defaultValue = '',
  className 
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(defaultValue)
  const [isSearching, setIsSearching] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 150)

  useEffect(() => {
    const currentSearch = searchParams.get('search') || ''
    
    // Only update URL if the search term actually changed
    if (debouncedSearchTerm !== currentSearch) {
      const params = new URLSearchParams(searchParams.toString())
      
      // Only search if term has at least 2 characters or is empty (to clear)
      if (debouncedSearchTerm.length >= 2 || debouncedSearchTerm === '') {
        setIsSearching(true)
        
        if (debouncedSearchTerm) {
          params.set('search', debouncedSearchTerm)
        } else {
          params.delete('search')
        }
        
        params.set('page', '1') // Reset to first page when searching
        
        // Use replace instead of push to avoid navigation issues
        router.replace(`?${params.toString()}`)
        
        // Simulate search completion
        setTimeout(() => setIsSearching(false), 100)
      }
    }
  }, [debouncedSearchTerm, router, searchParams])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setIsSearching(false)
  }, [])

  return (
    <div className={`relative ${className}`}>
      {isSearching ? (
        <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 animate-spin" />
      ) : (
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      )}
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-10"
        autoComplete="off"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSearch}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {searchTerm.length > 0 && searchTerm.length < 2 && (
        <div className="absolute top-full left-0 mt-1 text-xs text-gray-500">
          Nhập ít nhất 2 ký tự để tìm kiếm
        </div>
      )}
    </div>
  )
}