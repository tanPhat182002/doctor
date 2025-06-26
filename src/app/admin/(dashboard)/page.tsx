// app/(dashboard)/page.tsx
import { StatCard } from '@/components/cards/stat-card'
import { PetCard } from '@/components/cards/pet-card'
import { AppointmentCard } from '@/components/cards/appointment-card'
import { Users, FileText, Calendar, TrendingUp } from 'lucide-react'

// Mock data
const mockPets = [
  {
    maHoSo: 'D8893031',
    tenThu: 'Lucky',
    loai: 'CHO',
    trangThai: 'KHOE_MANH' as const,
    khachHang: {
      tenKhachHang: 'Huỳnh Công Hiếu',
      soDienThoai: '0393923000',
    },
    ngayKhamGanNhat: '2025-06-20',
    ngayTaiKham: '2025-06-27',
  },
  {
    maHoSo: 'D8893030',
    tenThu: 'Bò-01',
    loai: 'BO',
    trangThai: 'MANG_THAI' as const,
    khachHang: {
      tenKhachHang: 'Bùi Công Nam',
      soDienThoai: '0983424242',
    },
    ngayKhamGanNhat: '2025-06-15',
  },
]

const mockAppointments = [
  {
    id: 1,
    ngayKham: new Date().toISOString(),
    gioKham: '09:00',
    lyDoKham: 'Tiêm phòng định kỳ',
    trangThai: 'CHO_KHAM' as const,
    hoSoThu: {
      maHoSo: 'D8893031',
      tenThu: 'Lucky',
      loai: 'Chó Golden',
      khachHang: {
        tenKhachHang: 'Huỳnh Công Hiếu',
        soDienThoai: '0393923000',
        diaChi: '123 Lê Duẩn, Q.1, TP.HCM',
      },
    },
    ghiChu: 'Khách hàng VIP, cần chăm sóc đặc biệt',
  },
]

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng khách hàng"
          value="124"
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Hồ sơ thú"
          value="256"
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Lịch khám hôm nay"
          value="18"
          icon={<Calendar className="h-5 w-5" />}
          description="Còn 5 lịch chưa hoàn thành"
        />
        <StatCard
          title="Tỷ lệ hài lòng"
          value="95%"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      {/* Recent Activities */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Pets */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Thú khám gần đây
          </h2>
          <div className="space-y-4">
            {mockPets.map((pet) => (
              <PetCard key={pet.maHoSo} pet={pet} variant="compact" />
            ))}
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Lịch khám hôm nay
          </h2>
          <div className="space-y-4">
            {mockAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                variant="default"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}