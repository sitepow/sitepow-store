'use client'

import React, { useState } from 'react'

import { Safari } from '@/components/magicui/safari'

const STEPS = [
  {
    step: '01',
    title: '1. สมัครเปิดร้านค้าฟรีใน 1 นาที',
    description:
      'กรอกชื่อร้านค้าและเลือกลิงก์เว็บไซต์ของคุณได้ทันที ระบบจะสร้างหน้าร้านค้าออนไลน์พร้อมใช้งานให้โดยอัตโนมัติ โดยไม่ต้องเขียนโค้ดแม้แต่บรรทัดเดียว',
    badge: 'ง่ายและรวดเร็ว',
  },
  {
    step: '02',
    title: '2. ลงสินค้าด้วยพลังของ AI',
    description:
      'เพียงอัปโหลดภาพถ่ายสินค้า AI จะช่วยเขียนชื่อสินค้าและคำบรรยายที่น่าสนใจให้ทันที หรือจะนำเข้าข้อมูลสินค้าจำนวนมากผ่านไฟล์ CSV จาก Lazada / Shopee ก็ทำได้ในคลิกเดียว',
    badge: 'AI Smart Auto-fill',
  },
  {
    step: '03',
    title: '3. เริ่มขาย & รับเงินเข้าบัญชีตรง 0% GP',
    description:
      'ลูกค้าสั่งซื้อผ่านเว็บหรือจะคิดเงินผ่านระบบ POS หน้าร้าน เงินโอนตรงเข้าบัญชีคุณทันที พร้อม AI ตรวจสลิปและพิมพ์ใบปะหน้าพัสดุเตรียมส่งของ',
    badge: 'กำไร 100% เต็ม',
  },
]

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section id="how-it-works" className="relative w-full py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl space-y-4 pb-6 text-center">
          <h2 className="text-primary text-sm font-semibold">
            ขั้นตอนการทำงาน
          </h2>
          <h3 className="text-foreground text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
            เพียง 3 ขั้นตอน เริ่มต้นขายได้ทันที
          </h3>
          <p className="text-muted-foreground text-base sm:text-lg">
            ออกแบบให้ใช้งานง่ายที่สุด
            ไม่มีความรู้เรื่องเทคนิคก็สามารถเปิดร้านและใช้งานได้ภายในไม่กี่นาที
          </p>
        </div>

        {/* 2 Column: Steps & Live Preview */}
        <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left: Steps list */}
          <div className="space-y-4 lg:col-span-5">
            {STEPS.map((s, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-300 sm:p-5 ${
                  activeStep === idx
                    ? 'border-primary/40 bg-primary/[0.04] dark:bg-primary/[0.08] shadow-md'
                    : 'border-border/60 bg-card hover:border-border'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        activeStep === idx
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {s.step}
                    </span>
                    <span className="text-card-foreground text-sm font-bold sm:text-base">
                      {s.title}
                    </span>
                  </div>
                  <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-[10px] font-medium">
                    {s.badge}
                  </span>
                </div>
                <p className="text-muted-foreground mt-3 pl-0 text-xs leading-relaxed sm:pl-11 sm:text-sm">
                  {s.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right: Step Visual Preview */}
          <div className="lg:col-span-7">
            <div className="bg-card ring-border relative overflow-hidden rounded-3xl border p-2 shadow-2xl ring-1">
              <Safari
                url={
                  activeStep === 0
                    ? 'sitepow.store/register'
                    : activeStep === 1
                      ? 'sitepow.store/merchant/products'
                      : 'sitepow.store/merchant/pos'
                }
                mode="simple"
                className="w-full"
              >
                <div className="size-full bg-neutral-200 transition-colors dark:bg-neutral-800" />
              </Safari>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
