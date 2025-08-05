/**
 * @deprecated This file is deprecated. Use @/lib/status-manager instead.
 * Re-exports from status-manager for backward compatibility.
 */

import {
  ANIMAL_TYPES as _ANIMAL_TYPES,


  ANIMAL_EMOJIS as _ANIMAL_EMOJIS
} from '@/lib/status-manager'

// Re-export for backward compatibility
export const ANIMAL_TYPES = _ANIMAL_TYPES

export const ANIMAL_EMOJIS = _ANIMAL_EMOJIS

// Default pagination settings
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
}

// Date format constants
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm'
} as const

// API endpoints
export const API_ENDPOINTS = {
  CUSTOMERS: '/api/khach-hang',
  PETS: '/api/ho-so-thu',
  SCHEDULES: '/api/lich-kham',
} as const