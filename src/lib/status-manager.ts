/**
 * Centralized Status Management System
 * Provides consistent status configurations and utilities across the application
 */

import type { 
  HealthStatus, 
  ExamStatus, 
  AnimalType,
  StatusConfig,
  AnimalTypeConfig,
  HealthStatusConfig,
  ExamStatusConfig
} from '@/types'

// Extended exam status type for internal use
type ExtendedExamStatus = ExamStatus | 'DANG_KHAM' | 'CHO_KHAM'

// Extended exam status config interface
interface ExtendedExamStatusConfig {
  value: ExtendedExamStatus
  label: string
  emoji: string
  className: string
  dotClass?: string
}

// ============================================================================
// CORE STATUS CONFIGURATIONS
// ============================================================================

/**
 * Health Status Configurations
 */
export const HEALTH_STATUS_CONFIGS: Record<HealthStatus, HealthStatusConfig & { className: string; dotClass?: string }> = {
  KHOE_MANH: {
    value: 'KHOE_MANH',
    label: 'Khỏe mạnh',
    emoji: '💚',
    className: 'bg-green-100 text-green-800 border-green-200',
    dotClass: 'bg-green-500'
  },
  THEO_DOI: {
    value: 'THEO_DOI',
    label: 'Theo dõi',
    emoji: '⚠️',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dotClass: 'bg-yellow-500'
  },
  MANG_THAI: {
    value: 'MANG_THAI',
    label: 'Mang thai',
    emoji: '🤰',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
    dotClass: 'bg-purple-500'
  },
  SAU_SINH: {
    value: 'SAU_SINH',
    label: 'Sau sinh',
    emoji: '👶',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    dotClass: 'bg-blue-500'
  },
  CACH_LY: {
    value: 'CACH_LY',
    label: 'Cách ly',
    emoji: '🚨',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    dotClass: 'bg-orange-500'
  },
  DANG_DIEU_TRI: {
    value: 'DANG_DIEU_TRI',
    label: 'Đang điều trị',
    emoji: '🏥',
    className: 'bg-red-100 text-red-800 border-red-200',
    dotClass: 'bg-red-500'
  }
} as const

/**
 * Exam Status Configurations
 */
export const EXAM_STATUS_CONFIGS: Record<ExtendedExamStatus, ExtendedExamStatusConfig> = {
  CHUA_KHAM: {
    value: 'CHUA_KHAM',
    label: 'Chưa khám',
    emoji: '⏳',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dotClass: 'bg-yellow-500'
  },
  DA_KHAM: {
    value: 'DA_KHAM',
    label: 'Đã khám',
    emoji: '✅',
    className: 'bg-green-100 text-green-800 border-green-200',
    dotClass: 'bg-green-500'
  },
  HUY: {
    value: 'HUY',
    label: 'Hủy',
    emoji: '❌',
    className: 'bg-red-100 text-red-800 border-red-200',
    dotClass: 'bg-red-500'
  },
  HOAN: {
    value: 'HOAN',
    label: 'Hoãn',
    emoji: '⏸️',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    dotClass: 'bg-orange-500'
  },
  // Additional exam statuses for appointment management
  DANG_KHAM: {
    value: 'DANG_KHAM',
    label: 'Đang khám',
    emoji: '🔵',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    dotClass: 'bg-blue-500'
  },
  CHO_KHAM: {
    value: 'CHO_KHAM',
    label: 'Chờ khám',
    emoji: '🟡',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dotClass: 'bg-yellow-500'
  }
} as const

/**
 * Animal Type Configurations
 */
export const ANIMAL_TYPE_CONFIGS: Record<AnimalType, AnimalTypeConfig> = {
  CHO: {
    value: 'CHO',
    label: 'Chó',
    emoji: '🐕'
  },
  MEO: {
    value: 'MEO',
    label: 'Mèo',
    emoji: '🐱'
  },
  CHIM: {
    value: 'CHIM',
    label: 'Chim',
    emoji: '🐦'
  },
  CA: {
    value: 'CA',
    label: 'Cá',
    emoji: '🐠'
  },
  THO: {
    value: 'THO',
    label: 'Thỏ',
    emoji: '🐰'
  },
  HAMSTER: {
    value: 'HAMSTER',
    label: 'Hamster',
    emoji: '🐹'
  },
  KHAC: {
    value: 'KHAC',
    label: 'Khác',
    emoji: '🐾'
  }
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get health status configuration
 */
export function getHealthStatusConfig(status: HealthStatus) {
  return HEALTH_STATUS_CONFIGS[status] || {
    value: status,
    label: status,
    emoji: '❓',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    dotClass: 'bg-gray-500'
  }
}

/**
 * Get exam status configuration
 */
export function getExamStatusConfig(status: ExtendedExamStatus | string) {
  const config = EXAM_STATUS_CONFIGS[status as ExtendedExamStatus]
  return config || {
    value: status as ExtendedExamStatus,
    label: status,
    emoji: '❓',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    dotClass: 'bg-gray-500'
  }
}

/**
 * Get animal type configuration
 */
export function getAnimalTypeConfig(type: AnimalType | string) {
  const config = ANIMAL_TYPE_CONFIGS[type as AnimalType]
  return config || {
    value: type as AnimalType,
    label: type,
    emoji: '🐾'
  }
}

/**
 * Get all health status options for forms
 */
export function getHealthStatusOptions(): HealthStatusConfig[] {
  return Object.values(HEALTH_STATUS_CONFIGS)
}

/**
 * Get all exam status options for forms
 */
export function getExamStatusOptions(): ExamStatusConfig[] {
  const validExamStatuses: ExamStatus[] = ['CHUA_KHAM', 'DA_KHAM', 'HUY', 'HOAN']
  return validExamStatuses.map(status => ({
    value: status,
    label: EXAM_STATUS_CONFIGS[status].label,
    emoji: EXAM_STATUS_CONFIGS[status].emoji
  }))
}

/**
 * Get all animal type options for forms
 */
export function getAnimalTypeOptions(): AnimalTypeConfig[] {
  return Object.values(ANIMAL_TYPE_CONFIGS)
}

/**
 * Check if status is a valid health status
 */
export function isValidHealthStatus(status: string): status is HealthStatus {
  return status in HEALTH_STATUS_CONFIGS
}

/**
 * Check if status is a valid exam status
 */
export function isValidExamStatus(status: string): status is ExtendedExamStatus {
  return status in EXAM_STATUS_CONFIGS
}

/**
 * Check if type is a valid animal type
 */
export function isValidAnimalType(type: string): type is AnimalType {
  return type in ANIMAL_TYPE_CONFIGS
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * Legacy STATUS_CONFIG for backward compatibility
 * @deprecated Use specific status config functions instead
 */
export const STATUS_CONFIG: Record<string, StatusConfig> = {
  ...Object.fromEntries(
    Object.entries(HEALTH_STATUS_CONFIGS).map(([key, config]) => [
      key,
      {
        label: config.label,
        className: config.className,
        emoji: config.emoji
      }
    ])
  ),
  ...Object.fromEntries(
    Object.entries(EXAM_STATUS_CONFIGS).map(([key, config]) => [
      key,
      {
        label: config.label,
        className: config.className,
        emoji: config.emoji
      }
    ])
  )
}

/**
 * Legacy arrays for backward compatibility
 * @deprecated Use specific option functions instead
 */
export const HEALTH_STATUSES = getHealthStatusOptions()
export const EXAM_STATUSES = getExamStatusOptions()
export const ANIMAL_TYPES = getAnimalTypeOptions()
export const ANIMAL_EMOJIS = Object.fromEntries(
  Object.entries(ANIMAL_TYPE_CONFIGS).map(([key, config]) => [key, config.emoji])
)

// ============================================================================
// STATUS GROUPS FOR FILTERING
// ============================================================================

/**
 * Status groups for advanced filtering
 */
export const STATUS_GROUPS = {
  HEALTH: {
    HEALTHY: ['KHOE_MANH'] as HealthStatus[],
    MONITORING: ['THEO_DOI', 'MANG_THAI', 'SAU_SINH'] as HealthStatus[],
    CRITICAL: ['CACH_LY', 'DANG_DIEU_TRI'] as HealthStatus[]
  },
  EXAM: {
    PENDING: ['CHUA_KHAM', 'CHO_KHAM'] as ExtendedExamStatus[],
    IN_PROGRESS: ['DANG_KHAM'] as ExtendedExamStatus[],
    COMPLETED: ['DA_KHAM'] as ExtendedExamStatus[],
    CANCELLED: ['HUY', 'HOAN'] as ExtendedExamStatus[]
  }
} as const

/**
 * Get statuses by group
 */
export function getStatusesByGroup(type: 'HEALTH' | 'EXAM', group: string) {
  return STATUS_GROUPS[type][group as keyof typeof STATUS_GROUPS[typeof type]] || []
}