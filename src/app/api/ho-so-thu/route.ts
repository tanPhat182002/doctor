import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating pet record
const createPetSchema = z.object({
  tenThu: z.string().min(1, 'Tên thú cưng không được để trống'),
  loai: z.enum(['CHO', 'MEO', 'CHIM', 'CA', 'THO', 'HAMSTER'], { message: 'Loại thú cưng không hợp lệ' }),
  trangThai: z.enum(['KHOE_MANH', 'THEO_DOI', 'MANG_THAI', 'SAU_SINH', 'CACH_LY'], { message: 'Trạng thái sức khỏe không hợp lệ' }),
  maKhachHang: z.string().min(1, 'Mã khách hàng là bắt buộc'),
  lichTheoDoi: z.object({
    ngayKham: z.string().transform(val => new Date(val)),
    ngayTaiKham: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
    ghiChu: z.string().optional().nullable(),
    trangThaiKham: z.enum(['DA_KHAM', 'CHUA_KHAM', 'HUY'], { message: 'Trạng thái khám không hợp lệ' })
  }).optional()
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
    
    // Generate pet record ID
    const lastPet = await prisma.hoSoThu.findFirst({
      orderBy: { maHoSo: 'desc' }
    })
    
    let newPetId = 'HS001'
    if (lastPet) {
      const lastNumber = parseInt(lastPet.maHoSo.substring(2))
      newPetId = `HS${String(lastNumber + 1).padStart(3, '0')}`
    }
    
    // Create pet record with optional follow-up schedule
    const newPet = await prisma.hoSoThu.create({
      data: {
        maHoSo: newPetId,
        tenThu: validatedData.tenThu,
        loai: validatedData.loai,
        trangThai: validatedData.trangThai,
        maKhachHang: validatedData.maKhachHang,
        ...(validatedData.lichTheoDoi && {
          lichTheoDoi: {
            create: {
              ngayKham: validatedData.lichTheoDoi.ngayKham,
              ngayTaiKham: validatedData.lichTheoDoi.ngayTaiKham,
              ghiChu: validatedData.lichTheoDoi.ghiChu,
              trangThaiKham: validatedData.lichTheoDoi.trangThaiKham
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
    
  } catch (error) {
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
  pageSize: z.string().optional().transform(val => parseInt(val || '10', 10)),
  trangThai: z.enum(['KHOE_MANH', 'THEO_DOI', 'MANG_THAI', 'SAU_SINH', 'CACH_LY']).optional(),
  loai: z.enum(['CHO', 'MEO', 'CHIM', 'CA', 'THO', 'HAMSTER']).optional(),
});

// GET - Fetch pet records with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedParams = getPetSchema.parse(queryParams)

    const { search, page, pageSize, trangThai, loai } = validatedParams
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
      trangThai?: string
      loai?: string
    } = {}
    
    if (search) {
      where.OR = [
        { tenThu: { contains: search, mode: 'insensitive' } },
        { maHoSo: { contains: search, mode: 'insensitive' } },
        { khachHang: { tenKhachHang: { contains: search, mode: 'insensitive' } } },
        { khachHang: { soDienThoai: { contains: search } } }
      ]
    }
    
    if (trangThai) {
      where.trangThai = trangThai
    }
    
    if (loai) {
      where.loai = loai
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
            trangThaiKham: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: pageSize
    })
    
    // Get statistics
    const stats = await prisma.hoSoThu.groupBy({
      by: ['trangThai'],
      _count: { trangThai: true }
    })
    
    const statusStats = {
      KHOE_MANH: 0,
      THEO_DOI: 0,
      MANG_THAI: 0,
      SAU_SINH: 0,
      CACH_LY: 0
    }
    
    stats.forEach((stat: { trangThai: string; _count: { trangThai: number } }) => {
      statusStats[stat.trangThai as keyof typeof statusStats] = stat._count.trangThai
    })
    
    return NextResponse.json({
      pets,
      pagination: {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      },
      stats: statusStats
    })
    
  } catch (error) {
    console.error('Error fetching pet records:', error)
    return NextResponse.json(
      { message: 'Có lỗi xảy ra khi lấy danh sách hồ sơ thú' },
      { status: 500 }
    )
  }
}