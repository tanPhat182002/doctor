'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Header } from './header'
import { MobileNav } from './mobile-nav'
import { PageTransition } from './page-transition'

interface MobileLayoutProps {
  children: React.ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)

  // Handle scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle swipe gestures for navigation
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    const velocity = 500

    if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > velocity) {
      if (info.offset.x > 0) {
        setSwipeDirection('right')
        // Navigate back or to previous page
        window.history.back()
      } else {
        setSwipeDirection('left')
        // Navigate forward (if applicable)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 lg:hidden">
      {/* Mobile Header */}
      <Header />

      {/* Main Content Area with Swipe Gestures */}
      <motion.main 
        className="relative overflow-hidden"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{
          paddingTop: '4rem', // Header height
          paddingBottom: '5rem', // Navigation height + safe area
          minHeight: 'calc(100vh - 4rem)'
        }}
      >
        {/* Swipe Indicator */}
        <AnimatePresence>
          {swipeDirection && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                'fixed top-1/2 z-50 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium',
                swipeDirection === 'left' ? 'right-4' : 'left-4'
              )}
              onAnimationComplete={() => setSwipeDirection(null)}
            >
              {swipeDirection === 'left' ? '← Quay lại' : 'Tiến tới →'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content with Transitions */}
        <div className="container mx-auto px-4 py-4">
          <PageTransition key={pathname}>
            {children}
          </PageTransition>
        </div>

        {/* Pull to Refresh Indicator */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-blue-500 text-white px-4 py-2 rounded-b-lg text-sm font-medium"
          initial={{ y: -100 }}
          animate={{ y: isScrolled ? -100 : -50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          ↓ Kéo để làm mới
        </motion.div>
      </motion.main>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Safe Area Bottom Padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  )
}

// Mobile-specific components
export function MobileCard({ 
  children, 
  className, 
  onClick
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <motion.div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-200/50 p-4 mb-4',
        'active:scale-[0.98] transition-transform duration-150',
        className
      )}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

export function MobileButton({ 
  children, 
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled,
  type
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}) {
  const baseClasses = 'font-medium rounded-xl transition-all duration-200 active:scale-95 touch-manipulation'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  }

  return (
    <motion.button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </motion.button>
  )
}

export function MobileInput({ 
  className, 
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-4 py-3 text-base rounded-xl border border-gray-300',
        'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
        'bg-white transition-all duration-200 min-h-[44px] touch-manipulation',
        className
      )}
      {...props}
    />
  )
}

// Mobile-optimized list component
export function MobileList({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  )
}

export function MobileListItem({ 
  children, 
  onClick,
  className 
}: { 
  children: React.ReactNode
  onClick?: () => void
  className?: string 
}) {
  return (
    <motion.div
      className={cn(
        'bg-white rounded-lg p-4 border border-gray-200/50',
        'active:bg-gray-50 transition-colors duration-150',
        onClick && 'cursor-pointer',
        className
      )}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}