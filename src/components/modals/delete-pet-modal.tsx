'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, AlertTriangle } from 'lucide-react'
import { useDeletePet } from '@/hooks/api/use-pets'
import type { PetTableData } from '@/types'

interface DeletePetModalProps {
  pet: PetTableData
  triggerButton: React.ReactNode
  onSuccess?: () => void
}

export function DeletePetModal({ pet, triggerButton, onSuccess }: DeletePetModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const deletePetMutation = useDeletePet()

  const handleDelete = async () => {
    try {
      await deletePetMutation.mutateAsync(pet.maHoSo)
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Delete failed:', error)
    }
  }

  const hasSchedules = pet.lichTheoDoi && pet.lichTheoDoi.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa hồ sơ
          </DialogTitle>
          <DialogDescription className="text-left">
            Bạn có chắc chắn muốn xóa hồ sơ thú cưng <strong>{pet.tenThu}</strong> không?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Pet Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Thông tin thú cưng</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Mã hồ sơ:</span> {pet.maHoSo}</p>
              <p><span className="font-medium">Tên thú cưng:</span> {pet.tenThu}</p>
              <p><span className="font-medium">Chủ nhân:</span> {pet.khachHang.tenKhachHang}</p>
              <p><span className="font-medium">Số lịch khám:</span> {pet.lichTheoDoi?.length || 0} lần</p>
            </div>
          </div>
          
          {/* Warning for deletion */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Cảnh báo</h4>
                <p className="text-sm text-yellow-700">
                  Hành động này không thể hoàn tác. Tất cả thông tin liên quan đến thú cưng {hasSchedules ? `(bao gồm ${pet.lichTheoDoi.length} lịch khám) ` : ''}sẽ bị xóa vĩnh viễn.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={deletePetMutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deletePetMutation.isPending}
            className="flex items-center gap-2"
          >
            {deletePetMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Xóa hồ sơ
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}