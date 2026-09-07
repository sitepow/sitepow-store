'use client'

import React from 'react'

import {
  IconCheck,
  IconClock,
  IconHeadset,
  IconMessageDots,
  IconUsers,
} from '@tabler/icons-react'

export function ContactHeroSection() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-8 pb-4 text-center sm:px-6 lg:px-8">
      {/* Monospace Badge */}
      <div className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold shadow-2xs">
        <IconHeadset size={15} />
        <span>ติดต่อและศูนย์ช่วยเหลือ</span>
      </div>

      {/* Headline */}
      <div className="space-y-4">
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
          ติดต่อทีมงาน{' '}
          <span className="from-primary bg-gradient-to-r via-orange-500 to-amber-500 bg-clip-text text-transparent">
            Sitepow Store
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-base leading-relaxed text-balance sm:text-lg">
          มีคำถามเกี่ยวกับระบบ ต้องการปรึกษาการใช้งาน หรือสนใจแพ็กเกจ
          Enterprise?
          ทีมงานผู้เชี่ยวชาญคนไทยของเราพร้อมดูแลและให้คำแนะนำในทุกวัน
        </p>
      </div>

      {/* SLA Highlights */}
      <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs font-medium sm:text-sm">
        <div className="flex items-center gap-1.5">
          <div className="flex size-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <IconCheck size={11} strokeWidth={3} />
          </div>
          <span>เวลาทำการ 09:00 - 24:00 น. ทุกวัน</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex size-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <IconCheck size={11} strokeWidth={3} />
          </div>
          <span>ตอบกลับรวดเร็วเฉลี่ยภายใน 15 นาที</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex size-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <IconCheck size={11} strokeWidth={3} />
          </div>
          <span>ทีมงาน Technical Support คนไทย 100%</span>
        </div>
      </div>
    </div>
  )
}
