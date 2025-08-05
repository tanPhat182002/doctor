import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for customer creation
const createCustomerSchema = z.object({
  tenKhachHang: z.string().min(2, 'Tên khách hàng phải có ít nhất 2 ký tự').max(100, 'Tên khách hàng không được quá 100 ký tự'),
  soDienThoai: z.string().regex(/^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  diaChi: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự').max(200, 'Địa chỉ không được quá 200 ký tự').optional().nullable(),
  maXa: z.string().optional().nullable()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validationResult = createCustomerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'Dữ liệu không hợp lệ', 
          errors: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { tenKhachHang, soDienThoai, diaChi, maXa } = validationResult.data

    // Check if phone number already exists
    const existingCustomer = await prisma.khachHang.findFirst({
      where: { soDienThoai }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { message: 'Số điện thoại đã tồn tại trong hệ thống' },
        { status: 409 }
      )
    }

    // Create new customer
    const newCustomer = await prisma.khachHang.create({
      data: {
        tenKhachHang,
        soDienThoai,
        diaChi: diaChi || null,
        maXa: maXa || null
      }
    })

    return NextResponse.json(
      {
        message: 'Tạo khách hàng thành công',
        maKhachHang: newCustomer.maKhachHang,
        customer: newCustomer
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating customer:', error)
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { message: 'Số điện thoại đã tồn tại trong hệ thống' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: 'Có lỗi xảy ra khi tạo khách hàng' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const maXa = searchParams.get('maXa') || ''

    const where: {
      OR?: Array<{
        tenKhachHang?: { contains: string; mode: 'insensitive' }
        soDienThoai?: { contains: string }
        diaChi?: { contains: string; mode: 'insensitive' }
      }>
      maXa?: string
    } = {}
    
    // Add search conditions
    if (search && search.length >= 2) {
      where.OR = [
        { tenKhachHang: { contains: search, mode: 'insensitive' as const } },
        { soDienThoai: { contains: search } },
        { diaChi: { contains: search, mode: 'insensitive' as const } },
      ]
    }
    
    // Add maXa filter
    if (maXa) {
      where.maXa = maXa
    }

    const [customers, total] = await Promise.all([
      prisma.khachHang.findMany({
        where,
        include: {
          hoSoThu: {
            select: {
              maHoSo: true,
              tenThu: true,
              lichTheoDoi: {
                select: {
                  ngayTaiKham: true,
                },
                orderBy: {
                  ngayKham: 'desc',
                },
                take: 1,
              },
            },
          },
          xa: {
            select: {
              maXa: true,
              tenXa: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.khachHang.count({ where }),
    ])

    return NextResponse.json({
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { message: 'Có lỗi xảy ra khi lấy danh sách khách hàng' },
      { status: 500 }
    )
  }
}