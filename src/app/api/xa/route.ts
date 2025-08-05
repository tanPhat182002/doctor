import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const where = search && search.length >= 2
      ? {
          tenXa: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      : {}

    const [addresses, total] = await Promise.all([
      prisma.address.findMany({
        where,
        include: {
          _count: {
            select: {
              khachHangs: true
            }
          }
        },
        orderBy: { tenXa: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.address.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: addresses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải danh sách xã' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenXa } = body

    if (!tenXa) {
      return NextResponse.json(
        { success: false, error: 'Tên xã là bắt buộc' },
        { status: 400 }
      )
    }

    const address = await prisma.address.create({
      data: {
        tenXa,
      },
    })

    return NextResponse.json({
      success: true,
      data: address,
      message: 'Tạo xã thành công',
    })
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo xã' },
      { status: 500 }
    )
  }
}