'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  delay?: number
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
  index?: number
}

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

// Animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const staggerItem = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0
  }
}

// Main page transition component
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{
          type: 'tween',
          ease: 'easeInOut',
          duration: 0.3
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Stagger container for animating lists
export function StaggerContainer({ children, className = '', delay = 0 }: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      transition={{
        delayChildren: delay
      }}
    >
      {children}
    </motion.div>
  )
}

// Individual stagger items
export function StaggerItem({ children, className = '', index = 0 }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={staggerItem}
      transition={{
        duration: 0.4,
        delay: index * 0.1
      }}
    >
      {children}
    </motion.div>
  )
}

// Fade in component with direction
export function FadeIn({ 
  children, 
  className = '', 
  delay = 0, 
  direction = 'up' 
}: FadeInProps) {
  const directionVariants = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 }
  }

  const variants = {
    initial: {
      opacity: 0,
      ...directionVariants[direction]
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0
    }
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
      transition={{
        duration: 0.5,
        delay,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  )
}

// Mobile optimized slide transition
export function SlideTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '-100%', opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Scale transition for modals/cards
export function ScaleTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{
          duration: 0.2,
          ease: 'easeOut'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Hover animation wrapper
export function HoverScale({ children, className = '', scale = 1.05 }: PageTransitionProps & { scale?: number }) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17
      }}
    >
      {children}
    </motion.div>
  )
}

// Loading animation
export function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{
            y: [0, -10, 0]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  )
}

export default PageTransition