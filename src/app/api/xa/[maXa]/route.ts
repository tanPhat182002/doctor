import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ maXa: string }> }
) {
  try {
    const { maXa } = await params

    const address = await prisma.address.findUnique({
      where: { maXa },
      include: {
        _count: {
          select: {
            khachHangs: true
          }
        }
      }
    })

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy xã' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: address,
    })
  } catch (error) {
    console.error('Error fetching address:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải thông tin xã' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ maXa: string }> }
) {
  try {
    const { maXa } = await params
    const body = await request.json()
    const { tenXa } = body

    if (!tenXa) {
      return NextResponse.json(
        { success: false, error: 'Tên xã là bắt buộc' },
        { status: 400 }
      )
    }

    const address = await prisma.address.update({
      where: { maXa },
      data: {
        tenXa,
      },
    })

    return NextResponse.json({
      success: true,
      data: address,
      message: 'Cập nhật xã thành công',
    })
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật xã' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ maXa: string }> }
) {
  try {
    const { maXa } = await params

    // Check if there are any customers using this address
    const customerCount = await prisma.khachHang.count({
      where: { maXa },
    })

    if (customerCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không thể xóa xã này vì đang được sử dụng bởi khách hàng' 
        },
        { status: 400 }
      )
    }

    await prisma.address.delete({
      where: { maXa },
    })

    return NextResponse.json({
      success: true,
      message: 'Xóa xã thành công',
    })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa xã' },
      { status: 500 }
    )
  }
}