'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface MobilePageWrapperProps {
  children: ReactNode
  title: string
  subtitle?: string
  showBackButton?: boolean
  backUrl?: string
  actions?: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function MobilePageWrapper({
  children,
  title,
  subtitle,
  showBackButton = true,
  backUrl,
  actions,
  className,
  headerClassName,
  contentClassName
}: MobilePageWrapperProps) {
  const router = useRouter()
  const isMobile = useIsMobile()

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl)
    } else {
      router.back()
    }
  }

  // Only render mobile wrapper on mobile devices
  if (!isMobile) {
    return <>{children}</>
  }

  return (
    <div className={cn('min-h-screen bg-gray-50 pb-20', className)}>
      {/* Mobile Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          'sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm',
          headerClassName
        )}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn('px-4 py-6', contentClassName)}
      >
        {children}
      </motion.div>
    </div>
  )
}

// Mobile-specific components for common patterns
export function MobileSection({
  title,
  children,
  className,
  headerAction
}: {
  title: string
  children: ReactNode
  className?: string
  headerAction?: ReactNode
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {headerAction}
      </div>
      {children}
    </div>
  )
}

export function MobileEmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {action}
    </motion.div>
  )
}

export function MobileFloatingAction({
  onClick,
  icon: Icon,
  label,
  className
}: {
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label?: string
  className?: string
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'fixed bottom-24 right-4 z-40 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <Icon className="h-6 w-6" />
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </motion.button>
  )
}