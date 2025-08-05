import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const scheduleId = parseInt(id)
    
    if (isNaN(scheduleId)) {
      return NextResponse.json(
        { success: false, message: 'ID lịch khám không hợp lệ' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const { ngayKham, soNgay, ngayTaiKham, trangThaiKham, ghiChu } = body

    // Validate required fields
    if (!ngayKham || !trangThaiKham) {
      return NextResponse.json(
        { success: false, message: 'Ngày khám và trạng thái khám là bắt buộc' },
        { status: 400 }
      )
    }

    // Check if schedule exists
    const existingSchedule = await prisma.lichTheoDoi.findUnique({
      where: { id: scheduleId }
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy lịch khám' },
        { status: 404 }
      )
    }

    // Update the schedule
    const updatedSchedule = await prisma.lichTheoDoi.update({
      where: { id: scheduleId },
      data: {
        ngayKham: new Date(ngayKham),
        soNgay: soNgay ? parseInt(soNgay.toString()) : 0,
        ngayTaiKham: ngayTaiKham ? new Date(ngayTaiKham) : null,
        trangThaiKham,
        ghiChu: ghiChu || null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Cập nhật lịch khám thành công',
      data: updatedSchedule
    })
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi server khi cập nhật lịch khám' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const scheduleId = parseInt(id)
    
    if (isNaN(scheduleId)) {
      return NextResponse.json(
        { success: false, message: 'ID lịch khám không hợp lệ' },
        { status: 400 }
      )
    }

    // Check if schedule exists
    const existingSchedule = await prisma.lichTheoDoi.findUnique({
      where: { id: scheduleId }
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy lịch khám' },
        { status: 404 }
      )
    }

    // Delete the schedule
    await prisma.lichTheoDoi.delete({
      where: { id: scheduleId }
    })

    return NextResponse.json({
      success: true,
      message: 'Xóa lịch khám thành công'
    })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi server khi xóa lịch khám' },
      { status: 500 }
    )
  }
}