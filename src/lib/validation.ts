import type { 
  CustomerFormErrors, 
  PetFormErrors, 
  ScheduleFormErrors,
  CustomerFormData,
  PetFormData,
  ScheduleFormData
} from '@/types'

// Common validation rules
export const ValidationRules = {
  // Text validations
  required: (value: string, fieldName: string) => {
    if (!value.trim()) {
      return `${fieldName} là bắt buộc`
    }
    return null
  },

  minLength: (value: string, min: number, fieldName: string) => {
    if (value.trim().length < min) {
      return `${fieldName} phải có ít nhất ${min} ký tự`
    }
    return null
  },

  // Phone validation
  phone: (value: string) => {
    if (!value.trim()) {
      return 'Số điện thoại là bắt buộc'
    }
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Số điện thoại không hợp lệ'
    }
    return null
  },

  // Date validations
  dateNotInPast: (dateString: string, fieldName: string) => {
    if (!dateString.trim()) return null
    
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today) {
      return `${fieldName} không thể là ngày trong quá khứ`
    }
    return null
  },

  dateAfter: (laterDate: string, earlierDate: string, laterFieldName: string, earlierFieldName: string) => {
    if (!laterDate.trim() || !earlierDate.trim()) return null
    
    const later = new Date(laterDate)
    const earlier = new Date(earlierDate)
    
    if (later <= earlier) {
      return `${laterFieldName} phải sau ${earlierFieldName}`
    }
    return null
  },

  // Select validations
  select: (value: string, fieldName: string) => {
    if (!value || !value.trim()) {
      return `Vui lòng chọn ${fieldName}`
    }
    return null
  }
}

// Specific form validators
export class FormValidator {
  // Customer form validation
  static validateCustomer(formData: CustomerFormData): CustomerFormErrors {
    const errors: CustomerFormErrors = {}

    // Validate tên khách hàng
    const nameError = ValidationRules.required(formData.tenKhachHang, 'Tên khách hàng') ||
                     ValidationRules.minLength(formData.tenKhachHang, 2, 'Tên khách hàng')
    if (nameError) errors.tenKhachHang = nameError

    // Validate số điện thoại
    const phoneError = ValidationRules.phone(formData.soDienThoai)
    if (phoneError) errors.soDienThoai = phoneError

    // Validate địa chỉ (optional but if provided, should have minimum length)
    if (formData.diaChi.trim()) {
      const addressError = ValidationRules.minLength(formData.diaChi, 5, 'Địa chỉ')
      if (addressError) errors.diaChi = addressError
    }

    return errors
  }

  // Pet form validation
  static validatePet(formData: PetFormData): PetFormErrors {
    const errors: PetFormErrors = {}

    // Validate tên thú
    const nameError = ValidationRules.required(formData.tenThu, 'Tên thú') ||
                     ValidationRules.minLength(formData.tenThu, 2, 'Tên thú')
    if (nameError) errors.tenThu = nameError

    // Validate số ngày
    const daysError = ValidationRules.required(formData.soNgay, 'Số ngày')
    if (daysError) {
      errors.soNgay = daysError
    } else {
      const daysNum = parseInt(formData.soNgay as string)
      if (isNaN(daysNum) || daysNum < 0) {
        errors.soNgay = 'Số ngày phải là số không âm'
      }
    }

    // Validate khách hàng
    const customerError = ValidationRules.select(formData.maKhachHang, 'chủ nhân')
    if (customerError) errors.maKhachHang = customerError

    // Validate lịch theo dõi
    const examDateError = ValidationRules.required(formData.ngayKham, 'Ngày khám')
    if (examDateError) errors.ngayKham = examDateError

    const examStatusError = ValidationRules.select(formData.trangThaiKham, 'trạng thái khám')
    if (examStatusError) errors.trangThaiKham = examStatusError

    return errors
  }

  // Schedule form validation
  static validateSchedule(formData: ScheduleFormData): ScheduleFormErrors {
    const errors: ScheduleFormErrors = {}

    // Validate pet selection
    const petError = ValidationRules.select(formData.petId, 'thú cưng')
    if (petError) errors.petId = petError

    // Validate ngày khám
    const examDateError = ValidationRules.required(formData.ngayKham, 'Ngày khám') ||
                         ValidationRules.dateNotInPast(formData.ngayKham, 'Ngày khám')
    if (examDateError) errors.ngayKham = examDateError

    // Validate ngày tái khám (optional but must be after ngày khám if provided)
    if (formData.ngayTaiKham.trim()) {
      const reExamDateError = ValidationRules.dateAfter(
        formData.ngayTaiKham, 
        formData.ngayKham, 
        'Ngày tái khám', 
        'ngày khám'
      )
      if (reExamDateError) errors.ngayTaiKham = reExamDateError
    }

    // Validate trạng thái khám
    const statusError = ValidationRules.select(formData.trangThaiKham, 'trạng thái khám')
    if (statusError) errors.trangThaiKham = statusError

    return errors
  }

  // Pet edit form validation (using PetFormData and PetFormErrors)
  static validatePetEdit(formData: Pick<PetFormData, 'tenThu' | 'soNgay'>): Pick<PetFormErrors, 'tenThu' | 'soNgay'> {
    const errors: Pick<PetFormErrors, 'tenThu' | 'soNgay'> = {}

    // Validate tên thú cưng
    const nameError = ValidationRules.required(formData.tenThu, 'Tên thú cưng')
    if (nameError) errors.tenThu = nameError

    // Validate số ngày
    const daysError = ValidationRules.required(formData.soNgay, 'Số ngày')
    if (daysError) {
      errors.soNgay = daysError
    } else {
      const daysNum = parseInt(formData.soNgay as string)
      if (isNaN(daysNum) || daysNum < 0) {
        errors.soNgay = 'Số ngày phải là số không âm'
      }
    }

    return errors
  }

  // Generic validation helper
  static hasErrors(errors: Record<string, string | undefined>): boolean {
    return Object.values(errors).some(error => error !== undefined)
  }

  // Clear specific field error
  static clearFieldError<T extends Record<string, string | undefined>>(
    errors: T, 
    field: keyof T
  ): T {
    return { ...errors, [field]: undefined }
  }
}

// Hook for form validation
export const useFormValidation = <TData, TErrors>(
  validateFn: (data: TData) => TErrors
) => {
  const validate = (data: TData): { isValid: boolean; errors: TErrors } => {
    const errors = validateFn(data)
    const isValid = !FormValidator.hasErrors(errors as Record<string, string | undefined>)
    return { isValid, errors }
  }

  return { validate }
}