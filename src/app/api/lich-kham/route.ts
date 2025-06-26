import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Schema for creating a new examination schedule
const createScheduleSchema = z.object({
  maHoSo: z.string().min(1, 'Mã hồ sơ là bắt buộc'),
  ngayKham: z.string().transform((str) => new Date(str)),
  ngayTaiKham: z.string().transform((str) => new Date(str)).nullable().optional(),
  ghiChu: z.string().nullable().optional(),
  trangThaiKham: z.enum(['CHUA_KHAM', 'DA_KHAM', 'HUY', 'HOAN'])
})

// Schema for getting examination schedules
const getScheduleSchema = z.object({
  page: z.string().transform((val) => parseInt(val) || 1),
  limit: z.string().transform((val) => Math.min(parseInt(val) || 10, 100)),
  search: z.string().optional(),
  trangThaiKham: z.enum(['CHUA_KHAM', 'DA_KHAM', 'HUY', 'HOAN']).optional(),
  maHoSo: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = createScheduleSchema.parse(body)
    
    // Check if pet exists
    const pet = await prisma.hoSoThu.findUnique({
      where: { maHoSo: validatedData.maHoSo }
    })
    
    if (!pet) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy hồ sơ thú cưng' },
        { status: 404 }
      )
    }
    
    // Create new examination schedule
    const newSchedule = await prisma.lichTheoDoi.create({
      data: {
        maHoSo: validatedData.maHoSo,
        ngayKham: validatedData.ngayKham,
        ngayTaiKham: validatedData.ngayTaiKham || null,
        ghiChu: validatedData.ghiChu || null,
        trangThaiKham: validatedData.trangThaiKham
      },
      include: {
        hoSoThu: {
          include: {
            khachHang: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: newSchedule,
      message: 'Tạo lịch khám thành công'
    })
    
  } catch (error) {
    console.error('Error creating examination schedule:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dữ liệu không hợp lệ',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const queryData = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: searchParams.get('search') || undefined,
      trangThaiKham: searchParams.get('trangThaiKham') || undefined,
      maHoSo: searchParams.get('maHoSo') || undefined
    }
    
    const { page, limit: pageSize, search, trangThaiKham, maHoSo } = getScheduleSchema.parse(queryData)
    
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
    
    return NextResponse.json({
      success: true,
      data: schedules,
      pagination: {
        total,
        page,
        limit: pageSize,
        totalPages
      }
    })
    
  } catch (error) {
    console.error('Error fetching examination schedules:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tham số truy vấn không hợp lệ',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    )
  }
}