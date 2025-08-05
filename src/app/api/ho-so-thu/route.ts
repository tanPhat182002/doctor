import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface PrismaError {
  code: string
  meta?: {
    target?: string[]
  }
}

// Validation schema for creating pet record
const createPetSchema = z.object({
  tenThu: z.string().min(1, 'Tên thú cưng không được để trống'),
  soNgay: z.number().min(0, 'Số ngày phải lớn hơn hoặc bằng 0'),
  maKhachHang: z.string().min(1, 'Mã khách hàng không được để trống'),
  lichTheoDoi: z.object({
    ngayKham: z.string().transform((val) => new Date(val)),
    soNgay: z.number().min(0, 'Số ngày phải lớn hơn hoặc bằng 0'),
    ngayTaiKham: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
    ghiChu: z.string().nullable().optional(),
    trangThaiKham: z.string().min(1, 'Trạng thái khám không được để trống')
  })
})

// POST - Create new pet record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validatedData = createPetSchema.parse(body)
    
    // Check if customer exists
    const customer = await prisma.khachHang.findUnique({
      where: { maKhachHang: validatedData.maKhachHang }
    })
    
    if (!customer) {
      return NextResponse.json(
        { message: 'Khách hàng không tồn tại' },
        { status: 400 }
      )
    }
    
    // Create pet record with optional follow-up schedule
    // Let Prisma auto-generate the maHoSo using cuid()
    const newPet = await prisma.hoSoThu.create({
      data: {
        tenThu: validatedData.tenThu,
        maKhachHang: validatedData.maKhachHang,
        ...(validatedData.lichTheoDoi && {
          lichTheoDoi: {
            create: {
              ngayKham: validatedData.lichTheoDoi.ngayKham,
              ngayTaiKham: validatedData.lichTheoDoi.ngayTaiKham,
              ghiChu: validatedData.lichTheoDoi.ghiChu,
              trangThaiKham: validatedData.lichTheoDoi.trangThaiKham,
              soNgay: validatedData.lichTheoDoi.soNgay || 0
            }
          }
        })
      },
      include: {
        khachHang: {
          select: {
            tenKhachHang: true,
            soDienThoai: true
          }
        },
        lichTheoDoi: {
          orderBy: { ngayKham: 'desc' },
          take: 1
        }
      }
    })
    
    return NextResponse.json({
      message: 'Tạo hồ sơ thú thành công',
      data: newPet
    }, { status: 201 })
    
  } catch (error: unknown) {
    console.error('Error creating pet record:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Dữ liệu không hợp lệ',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    // Handle Prisma unique constraint errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const prismaError = error as PrismaError
      const fields = prismaError.meta?.target || []
      return NextResponse.json(
        { 
          message: `Dữ liệu đã tồn tại: ${fields.join(', ')}`,
          error: 'UNIQUE_CONSTRAINT_VIOLATION',
          fields: fields
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'Có lỗi xảy ra khi tạo hồ sơ thú' },
      { status: 500 }
    )
  }
}

// Validation schema for GET request parameters
const getPetSchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().transform(val => parseInt(val || '1', 10)),
  pageSize: z.string().optional().transform(val => parseInt(val || '10', 10))
});

// GET - Fetch pet records with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedParams = getPetSchema.parse(queryParams)

    const { search, page, pageSize } = validatedParams
    const offset = (page - 1) * pageSize
    
    // Build where clause
    const where: {
      OR?: Array<{
        tenThu?: { contains: string; mode: 'insensitive' }
        maHoSo?: { contains: string; mode: 'insensitive' }
        khachHang?: { 
          tenKhachHang?: { contains: string; mode: 'insensitive' }
          soDienThoai?: { contains: string }
        }
      }>
    } = {}
    
    if (search) {
      where.OR = [
        { tenThu: { contains: search, mode: 'insensitive' } },
        { maHoSo: { contains: search, mode: 'insensitive' } },
        { khachHang: { tenKhachHang: { contains: search, mode: 'insensitive' } } },
        { khachHang: { soDienThoai: { contains: search } } }
      ]
    }
    
    // Get total count for pagination
    const totalCount = await prisma.hoSoThu.count({ where })
    
    // Fetch pet records
    const pets = await prisma.hoSoThu.findMany({
      where,
      include: {
        khachHang: {
          select: {
            tenKhachHang: true,
            soDienThoai: true,
            diaChi: true
          }
        },
        lichTheoDoi: {
          orderBy: { ngayKham: 'desc' },
          take: 1,
          select: {
            ngayKham: true,
            ngayTaiKham: true,
            trangThaiKham: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: pageSize
    })
    
    return NextResponse.json({
      pets,
      pagination: {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    })
    
  } catch (error) {
    console.error('Error fetching pet records:', error)
    return NextResponse.json(
      { message: 'Có lỗi xảy ra khi lấy danh sách hồ sơ thú' },
      { status: 500 }
    )
  }
}