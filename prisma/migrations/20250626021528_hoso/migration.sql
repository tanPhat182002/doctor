-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KhachHang" (
    "maKhachHang" TEXT NOT NULL,
    "tenKhachHang" TEXT NOT NULL,
    "soDienThoai" TEXT NOT NULL,
    "diaChi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KhachHang_pkey" PRIMARY KEY ("maKhachHang")
);

-- CreateTable
CREATE TABLE "HoSoThu" (
    "maHoSo" TEXT NOT NULL,
    "tenThu" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "trangThai" TEXT NOT NULL,
    "maKhachHang" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HoSoThu_pkey" PRIMARY KEY ("maHoSo")
);

-- CreateTable
CREATE TABLE "LichTheoDoi" (
    "id" SERIAL NOT NULL,
    "ngayKham" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayTaiKham" TIMESTAMP(3),
    "ghiChu" TEXT,
    "trangThaiKham" TEXT NOT NULL,
    "maHoSo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LichTheoDoi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KhachHang_soDienThoai_key" ON "KhachHang"("soDienThoai");

-- AddForeignKey
ALTER TABLE "HoSoThu" ADD CONSTRAINT "HoSoThu_maKhachHang_fkey" FOREIGN KEY ("maKhachHang") REFERENCES "KhachHang"("maKhachHang") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichTheoDoi" ADD CONSTRAINT "LichTheoDoi_maHoSo_fkey" FOREIGN KEY ("maHoSo") REFERENCES "HoSoThu"("maHoSo") ON DELETE RESTRICT ON UPDATE CASCADE;
