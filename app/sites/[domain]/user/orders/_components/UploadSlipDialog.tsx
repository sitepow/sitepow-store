/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import { useVerifySlip } from '@/actions/hooks/verify-slip'
import { BankAccount, BankAccountType } from '@/generated/prisma/browser'
import { useSession } from '@/hooks/use-session'
import { getPathR2FromUrl } from '@/utils/image'
import { formatBankAccount, formatPromptPay } from '@/utils/slip'
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
import { RadioGroup } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'

import { RadioCard } from '../../../cart/_components/RadioCard'

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
  const { userId } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(
    bankAccounts[0]?.id || null,
  )
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>()

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

    const formData = new FormData()
    formData.append('file', file)
    const uploadResult = await uploadImage(formData)

    if (!uploadResult.success || !uploadResult.url) {
      return
    }

    verify(
      {
        orderId,
        slipImageUrl: uploadResult.url,
        storeId,
        customerId,
      },
      {
        onSuccess: async (result) => {
          if (result.success || result.requiresManualCheck) {
            setIsOpen(false)
            handleRemoveFile()
          } else if (result.shouldDeleteImage) {
            const oldKey = getPathR2FromUrl(uploadResult.url!)
            await deleteImage(oldKey)
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
        <Button variant="outline" size="sm">
          <IconUpload size={16} className="mr-2" /> แจ้งชำระเงิน
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แจ้งชำระเงิน #{orderNumber}</DialogTitle>
          <DialogDescription>เลือกบัญชีที่ต้องการโอนเงิน</DialogDescription>
        </DialogHeader>
        <ActionRequiredAlert
          title="คำเตือน"
          description="ระบบจะตรวจสอบสลิปอัตโนมัติ หากตรวจพบการอัปโหลดสลิปปลอมหรือสลิปซ้ำ
          ระบบจะบันทึกข้อมูลของคุณไว้ และหากตรวจพบซ้ำหลายครั้ง
          บัญชีของคุณจะถูกแบนถาวร"
        />
        <RadioGroup
          value={selectedId || ''}
          onValueChange={setSelectedId}
          className="grid gap-2 py-2"
        >
          {bankAccounts.map((acc) => (
            <RadioCard
              key={acc.id}
              id={acc.id}
              value={acc.id}
              title={
                <>
                  {acc.bankName}{' '}
                  {acc.type === BankAccountType.PROMPTPAY && '(พร้อมเพย์)'}
                </>
              }
              description={
                acc.type === BankAccountType.PROMPTPAY
                  ? formatPromptPay(acc.promptPayId)
                  : formatBankAccount(acc.accountNumber)
              }
            />
          ))}
        </RadioGroup>
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
                ? formatPromptPay(selectedAccount.promptPayId)
                : formatBankAccount(selectedAccount.accountNumber)}
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
            disabled={!file || isVerifying || isUploading}
          >
            {isVerifying && <Spinner />}
            {isVerifying ? 'กำลังส่ง...' : 'ยืนยันการชำระเงิน'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
