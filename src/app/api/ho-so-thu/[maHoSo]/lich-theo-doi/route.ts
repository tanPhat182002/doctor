import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Schema for creating new follow-up schedule
const createScheduleSchema = z.object({
  ngayKham: z.string().refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, { message: 'Ngày khám không hợp lệ' }),
  ngayTaiKham: z.string().refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, { message: 'Ngày tái khám không hợp lệ' }).optional(),
  trangThaiKham: z.enum(['CHO_KHAM', 'DANG_KHAM', 'HOAN_THANH', 'HUY'], { message: 'Trạng thái khám không hợp lệ' }),
  ghiChu: z.string().nullable().optional()
})

// POST - Create new follow-up schedule for pet
export async function POST(
  request: NextRequest,
  { params }: { params: { maHoSo: string } }
) {
  try {
    const { maHoSo } = params
    const body = await request.json()
    
    // Validate input data
    const validatedData = createScheduleSchema.parse(body)
    
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
    
    // Validate dates
    const ngayKham = new Date(validatedData.ngayKham)
    const ngayTaiKham = validatedData.ngayTaiKham ? new Date(validatedData.ngayTaiKham) : null
    
    if (ngayTaiKham && ngayTaiKham <= ngayKham) {
      return NextResponse.json(
        { success: false, error: 'Ngày tái khám phải sau ngày khám' },
        { status: 400 }
      )
    }
    
    // Create new schedule
    const newSchedule = await prisma.lichTheoDoi.create({
      data: {
        petId: existingPet.maHoSo,
        ngayKham,
        ngayTaiKham,
        trangThaiKham: validatedData.trangThaiKham,
        ghiChu: validatedData.ghiChu || null
      },
      include: {
        hoSoThu: {
          select: {
            maHoSo: true,
            tenThu: true,
            loai: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: newSchedule,
      message: 'Thêm lịch theo dõi thành công'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi server khi tạo lịch theo dõi' },
      { status: 500 }
    )
  }
}

// GET - Get all schedules for a pet
export async function GET(
  request: NextRequest,
  { params }: { params: { maHoSo: string } }
) {
  try {
    const { maHoSo } = params
    
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
    
    // Get all schedules for this pet
    const schedules = await prisma.lichTheoDoi.findMany({
      where: { petId: maHoSo },
      orderBy: {
        ngayKham: 'desc'
      },
      include: {
        hoSoThu: {
          select: {
            maHoSo: true,
            tenThu: true,
            loai: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: schedules
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi server khi lấy danh sách lịch theo dõi' },
      { status: 500 }
    )
  }
}