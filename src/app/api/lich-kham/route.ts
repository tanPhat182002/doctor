import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { 
  apiMiddleware, 
  withValidation, 
  createSuccessResponse, 
  createErrorResponse,
  invalidateScheduleCache,
  commonSchemas
} from '@/lib/api-middleware'

// Schema for creating a new examination schedule
const createScheduleSchema = z.object({
  maHoSo: z.string().min(1, 'Mã hồ sơ là bắt buộc'),
  ngayKham: z.string().transform((str) => new Date(str)),
  ngayTaiKham: z.string().transform((str) => new Date(str)).nullable().optional(),
  ghiChu: z.string().nullable().optional(),
  trangThaiKham: z.enum(['CHUA_KHAM', 'DA_KHAM', 'HUY', 'HOAN']),
  soNgay: z.number().optional().default(0)
})

// Schema for getting examination schedules
const getScheduleSchema = commonSchemas.pagination.extend({
  search: z.string().optional(),
  trangThaiKham: z.enum(['CHUA_KHAM', 'DA_KHAM', 'HUY', 'HOAN']).optional(),
  maHoSo: z.string().optional()
})

// POST handler with middleware
const postHandler = async (request: NextRequest, validatedData: z.infer<typeof createScheduleSchema>) => {
  // Check if pet exists
  const pet = await prisma.hoSoThu.findUnique({
    where: { maHoSo: validatedData.maHoSo }
  })
  
  if (!pet) {
    return createErrorResponse('Không tìm thấy hồ sơ thú cưng', 404)
  }
  
  // Create new examination schedule
  const newSchedule = await prisma.lichTheoDoi.create({
    data: {
      maHoSo: validatedData.maHoSo,
      ngayKham: validatedData.ngayKham,
      ngayTaiKham: validatedData.ngayTaiKham || null,
      ghiChu: validatedData.ghiChu || null,
      trangThaiKham: validatedData.trangThaiKham,
        soNgay: validatedData.soNgay || 0
    },
    include: {
      hoSoThu: {
        include: {
          khachHang: true
        }
      }
    }
  })
  
  // Invalidate cache after creating new schedule
  invalidateScheduleCache()
  
  return createSuccessResponse(newSchedule, {
    message: 'Tạo lịch khám thành công'
  })
}

// Export POST with middleware
export const POST = apiMiddleware.mutation(
  withValidation(createScheduleSchema, postHandler)
)

// GET handler with caching
const getHandler = async (request: NextRequest, validatedData: z.infer<typeof getScheduleSchema>) => {
  const { page, limit: pageSize, search, trangThaiKham, maHoSo } = validatedData
    
  // Build where clause
    const where: {
      trangThaiKham?: string
      maHoSo?: string
      OR?: Array<{
        hoSoThu?: {
          tenThu?: {
            contains: string
            mode: 'insensitive'
          }
          khachHang?: {
            tenKhachHang?: {
              contains: string
              mode: 'insensitive'
            }
          }
        }
        ghiChu?: {
          contains: string
          mode: 'insensitive'
        }
      }>
    } = {}
    
    if (trangThaiKham) {
      where.trangThaiKham = trangThaiKham
    }
    
    if (maHoSo) {
      where.maHoSo = maHoSo
    }
    
    if (search) {
      where.OR = [
        {
          hoSoThu: {
            tenThu: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          hoSoThu: {
            khachHang: {
              tenKhachHang: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        },
        {
          ghiChu: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }
    
    // Get total count
    const total = await prisma.lichTheoDoi.count({ where })
    
    // Get schedules with pagination
    const schedules = await prisma.lichTheoDoi.findMany({
      where,
      include: {
        hoSoThu: {
          include: {
            khachHang: {
              select: {
                maKhachHang: true,
                tenKhachHang: true,
                soDienThoai: true,
                diaChi: true
              }
            }
          }
        }
      },
      orderBy: {
        ngayKham: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
    
    const totalPages = Math.ceil(total / pageSize)
  
  return createSuccessResponse(schedules, {
    pagination: {
      total,
      page,
      limit: pageSize,
      totalPages
    },
    cache: {
      maxAge: 120, // 2 minutes
      staleWhileRevalidate: 300, // 5 minutes
    }
  })
}

// Export GET with caching middleware
export const GET = apiMiddleware.cached(
  withValidation(getScheduleSchema, getHandler)
)