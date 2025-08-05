/**
 * Application-wide constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50] as const
} as const

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm'
} as const

// Validation rules
export const VALIDATION_RULES = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_ADDRESS_LENGTH: 5,
  MAX_ADDRESS_LENGTH: 255,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 500,
  PHONE_REGEX: /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/
} as const

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'] as const
} as const

// UI Constants
export const UI = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  LOADING_DELAY: 200,
  ANIMATION_DURATION: 200
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  ADMIN: '/admin',
  DASHBOARD: '/admin/dashboard',
  CUSTOMERS: '/admin/khach-hang',
  CUSTOMERS_NEW: '/admin/khach-hang/them-moi',
  PETS: '/admin/ho-so-thu',
  PETS_NEW: '/admin/ho-so-thu/them-moi',
  SCHEDULES: '/admin/lich-kham',
  SCHEDULES_NEW: '/admin/lich-kham/them-moi',
  CALENDAR: '/admin/lich-kham/calendar'
} as const

// Status messages
export const MESSAGES = {
  SUCCESS: {
    CREATE: 'Tạo mới thành công!',
    UPDATE: 'Cập nhật thành công!',
    DELETE: 'Xóa thành công!',
    SAVE: 'Lưu thành công!'
  },
  ERROR: {
    GENERIC: 'Có lỗi xảy ra, vui lòng thử lại!',
    NETWORK: 'Lỗi kết nối mạng!',
    NOT_FOUND: 'Không tìm thấy dữ liệu!',
    VALIDATION: 'Dữ liệu không hợp lệ!',
    UNAUTHORIZED: 'Bạn không có quyền thực hiện hành động này!'
  },
  CONFIRM: {
    DELETE: 'Bạn có chắc chắn muốn xóa?',
    UNSAVED_CHANGES: 'Bạn có thay đổi chưa lưu. Bạn có muốn rời khỏi trang?'
  }
} as const

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'pet_management_user_preferences',
  THEME: 'pet_management_theme',
  LANGUAGE: 'pet_management_language',
  LAST_VISITED: 'pet_management_last_visited'
} as const

// Theme configuration
export const THEME = {
  COLORS: {
    PRIMARY: '#3b82f6',
    SECONDARY: '#64748b',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#06b6d4'
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px'
  }
} as const