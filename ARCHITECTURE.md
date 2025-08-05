# Pet Management System - Architecture Documentation

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin pages
│   │   ├── dashboard/     # Dashboard page
│   │   ├── khach-hang/    # Customer management
│   │   ├── ho-so-thu/     # Pet records management
│   │   └── lich-kham/     # Schedule management
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── tables/           # Table components
├── lib/                  # Core libraries
│   └── validation.ts     # Centralized validation logic
├── utils/                # Utility functions
│   ├── format.ts         # Formatting utilities
│   ├── helpers.ts        # General helpers
│   └── index.ts          # Centralized exports
├── constants/            # Application constants
│   ├── app.ts            # App-wide constants
│   └── index.ts          # Centralized exports
└── types/                # TypeScript type definitions
    ├── index.ts          # Main types
    └── constants.ts      # Type-specific constants
```

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- **Pages**: Handle routing and page-level logic
- **Components**: Reusable UI elements
- **Utils**: Pure utility functions
- **Lib**: Core business logic and validation
- **Types**: TypeScript definitions
- **Constants**: Application-wide constants

### 2. **Centralized Management**
- **Validation**: All form validation logic in `/lib/validation.ts`
- **Types**: Centralized TypeScript definitions in `/types/`
- **Constants**: App constants in `/constants/`
- **Utils**: Helper functions in `/utils/`

### 3. **Code Reusability**
- Shared validation rules across forms
- Reusable utility functions
- Consistent type definitions
- Centralized constants

## 🔧 Key Optimizations

### Form Validation
- **Before**: Duplicate validation logic in each form
- **After**: Centralized `FormValidator` class with reusable rules
- **Benefits**: 
  - Consistent validation across forms
  - Easy to maintain and update
  - Reduced code duplication

### File Organization
- **Before**: Scattered utility functions and constants
- **After**: Organized in dedicated directories with index exports
- **Benefits**:
  - Easy to find and import utilities
  - Better code organization
  - Improved developer experience

### Type Safety
- **Before**: Some type inconsistencies
- **After**: Strict TypeScript types with proper validation
- **Benefits**:
  - Better IDE support
  - Compile-time error detection
  - Improved code reliability

## 📋 Validation System

### ValidationRules
Common validation rules that can be reused:
- `required()` - Check if field is not empty
- `minLength()` - Minimum length validation
- `phone()` - Vietnamese phone number validation
- `dateNotInPast()` - Date validation
- `dateAfter()` - Date comparison validation
- `select()` - Select field validation

### FormValidator
Specialized validators for different forms:
- `validateCustomer()` - Customer form validation
- `validatePet()` - Pet form validation
- `validateSchedule()` - Schedule form validation
- `validatePetEdit()` - Pet edit form validation

## 🛠️ Utility Functions

### Format Utils (`/utils/format.ts`)
- Date and time formatting
- Phone number formatting
- Currency formatting
- Text manipulation

### Helper Utils (`/utils/helpers.ts`)
- ID generation
- Debouncing
- Object manipulation
- Array utilities
- Async helpers

## 📊 Constants Management

### App Constants (`/constants/app.ts`)
- API configuration
- Pagination settings
- Validation rules
- UI constants
- Routes
- Messages
- Theme configuration

### Type Constants (`/types/constants.ts`)
- Animal types
- Health statuses
- Exam statuses
- Status configurations

## 🚀 Benefits of This Architecture

1. **Maintainability**: Easy to update and modify code
2. **Scalability**: Structure supports growth
3. **Reusability**: Shared components and utilities
4. **Type Safety**: Strong TypeScript integration
5. **Developer Experience**: Clear organization and imports
6. **Performance**: Optimized builds and imports
7. **Consistency**: Standardized patterns across the app

## 📝 Usage Examples

### Using Validation
```typescript
import { FormValidator } from '@/lib/validation'

const errors = FormValidator.validateCustomer(formData)
if (FormValidator.hasErrors(errors)) {
  // Handle validation errors
}
```

### Using Utils
```typescript
import { formatDate, debounce, isEmpty } from '@/utils'

const formattedDate = formatDate(new Date())
const debouncedSearch = debounce(searchFunction, 300)
const isEmptyObject = isEmpty({})
```

### Using Constants
```typescript
import { ROUTES, MESSAGES, VALIDATION_RULES } from '@/constants'

router.push(ROUTES.CUSTOMERS)
toast.success(MESSAGES.SUCCESS.CREATE)
const isValidName = name.length >= VALIDATION_RULES.MIN_NAME_LENGTH
```

This architecture provides a solid foundation for the Pet Management System with improved maintainability, reusability, and developer experience.