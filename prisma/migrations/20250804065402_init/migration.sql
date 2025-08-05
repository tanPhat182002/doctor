/*
  Warnings:

  - You are about to drop the column `loai` on the `HoSoThu` table. All the data in the column will be lost.
  - You are about to drop the column `trangThai` on the `HoSoThu` table. All the data in the column will be lost.
  - Added the required column `soNgay` to the `LichTheoDoi` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "KhachHang_soDienThoai_key";

-- AlterTable
ALTER TABLE "HoSoThu" DROP COLUMN "loai",
DROP COLUMN "trangThai";

-- AlterTable
ALTER TABLE "KhachHang" ADD COLUMN     "maXa" TEXT;

-- AlterTable
ALTER TABLE "LichTheoDoi" ADD COLUMN     "soNgay" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Address" (
    "maXa" TEXT NOT NULL,
    "tenXa" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("maXa")
);

-- AddForeignKey
ALTER TABLE "KhachHang" ADD CONSTRAINT "KhachHang_maXa_fkey" FOREIGN KEY ("maXa") REFERENCES "Address"("maXa") ON DELETE SET NULL ON UPDATE CASCADE;
