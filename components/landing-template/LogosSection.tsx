'use client'

import React from 'react'

import {
  IconBolt,
  IconBrandMastercard,
  IconBrandStripe,
  IconCreditCard,
  IconDeviceMobile,
  IconPackage,
  IconQrcode,
  IconRobot,
  IconShieldCheck,
  IconTruck,
} from '@tabler/icons-react'

import { Marquee } from '@/components/magicui/marquee'

const LOGO_ITEMS = [
  { name: 'PromptPay QR', icon: IconQrcode, note: 'สแกนจ่ายเงินเข้าบัญชีตรง' },
  {
    name: 'Stripe Payments',
    icon: IconBrandStripe,
    note: 'รับบัตรเครดิตทั่วโลก',
  },
  {
    name: 'AI Slip Verification',
    icon: IconRobot,
    note: 'ตรวจจับสลิปปลอมอัตโนมัติ',
  },
  {
    name: 'Visa & Mastercard',
    icon: IconBrandMastercard,
    note: 'ความปลอดภัยมาตรฐาน',
  },
  { name: '0% GP Commission', icon: IconBolt, note: 'ไม่หักเปอร์เซ็นต์ยอดขาย' },
  { name: 'Flash Express', icon: IconTruck, note: 'ออกเลขพัสดุอัตโนมัติ' },
  { name: 'Kerry Express', icon: IconPackage, note: 'เชื่อมต่อพิมพ์ใบปะหน้า' },
  { name: 'Thailand Post', icon: IconTruck, note: 'EMS และลงทะเบียน' },
  {
    name: 'Digital Key Codes',
    icon: IconDeviceMobile,
    note: 'ส่งมอบรหัส/คีย์ทันที',
  },
  { name: 'SSL Security', icon: IconShieldCheck, note: 'แยกฐานข้อมูลปลอดภัย' },
]

export function LogosSection() {
  return (
    <section
      id="logos"
      className="border-border/40 relative w-full border-b py-12"
    >
      <div className="container mx-auto px-4 md:px-8">
        <h3 className="text-muted-foreground text-center text-xs font-semibold">
          ช่องทางชำระเงินและระบบขนส่งที่รองรับ
        </h3>

        <div className="relative mt-6">
          <Marquee pauseOnHover className="[--duration:35s] [--gap:1.5rem]">
            {LOGO_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="bg-card/60 text-card-foreground hover:bg-card flex items-center gap-2.5 rounded-xl border px-4 py-2 shadow-xs transition-colors"
              >
                <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-lg">
                  <item.icon size={16} />
                </div>
                <div>
                  <div className="text-xs leading-none font-semibold">
                    {item.name}
                  </div>
                  <div className="text-muted-foreground text-[10px]">
                    {item.note}
                  </div>
                </div>
              </div>
            ))}
          </Marquee>

          {/* Left & Right Gradient Fades */}
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 h-full w-24 bg-gradient-to-r to-transparent md:w-36" />
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 h-full w-24 bg-gradient-to-l to-transparent md:w-36" />
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 h-full w-12 bg-gradient-to-r to-transparent sm:w-24 md:w-36" />
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 h-full w-12 bg-gradient-to-l to-transparent sm:w-24 md:w-36" />
        </div>
      </div>
    </section>
  )
}
