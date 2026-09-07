'use client'

import React from 'react'

import { IconCoins, IconReceipt2, IconRefreshAlert } from '@tabler/icons-react'

import { Card, CardContent } from '@/components/ui/card'

const PROBLEMS = [
  {
    icon: IconCoins,
    title: 'ค่าธรรมเนียม GP มหาศาล',
    description:
      'การขายผ่าน Marketplace ถูกหักค่าธรรมเนียมและ GP สูงถึง 15% - 30% ยิ่งขายดี ยิ่งต้องจ่ายเยอะ ทำให้กำไรสุทธิของคุณหดหายไปเกินครึ่ง',
  },
  {
    icon: IconReceipt2,
    title: 'เสียเวลากับการตรวจสลิปโอนเงิน',
    description:
      'แอดมินต้องนั่งตรวจสลิปทีละใบ เสียเวลาตอบแชทล่าช้า และยังเสี่ยงอย่างยิ่งที่จะถูกหลอกด้วยสลิปปลอมหรือสลิปตัดต่อที่นำมาใช้ซ้ำ',
  },
  {
    icon: IconRefreshAlert,
    title: 'สต็อกหน้าร้านและออนไลน์ไม่ตรงกัน',
    description:
      'ขายทั้งหน้าร้านจริงและบนโซเชียลมีเดีย แต่สต็อกไม่เชื่อมกัน ทำให้เกิดปัญหาขายของเกินสต็อก ลูกค้าโอนเงินแล้วแต่ไม่มีของส่ง เสียชื่อเสียงร้านค้า',
  },
]

export function ProblemSection() {
  return (
    <section id="problem" className="relative w-full py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl space-y-4 pb-6 text-center">
          <h2 className="text-primary text-sm font-semibold">ปัญหาที่พบบ่อย</h2>
          <h3 className="text-foreground text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
            การบริหารร้านค้าแบบเดิม ๆ มักเต็มไปด้วยความยุ่งยาก
          </h3>
          <p className="text-muted-foreground text-base sm:text-lg">
            ร้านค้าส่วนใหญ่เสียเวลาและต้นทุนไปกับกระบวนการทำงานที่ซ้ำซ้อน
            แทนที่จะได้โฟกัสกับการขยายธุรกิจ
          </p>
        </div>

        {/* 3 Column Cards */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {PROBLEMS.map((prob, idx) => (
            <Card
              key={idx}
              className="border-border/80 bg-card rounded-2xl border p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-6"
            >
              <CardContent className="space-y-4 p-0">
                <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                  <prob.icon size={26} />
                </div>
                <h4 className="text-card-foreground text-xl font-bold">
                  {prob.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {prob.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
