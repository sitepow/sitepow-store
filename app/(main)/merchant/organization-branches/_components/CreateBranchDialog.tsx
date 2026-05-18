'use client'

import React, { useState } from 'react'

import { IconBuildingStore, IconLoader2, IconPlus } from '@tabler/icons-react'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { Branch } from '../page'

interface CreateBranchDialogProps {
  selectedStoreId: string
  onBranchCreated: (newBranch: Branch) => void
}

export function CreateBranchDialog({
  selectedStoreId,
  onBranchCreated,
}: CreateBranchDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [branchName, setBranchName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!branchName) {
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      const generatedId = `br_${Math.random().toString(36).substring(2, 11)}`

      onBranchCreated({
        id: generatedId,
        storeId: selectedStoreId,
        name: branchName,
        taxId: taxId || null,
        phone: phone || null,
        address: address || null,
        isActive: true,
        staffCount: 0,
        totalStockItems: 0,
      })

      setBranchName('')
      setTaxId('')
      setPhone('')
      setAddress('')
      setIsSubmitting(false)
      setIsOpen(false)
    }, 1000)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !isSubmitting && setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="w-full gap-1.5 px-4 text-xs font-medium sm:w-auto"
        >
          <IconPlus size={16} />
          เพิ่มสาขาใหม่
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
            <IconBuildingStore size={20} className="text-primary" />
            เพิ่มข้อมูลสาขาใหม่
          </DialogTitle>
          <DialogDescription className="text-xs">
            ระบุรายละเอียดสถานที่ตั้งและเลขผู้เสียภาษีประจำสาขา
            เพื่อใช้ประกอบการเปิดสิทธิ์การขายบนระบบ POS
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="br-name" className="text-foreground font-medium">
              ชื่อสาขา / จุดจำหน่าย <span className="text-destructive">*</span>
            </Label>
            <Input
              id="br-name"
              placeholder="เช่น สาขาเซ็นทรัลลาดพร้าว, สาขาอโศกทาวเวอร์"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="br-tax" className="text-foreground font-medium">
              เลขประจำตัวผู้เสียภาษีประจำสาขา (ถ้ามี)
            </Label>
            <Input
              id="br-tax"
              maxLength={13}
              placeholder="ระบุเลข 13 หลัก"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              disabled={isSubmitting}
              className="font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="br-phone" className="text-foreground font-medium">
              เบอร์โทรศัพท์ติดต่อประจำหน้าร้าน
            </Label>
            <Input
              id="br-phone"
              placeholder="เช่น 02-xxx-xxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
              className="font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="br-address" className="text-foreground font-medium">
              ที่อยู่สาขาอย่างละเอียด
            </Label>
            <Textarea
              id="br-address"
              placeholder="ระบุเลขที่ตั้ง อาคาร ชั้น ถนน แขวง เขต และรหัสไปรษณีย์"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isSubmitting}
              className="leading-relaxed"
            />
          </div>

          <DialogFooter className="gap-2 pt-3 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
              className="px-4 text-xs font-medium"
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 size={14} className="mr-1 animate-spin" />{' '}
                  กำลังสร้างสาขา...
                </>
              ) : (
                'บันทึกข้อมูลสาขา'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
