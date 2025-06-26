import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Schema for updating pet
const updatePetSchema = z.object({
  tenThu: z.string().min(1, 'Tên thú cưng không được để trống'),
  loai: z.string().min(1, 'Loại thú cưng không được để trống'),
  trangThai: z.string().min(1, 'Trạng thái không được để trống')
})

// GET - Get pet details by maHoSo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ maHoSo: string }> }
) {
  try {
    const { maHoSo } = await params

    const pet = await prisma.hoSoThu.findUnique({
      where: { maHoSo },
      include: {
        khachHang: {
          select: {
            maKhachHang: true,
            tenKhachHang: true,
            soDienThoai: true,
            diaChi: true
          }
        },
        lichTheoDoi: {
          select: {
            id: true,
            ngayKham: true,
            ngayTaiKham: true,
            trangThaiKham: true,
            ghiChu: true
          },
          orderBy: {
            ngayKham: 'desc'
          }
        }
      }
    })

    if (!pet) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy hồ sơ thú cưng' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: pet
    })
  } catch (error) {
    console.error('Error fetching pet details:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi server khi lấy thông tin hồ sơ' },
      { status: 500 }
    )
  }
}

// PUT - Update pet information
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ maHoSo: string }> }
) {
  try {
    const { maHoSo } = await params
    const body = await request.json()
    
    // Validate input data
    const validatedData = updatePetSchema.parse(body)
    
    // Check if pet exists
    const existingPet = await prisma.hoSoThu.findUnique({
      where: { maHoSo }
    })
    
    if (!existingPet) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy hồ sơ thú cưng' },
        { status: 404 }
      )
    }
    
    // Update pet
    const updatedPet = await prisma.hoSoThu.update({
      where: { maHoSo },
      data: {
        tenThu: validatedData.tenThu,
        loai: validatedData.loai,
        trangThai: validatedData.trangThai
      },
      include: {
        khachHang: {
          select: {
            maKhachHang: true,
            tenKhachHang: true,
            soDienThoai: true,
            diaChi: true
          }
        },
        lichTheoDoi: {
          select: {
            id: true,
            ngayKham: true,
            ngayTaiKham: true,
            trangThaiKham: true,
            ghiChu: true
          },
          orderBy: {
            ngayKham: 'desc'
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedPet,
      message: 'Cập nhật thông tin thú cưng thành công'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Error updating pet:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi server khi cập nhật thông tin' },
      { status: 500 }
    )
  }
}

// DELETE - Delete pet (optional)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ maHoSo: string }> }
) {
  try {
    const { maHoSo } = await params
    
    // Check if pet exists
    const existingPet = await prisma.hoSoThu.findUnique({
      where: { maHoSo },
      include: {
        lichTheoDoi: true
      }
    })
    
    if (!existingPet) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy hồ sơ thú cưng' },
        { status: 404 }
      )
    }
    
    // Check if pet has any schedules
    if (existingPet.lichTheoDoi.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Không thể xóa hồ sơ có lịch khám. Vui lòng xóa tất cả lịch khám trước.' },
        { status: 400 }
      )
    }
    
    // Delete pet
    await prisma.hoSoThu.delete({
      where: { maHoSo }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Xóa hồ sơ thú cưng thành công'
    })
  } catch (error) {
    console.error('Error deleting pet:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi server khi xóa hồ sơ' },
      { status: 500 }
    )
  }
}