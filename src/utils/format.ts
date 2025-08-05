/**
 * Utility functions for formatting data
 */

// Date formatting
export const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Phone number formatting
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as xxx-xxx-xxxx
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  
  // Format as +84-xxx-xxx-xxxx for Vietnamese numbers
  if (cleaned.length === 11 && cleaned.startsWith('84')) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '+$1-$2-$3-$4')
  }
  
  return phone
}

// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

// Text truncation
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Capitalize first letter
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// Convert snake_case to Title Case
export const snakeToTitle = (text: string): string => {
  return text
    .split('_')
    .map(word => capitalize(word))
    .join(' ')
}