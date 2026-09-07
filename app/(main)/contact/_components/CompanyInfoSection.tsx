'use client'

import React from 'react'

import {
  IconCheck,
  IconClock,
  IconCpu,
  IconMapPin,
  IconPercentage,
  IconServer,
  IconShieldCheck,
} from '@tabler/icons-react'

const HIGHLIGHTS = [
  {
    icon: <IconServer size={24} className="text-blue-500" />,
    title: 'เซิร์ฟเวอร์ในประเทศไทย (Local Cloud)',
    description:
      'ระบบตั้งอยู่บน Cloud Infrastructure คุณภาพสูงในไทย ตอบสนองรวดเร็วระดับมิลลิวินาที ใช้งานหน้าร้านได้ลื่นไหลไม่มีสะดุด',
  },
  {
    icon: <IconShieldCheck size={24} className="text-emerald-500" />,
    title: 'ความปลอดภัยมาตรฐานระดับธนาคาร',
    description:
      'เข้ารหัสข้อมูลด้วย SSL/TLS 256-bit พร้อมระบบสำรองข้อมูล (Backup) อัตโนมัติในทุกวัน ข้อมูลลูกค้าและยอดขายปลอดภัย 100%',
  },
  {
    icon: <IconClock size={24} className="text-amber-500" />,
    title: 'ทีมงานซัพพอร์ตพร้อมดูแลทุกวัน',
    description:
      'เจ้าหน้าที่และวิศวกรคนไทยพร้อมดูแลตั้งแต่ 09:00 - 24:00 น. ทุกวัน เพื่อให้ธุรกิจของคุณดำเนินต่อไปได้อย่างมั่นใจ',
  },
  {
    icon: <IconPercentage size={24} className="text-purple-500" />,
    title: 'โปร่งใส ไม่มีค่าธรรมเนียมแอบแฝง',
    description:
      '0% GP ทุกยอดขาย เงินโอนเข้าบัญชีคุณโดยตรง ไม่มีการหักค่าหัวคิว มีความจริงใจและแฟร์กับผู้ประกอบการที่สุด',
  },
]

export function CompanyInfoSection() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="text-primary text-xs font-semibold">
          มาตรฐานความปลอดภัยและความเสถียร
        </span>
        <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          มั่นใจด้วยมาตรฐานระดับ Enterprise
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          โครงสร้างพื้นฐานและความมุ่งมั่นในการดูแลร้านค้าของ Sitepow Store
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {HIGHLIGHTS.map((item, idx) => (
          <div
            key={idx}
            className="border-border/80 bg-card/60 hover:border-border relative flex flex-col justify-between rounded-3xl border p-6 shadow-xs transition-all duration-300 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="bg-muted flex size-12 items-center justify-center rounded-2xl shadow-2xs">
                {item.icon}
              </div>
              <h3 className="text-foreground text-base font-bold">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
