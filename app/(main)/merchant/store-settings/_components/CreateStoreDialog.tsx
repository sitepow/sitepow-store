'use client'

import React, { useState } from 'react'

import { Plan } from '@/generated/prisma/enums'
import { IconPlus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'

import { PLAN_DETAILS } from './planDetails'

interface Store {
  id: string
  name: string
  slug: string
  plan: Plan
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
  const [selectedPlan, setSelectedPlan] = useState<Plan>(Plan.STARTER)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeName || !storeSlug) {
      return
    }

    onCreated({
      id: `store_${Math.random().toString(36).substr(2, 9)}`,
      name: storeName,
      slug: formatSlug(storeSlug),
      plan: selectedPlan,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    })

    setStoreName('')
    setStoreSlug('')
    setSelectedPlan(Plan.STARTER)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <IconPlus size={16} />
          <span>สร้างร้านค้าใหม่</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle>เริ่มต้นสร้างร้านค้าใหม่</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลพื้นฐานเพื่อตั้งค่า URL หน้าร้านที่เป็นเอกลักษณ์
            พร้อมเลือกแพลนเริ่มต้นใช้งานของคุณ
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
              <FieldLabel>URL หน้าร้าน (Slug)</FieldLabel>
              <div className="flex">
                <span className="bg-muted inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm">
                  sitepow.store/
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
                <FieldDescription>
                  ลิงก์ร้านค้าของคุณ{' '}
                  <span>https://{formatSlug(storeSlug)}.sitepow.store</span>
                </FieldDescription>
              )}
            </Field>
          </div>
          <Field className="space-y-3">
            <FieldLabel>เลือกแพ็กเกจเริ่มต้นใช้งาน</FieldLabel>
            <div className="flex flex-col gap-3">
              {(Object.keys(PLAN_DETAILS) as Plan[]).map((key) => {
                const plan = PLAN_DETAILS[key]
                const isSelected = selectedPlan === key

                return (
                  <Card
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    className={cn(
                      'cursor-pointer',
                      isSelected && 'border-primary ring-primary ring-1',
                    )}
                  >
                    <CardHeader className="border-b">
                      <div className="flex flex-wrap items-center justify-between gap-5">
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            {plan.name}
                          </CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </div>
                        <div className="shrink-0 text-right">
                          <b className="text-primary text-xl">
                            {plan.price} -.
                          </b>
                          <span className="block text-[10px]">/เดือน</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="grid grid-cols-1 sm:grid-cols-2">
                        {plan.features.map((feat, i) => (
                          <li
                            key={i}
                            className="text-muted-foreground flex items-center gap-1.5"
                          >
                            <span className="shrink-0">-</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </Field>
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit">สร้างร้านค้าของคุณ</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
