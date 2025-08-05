# Status Manager

Hệ thống quản lý trạng thái tập trung cho ứng dụng Pet Management.

## Tổng quan

Status Manager cung cấp một cách thống nhất để quản lý các cấu hình trạng thái (Health Status, Exam Status, Animal Type) trong toàn bộ ứng dụng.

## Cấu trúc

### Files
- `status-manager.ts` - Core logic và configurations
- `../hooks/useStatusManager.ts` - React hooks để sử dụng trong components
- `../types/constants.ts` - Deprecated, chỉ để backward compatibility

### Các loại trạng thái

1. **Health Status** - Trạng thái sức khỏe thú cưng
2. **Exam Status** - Trạng thái lịch khám
3. **Animal Type** - Loại động vật

## Cách sử dụng

### 1. Import trực tiếp từ status-manager

```typescript
import {
  getHealthStatusConfig,
  getExamStatusConfig,
  getAnimalTypeConfig,
  HEALTH_STATUSES,
  EXAM_STATUSES,
  ANIMAL_TYPES
} from '@/lib/status-manager'

// Lấy config cho một trạng thái cụ thể
const healthConfig = getHealthStatusConfig('KHOE_MANH')
console.log(healthConfig.label) // "Khỏe mạnh"
console.log(healthConfig.emoji) // "💚"
console.log(healthConfig.className) // "bg-green-100 text-green-800"
```

### 2. Sử dụng React Hooks (Khuyến nghị)

```typescript
import { useStatusManager, useHealthStatus, useExamStatus } from '@/hooks/useStatusManager'

function MyComponent() {
  const { health, exam, animal } = useStatusManager()
  
  // Hoặc sử dụng hook riêng lẻ
  const healthStatus = useHealthStatus()
  const examStatus = useExamStatus()
  
  // Lấy options cho dropdown
  const healthOptions = health.getOptions()
  const examOptions = exam.getOptions()
  
  // Validate trạng thái
  const isValidHealth = health.isValid('KHOE_MANH')
  
  return (
    <select>
      {healthOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.emoji} {option.label}
        </option>
      ))}
    </select>
  )
}
```

### 3. Sử dụng Status Display Hook

```typescript
import { useStatusDisplay } from '@/hooks/useStatusManager'

function StatusBadge({ status, type }: { status: string, type: 'health' | 'exam' }) {
  const statusDisplay = useStatusDisplay()
  
  const display = type === 'health' 
    ? statusDisplay.getHealthDisplay(status as HealthStatus)
    : statusDisplay.getExamDisplay(status as ExamStatus)
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${display.className}`}>
      {display.emoji} {display.label}
    </span>
  )
}
```

## Migration Guide

### Từ types/constants.ts

**Trước:**
```typescript
import { HEALTH_STATUSES, STATUS_CONFIG } from '@/types/constants'

const healthOptions = HEALTH_STATUSES
const statusConfig = STATUS_CONFIG['KHOE_MANH']
```

**Sau:**
```typescript
import { getHealthStatusOptions, getHealthStatusConfig } from '@/lib/status-manager'
// Hoặc
import { useHealthStatus } from '@/hooks/useStatusManager'

const healthOptions = getHealthStatusOptions()
const statusConfig = getHealthStatusConfig('KHOE_MANH')

// Hoặc trong component
function MyComponent() {
  const { getOptions, getConfig } = useHealthStatus()
  const healthOptions = getOptions()
  const statusConfig = getConfig('KHOE_MANH')
}
```

### Từ inline configurations

**Trước:**
```typescript
const statusConfig = {
  KHOE_MANH: { label: 'Khỏe mạnh', className: 'bg-green-100 text-green-800' },
  // ...
}
```

**Sau:**
```typescript
import { getHealthStatusConfig } from '@/lib/status-manager'

const config = getHealthStatusConfig('KHOE_MANH')
```

## Lợi ích

1. **Tập trung hóa**: Tất cả cấu hình trạng thái ở một nơi
2. **Type Safety**: TypeScript support đầy đủ
3. **Consistency**: Đảm bảo tính nhất quán trong toàn bộ app
4. **Performance**: Sử dụng useMemo trong hooks
5. **Extensibility**: Dễ dàng thêm trạng thái mới
6. **Validation**: Built-in validation functions
7. **Grouping**: Hỗ trợ nhóm trạng thái theo logic nghiệp vụ

## Best Practices

1. **Sử dụng hooks trong React components** thay vì import trực tiếp
2. **Sử dụng validation functions** trước khi xử lý trạng thái
3. **Leverage TypeScript** để đảm bảo type safety
4. **Sử dụng status groups** để tổ chức logic nghiệp vụ
5. **Migrate dần dần** từ old patterns sang new patterns

## Troubleshooting

### Lỗi TypeScript
- Đảm bảo import đúng types từ `@/types`
- Sử dụng type assertions cẩn thận với `as` keyword
- Check xem status value có hợp lệ không bằng validation functions

### Performance Issues
- Hooks đã được optimize với useMemo
- Tránh tạo inline objects trong render
- Sử dụng useCallback cho event handlers nếu cần