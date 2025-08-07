// Base types
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// Customer related types
export interface Customer {
  maKhachHang: string
  tenKhachHang: string
  soDienThoai: string
  diaChi: string | null
  createdAt: Date
  xa: {
    maXa: string
    tenXa: string | null
  } | null
  hoSoThu: Pet[]
}

// Pet related types
export interface Pet {
  maHoSo: string
  tenThu: string
 
  trangThai: HealthStatus
  moTa?: string
  createdAt: Date
  khachHang: Customer
  lichTheoDoi: Schedule[]
}

// Schedule related types
export interface Schedule {
  id: number
  ngayKham: Date
  soNgay: number
  ngayTaiKham: Date | null
  trangThaiKham: ExamStatus
  ghiChu: string | null
  maHoSo: string
  hoSoThu: Pet
}

// Enums

export type HealthStatus = 'KHOE_MANH' | 'THEO_DOI' | 'MANG_THAI' | 'SAU_SINH' | 'CACH_LY' | 'DANG_DIEU_TRI'
export type ExamStatus = 'CHUA_KHAM' | 'DA_KHAM' | 'HUY' | 'HOAN'
export type AnimalType = 'CHO' | 'MEO' | 'CHIM' | 'CA' | 'HAMSTER' | 'THO' | 'KHAC'

// Form types
export interface PetFormData {
  tenThu: string
  soNgay: string
  maKhachHang: string
  moTa?: string
  // Lịch theo dõi đầu tiên
  ngayKham: string
  ngayTaiKham: string
  ghiChu: string
  trangThaiKham: ExamStatus
}

export interface CustomerFormData {
  tenKhachHang: string
  soDienThoai: string
  diaChi: string
  maXa: string
}

export interface ScheduleFormData {
  petId: string
  ngayKham: string
  ngayTaiKham: string
  ghiChu: string
  trangThaiKham: ExamStatus
}

// Error types
export interface FormErrors {
  [key: string]: string | undefined
}

export interface PetFormErrors {
  tenThu?: string
  soNgay?: string
  maKhachHang?: string
  moTa?: string
  ngayKham?: string
  ngayTaiKham?: string
  ghiChu?: string
  trangThaiKham?: string
  submit?: string
}

export interface CustomerFormErrors {
  tenKhachHang?: string
  soDienThoai?: string
  diaChi?: string
  maXa?: string
  submit?: string
}

export interface ScheduleFormErrors {
  petId?: string
  ngayKham?: string
  ngayTaiKham?: string
  ghiChu?: string
  trangThaiKham?: string
  submit?: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Table props types
export interface TableProps<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Table-specific types to avoid circular references
export interface PetTableData {
  maHoSo: string
  tenThu: string
  createdAt: Date
  khachHang: {
    maKhachHang: string
    tenKhachHang: string
    soDienThoai: string
    diaChi: string | null
  }
  lichTheoDoi: {
    id: number
    ngayKham: Date
    soNgay: number
    ngayTaiKham: Date | null
    trangThaiKham: string
  }[]
}

export interface CustomerTableData {
  maKhachHang: string
  tenKhachHang: string
  soDienThoai: string
  diaChi: string | null
  createdAt: Date
  xa: {
    maXa: string
    tenXa: string | null
  } | null
  hoSoThu: {
    maHoSo: string
    tenThu: string
    lichTheoDoi: {
      ngayTaiKham: Date | null
    }[]
  }[]
}

export interface ScheduleTableData {
  id: number
  ngayKham: Date
  soNgay: number
  ngayTaiKham: Date | null
  ghiChu: string | null
  trangThaiKham: string
  hoSoThu: {
    maHoSo: string
    tenThu: string
    loai: string
    trangThai: string
    khachHang: {
      maKhachHang: string
      tenKhachHang: string
      soDienThoai: string
      diaChi: string | null
    }
  }
}

export type PetTableProps = TableProps<PetTableData>
export type CustomerTableProps = TableProps<CustomerTableData>
export type ScheduleTableProps = TableProps<ScheduleTableData>

// Calendar types
export interface AppointmentEvent {
  id: number
  title: string
  start: Date
  end: Date
  resource: {
    id: number
    maHoSo: string
    tenThu: string
    loai: AnimalType
    trangThaiKham: ExamStatus
    khachHang: {
      tenKhachHang: string
      soDienThoai: string
    }
    ghiChu?: string
  }
}

// Configuration types
export interface StatusConfig {
  label: string
  className: string
  emoji: string
}

export interface AnimalTypeConfig {
  value: AnimalType
  label: string
  emoji: string
}

export interface HealthStatusConfig {
  value: HealthStatus
  label: string
  emoji: string
}

export interface ExamStatusConfig {
  value: ExamStatus
  label: string
  emoji: string
}