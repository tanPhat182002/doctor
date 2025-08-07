'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  text = '',
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3',
      fullScreen ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' : '',
      className
    )}>
      {/* Animated spinner */}
      <motion.div
        className={cn(
          'border-2 border-gray-200 border-t-blue-600 rounded-full',
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      
      {/* Loading dots animation */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
      
      {/* Loading text */}
      {text && (
        <motion.p 
          className={cn(
            'text-gray-600 font-medium',
            textSizeClasses[size]
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )

  return spinner
}

// Skeleton loader for cards
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-4 animate-pulse', className)}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  )
}

// Table skeleton loader
export function TableSkeleton({ rows = 5, className = '' }: { rows?: number, className?: string }) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 overflow-hidden', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="border-b border-gray-100 p-4 last:border-b-0">
          <div className="flex gap-4 items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-3 bg-gray-200 rounded flex-1 animate-pulse"></div>
            ))}
            <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Button loading state
export function ButtonSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <motion.div
      className={cn(
        'border-2 border-white/30 border-t-white rounded-full',
        size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  )
}

// Page loading overlay
export function PageLoader({ text = 'Đang tải...' }: { text?: string }) {
  return (
    <motion.div
      className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </motion.div>
  )
}