'use client'

import React from 'react'

import Link from 'next/link'

import {
  IconBuildingStore,
  IconCheck,
  IconDeviceLaptop,
  IconDownload,
  IconPlugConnected,
  IconQrcode,
} from '@tabler/icons-react'

import { Safari } from '@/components/magicui/safari'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    step: '01',
    title: '1. ดาวน์โหลดหรือเปิดผ่านเว็บ',
    description:
      'เลือกติดตั้งโปรแกรมตามระบบปฏิบัติการที่คุณใช้งาน (Windows, Android, iOS, Mac) หรือจะเปิดใช้งานผ่านเว็บเบราว์เซอร์ Chrome / Safari ได้ทันทีโดยไม่ต้องติดตั้ง',
    icon: <IconDownload size={20} />,
  },
  {
    step: '02',
    title: '2. เข้าสู่ระบบร้านค้าของคุณ',
    description:
      'ล็อกอินด้วยบัญชี Sitepow Store ระบบจะทำการซิงก์ข้อมูลสินค้า หมวดหมู่ ราคาสินค้า และสต็อกคงเหลือจากทุกสาขามาให้อัตโนมัติในทันที',
    icon: <IconBuildingStore size={20} />,
  },
  {
    step: '03',
    title: '3. เสียบอุปกรณ์แล้วเริ่มขายได้เลย',
    description:
      'เชื่อมต่อเครื่องพิมพ์ใบเสร็จและเครื่องยิงบาร์โค้ด เริ่มเปิดบิล คิดเงิน รับเงินโอนผ่าน PromptPay 0% GP และตัดสต็อกแบบ Real-time ทันที',
    icon: <IconPlugConnected size={20} />,
  },
]

export function QuickSetupSection() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="text-primary text-xs font-semibold">
          ขั้นตอนการติดตั้ง
        </span>
        <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          เริ่มต้นใช้งานง่าย ๆ ใน 3 ขั้นตอน
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          ไม่จำเป็นต้องมีความรู้เรื่องคอมพิวเตอร์หรือระบบไอที
          เพียงทำตามขั้นตอนสั้น ๆ ก็พร้อมเปิดขายหน้าร้านได้ภายในไม่กี่นาที
        </p>
      </div>

      {/* Grid: 3 Steps Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((s, idx) => (
          <div
            key={idx}
            className="border-border/80 bg-card/60 relative flex flex-col justify-between rounded-3xl border p-6 shadow-xs transition-all duration-300 hover:shadow-md sm:p-7"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-bold">
                  Step {s.step}
                </span>
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                  {s.icon}
                </div>
              </div>

              <h3 className="text-foreground text-lg font-bold">{s.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Clean Safari Screen Preview with Grey Background */}
      <div className="relative mx-auto w-full max-w-4xl pt-4">
        <div className="bg-card ring-border relative overflow-hidden rounded-3xl border p-2 shadow-2xl ring-1">
          <Safari
            url="pos.sitepow.store/cashier"
            mode="simple"
            className="w-full"
          >
            <div className="size-full bg-neutral-200 transition-colors dark:bg-neutral-800" />
          </Safari>
        </div>
      </div>
    </div>
  )
}
