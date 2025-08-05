"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  options: SelectOption[]
  disabled?: boolean
  className?: string
  error?: boolean
  loading?: boolean
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ 
    value, 
    onValueChange, 
    placeholder = "Chọn một tùy chọn", 
    options, 
    disabled = false, 
    className,
    error = false,
    loading = false,
    ...props 
  }, ref) => {
    const [open, setOpen] = React.useState(false)
    const selectedOption = options.find(option => option.value === value)

    const handleSelect = (optionValue: string) => {
      onValueChange?.(optionValue)
      setOpen(false)
    }

    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            className={cn(
              "w-full justify-between",
              error && "border-red-500",
              className
            )}
            disabled={disabled || loading}
            {...props}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                Đang tải...
              </span>
            ) : selectedOption ? (
              selectedOption.label
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>Chọn tùy chọn</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 overflow-y-auto px-4 pb-4">
            {options.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Không có dữ liệu
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-accent",
                    value === option.value && "bg-accent"
                  )}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    )
  }
)

Select.displayName = "Select"

export { Select, type SelectOption, type SelectProps }