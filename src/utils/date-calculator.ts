/**
 * Utility functions for date calculations in pet management system
 */

/**
 * Calculate follow-up date based on examination date and number of days
 * @param ngayKham - Examination date (ISO string or Date)
 * @param soNgay - Number of days to add
 * @returns Formatted date string for datetime-local input or null if invalid
 */
export function calculateFollowUpDate(ngayKham: string | Date, soNgay: string | number): string | null {
  if (!ngayKham) return null
  
  const soNgayNum = typeof soNgay === 'string' ? parseInt(soNgay) : soNgay
  if (isNaN(soNgayNum) || soNgayNum < 0) return null
  
  const examDate = new Date(ngayKham)
  if (isNaN(examDate.getTime())) return null
  
  const followUpDate = new Date(examDate)
  followUpDate.setDate(examDate.getDate() + soNgayNum)
  
  // Format to datetime-local input format (YYYY-MM-DDTHH:mm)
  return followUpDate.toISOString().slice(0, 16)
}

/**
 * Calculate number of days between examination date and follow-up date
 * @param ngayKham - Examination date (ISO string or Date)
 * @param ngayTaiKham - Follow-up date (ISO string or Date)
 * @returns Number of days or null if invalid
 */
export function calculateDaysDifference(ngayKham: string | Date, ngayTaiKham: string | Date): number | null {
  if (!ngayKham || !ngayTaiKham) return null
  
  const examDate = new Date(ngayKham)
  const followUpDate = new Date(ngayTaiKham)
  
  if (isNaN(examDate.getTime()) || isNaN(followUpDate.getTime())) return null
  
  // Calculate difference in days
  const timeDiff = followUpDate.getTime() - examDate.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
  
  return daysDiff >= 0 ? daysDiff : null
}

/**
 * Format date for display
 * @param date - Date to format (ISO string or Date)
 * @param includeTime - Whether to include time in the format
 * @returns Formatted date string
 */
export function formatDateForDisplay(date: string | Date, includeTime: boolean = true): string {
  if (!date) return ''
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return ''
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
  
  return dateObj.toLocaleDateString('vi-VN', options)
}