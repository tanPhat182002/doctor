'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, User, X, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Customer } from '@/types'
import { useDebounce } from '@/hooks/use-debounce'

interface CustomerSearchProps {
  value: string
  onChange: (customerId: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
}

export function CustomerSearch({
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "Tìm kiếm khách hàng..."
}: CustomerSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search customers when search term changes
  useEffect(() => {
    const searchCustomers = async () => {
      if (debouncedSearchTerm.length < 2) {
        setCustomers([])
        setHasSearched(false)
        return
      }

      setIsLoading(true)
      setHasSearched(true)
      
      try {
        const response = await fetch(
          `/api/khach-hang?search=${encodeURIComponent(debouncedSearchTerm)}&limit=20`
        )
        if (response.ok) {
          const data = await response.json()
          setCustomers(data.customers || [])
        }
      } catch (error) {
        console.error('Error searching customers:', error)
        setCustomers([])
      } finally {
        setIsLoading(false)
      }
    }

    searchCustomers()
  }, [debouncedSearchTerm])

  // Load selected customer info when value changes
  useEffect(() => {
    const loadSelectedCustomer = async () => {
      if (value && !selectedCustomer) {
        try {
          const response = await fetch(`/api/khach-hang/${value}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              setSelectedCustomer(data.data)
              setSearchTerm('')
            }
          }
        } catch (error) {
          console.error('Error loading customer:', error)
        }
      } else if (!value) {
        setSelectedCustomer(null)
        setSearchTerm('')
      }
    }

    loadSelectedCustomer()
  }, [value, selectedCustomer])

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setSearchTerm('')
    setIsOpen(false)
    onChange(customer.maKhachHang)
  }

  const handleClear = () => {
    setSelectedCustomer(null)
    setSearchTerm('')
    setCustomers([])
    setHasSearched(false)
    onChange('')
    inputRef.current?.focus()
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    if (selectedCustomer) {
      setSearchTerm('')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    setIsOpen(true)
    
    // Clear selection if user starts typing
    if (selectedCustomer && newValue !== '') {
      setSelectedCustomer(null)
      onChange('')
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={selectedCustomer ? `${selectedCustomer.tenKhachHang} - ${selectedCustomer.soDienThoai}` : searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${error ? 'border-red-500 focus-visible:border-red-500' : ''}`}
          disabled={disabled}
        />
        
        {(selectedCustomer || searchTerm) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-8 flex items-center pr-2 hover:text-gray-600"
            disabled={disabled}
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Đang tìm kiếm...
              </div>
            </div>
          )}
          
          {!isLoading && customers.length === 0 && hasSearched && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              {debouncedSearchTerm.length < 2 
                ? 'Nhập ít nhất 2 ký tự để tìm kiếm'
                : 'Không tìm thấy khách hàng nào'
              }
            </div>
          )}
          
          {!isLoading && !hasSearched && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Nhập tên hoặc số điện thoại để tìm kiếm khách hàng
            </div>
          )}
          
          {!isLoading && customers.length > 0 && (
            <>
              {customers.map((customer) => (
                <button
                  key={customer.maKhachHang}
                  type="button"
                  onClick={() => handleCustomerSelect(customer)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {customer.tenKhachHang}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        📞 {customer.soDienThoai}
                        {customer.diaChi && (
                          <span className="ml-2">📍 {customer.diaChi}{customer.xa?.tenXa ? `, ${customer.xa.tenXa}` : ''}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              
              {customers.length === 20 && (
                <div className="px-4 py-2 text-xs text-gray-500 text-center bg-gray-50">
                  Hiển thị 20 kết quả đầu tiên. Nhập thêm để thu hẹp kết quả.
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}