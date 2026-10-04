/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import { useR2DeleteImage, useR2UploadImage } from '@/actions/shared/r2/hooks'
import { useVerifySlip } from '@/actions/sales/payment-verification/hooks'
import { ORDER_EXPIRY_MINUTES } from '@/constants/system'
import { BankAccount, BankAccountType } from '@/generated/prisma/browser'
import { useOrderCountdown } from '@/hooks/use-order-countdown'
import { useSession } from '@/hooks/use-session'
import { useStoreData } from '@/stores/storefront/use-store-data'
import { getPathR2FromUrl } from '@/utils/media/image'
import { formatCurrency } from '@/utils/formatting/number'
import { formatBankAccount, formatPromptPay } from '@/utils/formatting/promptpay-phone'
import {
  IconClock,
  IconPhoto,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react'
import generatePayload from 'promptpay-qr'
import QRCode from 'qrcode'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
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
import { Spinner } from '@/components/ui/spinner'

interface UploadSlipDialogProps {
  orderId: string
  storeId: string
  orderNumber: string
  customerId: string
  totalAmount: number
  createdAt: string | Date
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
  totalAmount,
  createdAt,
  bankAccounts,
}: UploadSlipDialogProps) {
  const { store } = useStoreData()
  const { userId } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(
    bankAccounts[0]?.id || null,
  )
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>()

  const { timeLeft, isExpired } = useOrderCountdown(
    createdAt,
    ORDER_EXPIRY_MINUTES,
  )

  const { mutate: verify, isPending: isVerifying } = useVerifySlip()
  const { mutate: deleteImage } = useR2DeleteImage()
  const { mutateAsync: uploadImage, isPending: isUploading } = useR2UploadImage(
    `store/${storeId}/orders/${orderId}/${userId}`,
  )

  const selectedAccount =
    bankAccounts.find((a) => a.id === selectedId) || bankAccounts[0]

  useEffect(() => {
    if (
      isOpen &&
      selectedAccount?.type === BankAccountType.PROMPTPAY &&
      selectedAccount?.promptPayId
    ) {
      const payload = generatePayload(selectedAccount.promptPayId, {
        amount: totalAmount,
      })
      QRCode.toDataURL(payload, { width: 300, margin: 1 }, (err, url) => {
        if (!err) {
          setQrCodeUrl(url)
        }
      })
    } else {
      setQrCodeUrl(undefined)
    }
  }, [isOpen, selectedAccount, totalAmount])

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
    if (!file || isExpired) {
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    const uploadResult = await uploadImage(formData)

    if (!uploadResult.success || !uploadResult.url) {
      return
    }

    const uploadedImageUrl = uploadResult.url

    verify(
      {
        orderId,
        slipImageUrl: uploadedImageUrl,
        storeId,
        customerId,
      },
      {
        onSuccess: async (result) => {
          if (result.success || result.requiresManualCheck) {
            setIsOpen(false)
            handleRemoveFile()
          }

          if (result.shouldDeleteImage) {
            const oldKey = getPathR2FromUrl(uploadedImageUrl)
            if (oldKey) {
              await deleteImage(oldKey)
            }
          }
        },
        onError: async () => {
          if (uploadedImageUrl) {
            const oldKey = getPathR2FromUrl(uploadedImageUrl)
            if (oldKey) {
              await deleteImage(oldKey)
            }
          }
        },
      },
    )
  }

  if (!bankAccounts || bankAccounts.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <IconUpload size={16} className="mr-2" /> ไม่พบบัญชีรับเงิน
      </Button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <IconUpload size={16} className="mr-2" /> แจ้งชำระเงิน
        </Button>
      </DialogTrigger>
      <DialogContent
        className="gap-2.5 sm:max-w-md"
        style={{ '--primary': store?.primaryColor } as React.CSSProperties}
      >
        <DialogHeader>
          <DialogTitle>แจ้งชำระเงิน #{orderNumber}</DialogTitle>
          <DialogDescription>เลือกบัญชีที่ต้องการโอนเงิน</DialogDescription>
        </DialogHeader>
        <div
          className={`flex items-center justify-between rounded-lg p-3 text-sm font-semibold ${
            isExpired
              ? 'bg-destructive/10 text-destructive'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <IconClock size={18} />
            <span>{isExpired ? 'หมดเวลาชำระเงิน' : 'กรุณาชำระเงินภายใน'}</span>
          </div>
          <span className="font-bold">{timeLeft} นาที</span>
        </div>
        {selectedAccount.type === BankAccountType.PROMPTPAY && qrCodeUrl && (
          <div className="relative h-52 w-full">
            <Image
              src={qrCodeUrl}
              alt="PromptPay QR"
              fill
              className="object-contain"
            />
          </div>
        )}
        <div className="bg-muted/50 space-y-2 rounded-lg border p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ชื่อบัญชี</span>
            <span>{selectedAccount.accountName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {selectedAccount.type === BankAccountType.PROMPTPAY
                ? 'หมายเลขพร้อมเพย์'
                : 'เลขบัญชี'}
            </span>
            <span>
              {selectedAccount.type === BankAccountType.PROMPTPAY
                ? formatPromptPay(selectedAccount.promptPayId)
                : formatBankAccount(selectedAccount.accountNumber)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ยอดเงินที่ต้องชำระ</span>
            <span className="text-primary font-bold">
              {formatCurrency(totalAmount ?? 0)}
            </span>
          </div>
        </div>
        <ActionRequiredAlert
          title="คำเตือนสำคัญ"
          description={`กรุณาโอนเงินให้ตรงกับยอดรวม (${formatCurrency(totalAmount ?? 0)}) และอัปโหลดสลิปให้ตรงกับคำสั่งซื้อ #${orderNumber} นี้เท่านั้น หากยอดเงินไม่ตรงหรือสลิปไม่ถูกต้อง ระบบจะตีตกสถานะเป็นไม่ผ่านอัตโนมัติ`}
        />
        <div className="flex flex-col items-center justify-center">
          {previewUrl ? (
            <div className="border-primary relative h-96 w-full border border-dashed">
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
                className="absolute -top-2 -right-2 size-8 rounded-full"
                onClick={handleRemoveFile}
                disabled={isExpired}
              >
                <IconTrash size={16} />
              </Button>
            </div>
          ) : (
            <label
              className={`flex h-32 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed ${
                isExpired ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <IconPhoto className="text-muted-foreground mb-2 size-8" />
                <p className="text-sm">
                  {isExpired ? 'หมดเวลาอัปโหลดสลิป' : 'คลิกเพื่ออัปโหลดสลิป'}
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isExpired}
              />
            </label>
          )}
        </div>
        <DialogFooter className="border-t pt-2.5">
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
            disabled={!file || isVerifying || isUploading || isExpired}
          >
            {isVerifying && <Spinner />}
            {isVerifying
              ? 'กำลังส่ง...'
              : isExpired
                ? 'หมดเวลาชำระเงิน'
                : 'ยืนยันการชำระเงิน'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
