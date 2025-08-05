import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for customer update
const updateCustomerSchema = z.object({
  tenKhachHang: z.string().min(2, 'Tên khách hàng phải có ít nhất 2 ký tự').max(100, 'Tên khách hàng không được quá 100 ký tự').optional(),
  soDienThoai: z.string().regex(/^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/, 'Số điện thoại không hợp lệ').optional(),
  diaChi: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự').max(200, 'Địa chỉ không được quá 200 ký tự').optional().nullable(),
  maXa: z.string().optional().nullable()
})

// GET - Get customer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ maKhachHang: string }> }
) {
  try {
    const { maKhachHang } = await params

    const customer = await prisma.khachHang.findUnique({
      where: { maKhachHang },
      include: {
        hoSoThu: {
          select: {
            maHoSo: true,
            tenThu: true,
          },
        },
        xa: {
          select: {
            maXa: true,
            tenXa: true,
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { message: 'Không tìm thấy khách hàng' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: customer,
    })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { message: 'Có lỗi xảy ra khi lấy thông tin khách hàng' },
      { status: 500 }
    )
  }
}

// PUT - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ maKhachHang: string }> }
) {
  try {
    const { maKhachHang } = await params
    const body = await request.json()
    
    // Validate input data
    const validationResult = updateCustomerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'Dữ liệu không hợp lệ', 
          errors: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    // Check if customer exists
    const existingCustomer = await prisma.khachHang.findUnique({
      where: { maKhachHang }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { message: 'Không tìm thấy khách hàng' },
        { status: 404 }
      )
    }

    // Check if phone number already exists (if updating phone)
    if (updateData.soDienThoai && updateData.soDienThoai !== existingCustomer.soDienThoai) {
      const phoneExists = await prisma.khachHang.findFirst({
        where: { 
          soDienThoai: updateData.soDienThoai,
          maKhachHang: { not: maKhachHang }
        }
      })

      if (phoneExists) {
        return NextResponse.json(
          { message: 'Số điện thoại đã tồn tại trong hệ thống' },
          { status: 409 }
        )
      }
    }

    // Update customer
    const updatedCustomer = await prisma.khachHang.update({
      where: { maKhachHang },
      data: {
        ...(updateData.tenKhachHang && { tenKhachHang: updateData.tenKhachHang }),
        ...(updateData.soDienThoai && { soDienThoai: updateData.soDienThoai }),
        ...(updateData.diaChi !== undefined && { diaChi: updateData.diaChi }),
        ...(updateData.maXa !== undefined && { maXa: updateData.maXa }),
      },
      include: {
        hoSoThu: {
          select: {
            maHoSo: true,
            tenThu: true,
          },
        },
        xa: {
          select: {
            maXa: true,
            tenXa: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Cập nhật khách hàng thành công',
        customer: updatedCustomer
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating customer:', error)
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { message: 'Số điện thoại đã tồn tại trong hệ thống' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: 'Có lỗi xảy ra khi cập nhật khách hàng' },
      { status: 500 }
    )
  }
}

// DELETE - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ maKhachHang: string }> }
) {
  try {
    const { maKhachHang } = await params

    // Check if customer exists
    const existingCustomer = await prisma.khachHang.findUnique({
      where: { maKhachHang },
      include: {
        hoSoThu: true
      }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { message: 'Không tìm thấy khách hàng' },
        { status: 404 }
      )
    }

    // Check if customer has any pets
    if (existingCustomer.hoSoThu.length > 0) {
      return NextResponse.json(
        { message: 'Không thể xóa khách hàng có thú cưng. Vui lòng xóa tất cả hồ sơ thú cưng trước.' },
        { status: 400 }
      )
    }

    // Delete customer
    await prisma.khachHang.delete({
      where: { maKhachHang }
    })

    return NextResponse.json(
      {
        message: 'Xóa khách hàng thành công'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { message: 'Có lỗi xảy ra khi xóa khách hàng' },
      { status: 500 }
    )
  }
}