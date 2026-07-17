'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import Image from 'next/image'

import { verifySlip } from '@/actions/verify-slip'
import { IconPhoto, IconTrash, IconUpload } from '@tabler/icons-react'

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

interface BankAccount {
  bankName: string
  accountName: string
  accountNumber: string
}

interface UploadSlipDialogProps {
  orderId: string
  storeId: string
  orderNumber: string
  bankAccount: BankAccount
  variant?: 'outline' | 'default' | 'ghost'
  size?: 'sm' | 'default' | 'icon'
  label?: string
}

export function UploadSlipDialog({
  orderId,
  storeId,
  orderNumber,
  bankAccount,
  variant = 'outline',
  size = 'sm',
  label = 'แจ้งชำระเงิน',
}: UploadSlipDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) {
      return
    }

    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async () => {
    if (!file) {
      return
    }

    setIsSubmitting(true)
    try {
      const imageUrl = 'URL_ที่ได้จากการอัปโหลด'

      const result = await verifySlip(orderId, imageUrl, storeId)

      if (result.success !== false) {
        toast.success('ระบบได้รับสลิปและกำลังตรวจสอบแล้ว')
        setIsOpen(false)
        handleRemoveFile()
      } else {
        toast.error(result.message || 'เกิดข้อผิดพลาดในการตรวจสอบ')
      }
    } catch {
      toast.error('อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <IconUpload size={16} className="mr-2" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แจ้งชำระเงิน #{orderNumber}</DialogTitle>
          <DialogDescription>
            โอนเงินเข้าบัญชีด้านล่างนี้ และแนบสลิปเพื่อยืนยันรายการ
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 rounded-lg border p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ธนาคาร:</span>
            <span className="font-semibold">{bankAccount.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">เลขบัญชี:</span>
            <span className="font-mono font-bold">
              {bankAccount.accountNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ชื่อบัญชี:</span>
            <span className="font-semibold">{bankAccount.accountName}</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-2">
          {previewUrl ? (
            <div className="relative h-48 w-full rounded-md border p-1">
              <div className="relative h-full w-full overflow-hidden rounded-sm">
                <Image
                  src={previewUrl}
                  alt="Slip preview"
                  fill
                  className="object-contain"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                onClick={handleRemoveFile}
                disabled={isSubmitting}
              >
                <IconTrash size={16} />
              </Button>
            </div>
          ) : (
            <label className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <IconPhoto className="mb-2 h-8 w-8" />
                <p className="text-sm">คลิกเพื่ออัปโหลดรูปสลิป</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  PNG, JPG (ไม่เกิน 5MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
          >
            {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
