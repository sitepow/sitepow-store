/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import Image from 'next/image'

import { verifySlip } from '@/actions/verify-slip'
import { BankAccount, BankAccountType } from '@/generated/prisma/browser'
import { IconPhoto, IconTrash, IconUpload } from '@tabler/icons-react'
import generatePayload from 'promptpay-qr'
import QRCode from 'qrcode'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
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

interface UploadSlipDialogProps {
  orderId: string
  storeId: string
  orderNumber: string
  customerId: string
  bankAccounts: (Pick<
    BankAccount,
    | 'id'
    | 'bankName'
    | 'accountNumber'
    | 'accountName'
    | 'type'
    | 'promptPayId'
    | 'qrImage'
    | 'isDefault'
  > &
    Partial<BankAccount>)[]
}

export function UploadSlipDialog({
  orderId,
  storeId,
  orderNumber,
  customerId,
  bankAccounts,
}: UploadSlipDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>()

  const selectedAccount =
    bankAccounts.find((a) => a.id === selectedId) || bankAccounts[0]

  useEffect(() => {
    if (
      isOpen &&
      selectedAccount?.type === BankAccountType.PROMPTPAY &&
      selectedAccount?.promptPayId
    ) {
      const payload = generatePayload(selectedAccount.promptPayId, {})
      QRCode.toDataURL(payload, { width: 300, margin: 1 }, (err, url) => {
        if (!err) {
          setQrCodeUrl(url)
        }
      })
    } else {
      setQrCodeUrl(undefined)
    }
  }, [isOpen, selectedAccount])

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
      const result = await verifySlip(orderId, imageUrl, storeId, customerId)
      if (result.success !== false) {
        toast.success('ระบบได้รับสลิปและกำลังตรวจสอบแล้ว')
        setIsOpen(false)
        handleRemoveFile()
      } else {
        toast.error(result.message || 'เกิดข้อผิดพลาด')
      }
    } catch {
      toast.error('อัปโหลดไม่สำเร็จ')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedAccount) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconUpload size={16} className="mr-2" /> แจ้งชำระเงิน
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แจ้งชำระเงิน #{orderNumber}</DialogTitle>
          <DialogDescription>เลือกบัญชีที่ต้องการโอนเงิน</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          {bankAccounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setSelectedId(acc.id)}
              className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
                selectedAccount.id === acc.id
                  ? 'border-primary bg-primary/5'
                  : 'border-input'
              }`}
            >
              <div>
                <div className="font-semibold">
                  {acc.bankName}{' '}
                  {acc.type === BankAccountType.PROMPTPAY && '(พร้อมเพย์)'}
                </div>
                <div className="text-muted-foreground text-xs">
                  {acc.type === BankAccountType.PROMPTPAY
                    ? acc.promptPayId
                    : acc.accountNumber}
                </div>
              </div>
            </button>
          ))}
        </div>
        {selectedAccount.type === BankAccountType.PROMPTPAY && qrCodeUrl && (
          <div className="flex justify-center p-2">
            <Image
              src={qrCodeUrl}
              alt="PromptPay QR"
              width={180}
              height={180}
              className="border"
            />
          </div>
        )}
        <div className="bg-muted/50 space-y-2 rounded-lg border p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ชื่อบัญชี</span>
            <span className="font-medium">{selectedAccount.accountName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {selectedAccount.type === BankAccountType.PROMPTPAY
                ? 'หมายเลขพร้อมเพย์'
                : 'เลขบัญชี'}
            </span>
            <span className="font-bold">
              {selectedAccount.type === BankAccountType.PROMPTPAY
                ? selectedAccount.promptPayId
                : selectedAccount.accountNumber}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center pt-2">
          {previewUrl ? (
            <div className="relative h-40 w-full rounded-md border p-1">
              <Image
                src={previewUrl}
                alt="Slip"
                fill
                className="object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                onClick={handleRemoveFile}
              >
                <IconTrash size={16} />
              </Button>
            </div>
          ) : (
            <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <IconPhoto className="text-muted-foreground mb-2 h-8 w-8" />
                <p className="text-sm">คลิกเพื่ออัปโหลดสลิป</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
        <ActionRequiredAlert
          title="คำเตือน"
          description="ระบบจะตรวจสอบสลิปอัตโนมัติ หากตรวจพบการอัปโหลดสลิปปลอมหรือสลิปซ้ำ
          ระบบจะบันทึกข้อมูลของคุณไว้ และหากตรวจพบซ้ำหลายครั้ง
          บัญชีของคุณจะถูกแบนถาวร"
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
          >
            {isSubmitting ? 'กำลังส่ง...' : 'ยืนยันการชำระเงิน'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
