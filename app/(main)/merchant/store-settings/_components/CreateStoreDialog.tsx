'use client'

import React, { useState } from 'react'

import { IconBuildingStore, IconPlus } from '@tabler/icons-react'

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
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { type PlanType } from './planDetails'

interface Store {
  id: string
  name: string
  slug: string
  plan: PlanType
  status: string
  createdAt: string
}

interface CreateStoreDialogProps {
  onCreated: (store: Store) => void
}

function formatSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-ก-๙]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function CreateStoreDialog({ onCreated }: CreateStoreDialogProps) {
  const [open, setOpen] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [storeSlug, setStoreSlug] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('STARTER')
  const [isTrial, setIsTrial] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeName || !storeSlug) {
      return
    }

    onCreated({
      id: Math.random().toString(),
      name: storeName,
      slug: formatSlug(storeSlug),
      plan: selectedPlan,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    })

    setStoreName('')
    setStoreSlug('')
    setSelectedPlan('STARTER')
    setIsTrial(true)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 sm:w-auto">
          <IconPlus size={16} />
          <span>สร้างร้านค้าใหม่</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] max-w-3xl overflow-y-auto p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <IconBuildingStore className="text-primary" size={24} />
            เริ่มต้นสร้างร้านค้าใหม่
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลพื้นฐานเพื่อตั้งค่า URL หน้าร้านที่เป็นเอกลักษณ์
            พร้อมเลือกแพลนเริ่มต้นใช้งานของคุณ
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-5">
            <Field>
              <FieldLabel>ชื่อร้านค้า</FieldLabel>
              <Input
                placeholder="เช่น เสื้อผ้าเด็กมินิมอล"
                value={storeName}
                onChange={(e) => {
                  setStoreName(e.target.value)
                  if (!storeSlug) setStoreSlug(e.target.value)
                }}
                required
              />
            </Field>
            <Field>
              <FieldLabel>URL ร้านค้า (Slug)</FieldLabel>
              <div className="flex rounded-lg shadow-sm">
                <span className="border-input bg-muted text-muted-foreground inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm">
                  myshop.com/
                </span>
                <Input
                  placeholder="minimal-kids"
                  className="rounded-l-none"
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(e.target.value)}
                  required
                />
              </div>
              {storeSlug && (
                <p className="text-muted-foreground text-[11px]">
                  ตัวอย่างลิงก์:{' '}
                  <span className="text-primary">
                    myshop.com/{formatSlug(storeSlug)}
                  </span>
                </p>
              )}
            </Field>
          </div>
          <DialogFooter className="w-full gap-2 sm:w-auto sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" size="sm">
              {isTrial || selectedPlan === 'STARTER'
                ? 'เปิดใช้งานร้านค้าฟรี'
                : 'ชำระเงินและเปิดระบบ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
