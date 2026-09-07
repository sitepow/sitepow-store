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

const INTEGRATIONS_ROW_1 = [
  {
    name: 'PromptPay QR',
    desc: 'สแกนจ่ายเงินเข้าบัญชีตรง',
    icon: IconQrcode,
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    name: 'Stripe Gateway',
    desc: 'รับบัตรเครดิต/เดบิตสากล',
    icon: IconBrandStripe,
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  {
    name: 'AI Slip Verification',
    desc: 'ดักสลิปปลอมอัตโนมัติ',
    icon: IconRobot,
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    name: 'Visa & Mastercard',
    desc: 'ปลอดภัยระดับสากล',
    icon: IconBrandMastercard,
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  {
    name: '0% GP Commission',
    desc: 'ไม่หักเปอร์เซ็นต์กำไร',
    icon: IconBolt,
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
]

const INTEGRATIONS_ROW_2 = [
  {
    name: 'Flash Express',
    desc: 'ออกเลข Tracking อัตโนมัติ',
    icon: IconTruck,
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  {
    name: 'Kerry Express',
    desc: 'เชื่อมต่อพิมพ์ใบปะหน้า',
    icon: IconPackage,
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  {
    name: 'Thailand Post',
    desc: 'รองรับ EMS และลงทะเบียน',
    icon: IconTruck,
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  {
    name: 'Digital Game Keys',
    desc: 'แจกคีย์และรหัสอัตโนมัติ',
    icon: IconDeviceMobile,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    name: 'Enterprise Security',
    desc: 'SSL และระบบแยกฐานข้อมูล',
    icon: IconShieldCheck,
    color: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  },
]

export function IntegrationsMarqueeSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-slate-950/80 py-12">
      <div className="mx-auto mb-6 max-w-xl px-4 text-center">
        <h3 className="text-primary text-xs font-semibold tracking-widest uppercase">
          รองรับทุกช่องทางที่คุณต้องการ
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          เชื่อมต่อระบบชำระเงิน การจัดส่ง และคลังสินค้าแบบครบวงจร
          พร้อมใช้งานได้ทันที
        </p>
      </div>

      <div className="relative flex flex-col gap-3">
        <Marquee pauseOnHover className="[--duration:30s]">
          {INTEGRATIONS_ROW_1.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md transition-colors hover:bg-white/10"
            >
              <div
                className={`flex size-9 items-center justify-center rounded-lg border ${item.color}`}
              >
                <item.icon size={18} />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white">
                  {item.name}
                </div>
                <div className="text-[11px] text-slate-400">{item.desc}</div>
              </div>
            </div>
          ))}
        </Marquee>

        <Marquee reverse pauseOnHover className="[--duration:35s]">
          {INTEGRATIONS_ROW_2.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md transition-colors hover:bg-white/10"
            >
              <div
                className={`flex size-9 items-center justify-center rounded-lg border ${item.color}`}
              >
                <item.icon size={18} />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white">
                  {item.name}
                </div>
                <div className="text-[11px] text-slate-400">{item.desc}</div>
              </div>
            </div>
          ))}
        </Marquee>

        {/* Gradient fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950 to-transparent" />
      </div>
    </section>
  )
}
