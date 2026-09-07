'use client'

import { IconSparkles } from '@tabler/icons-react'

export function FeaturesHeroSection() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-8 pb-4 text-center sm:px-6 lg:px-8">
      <div className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold shadow-2xs">
        <IconSparkles size={15} />
        <span>ฟังก์ชันและระบบทั้งหมด</span>
      </div>

      <div className="space-y-4">
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
          ทุกฟังก์ชันที่คุณต้องการ{' '}
          <span className="from-primary bg-linear-to-r via-orange-500 to-amber-500 bg-clip-text text-transparent">
            สำหรับการขายยุคใหม่
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-base leading-relaxed text-balance sm:text-lg">
          รวมระบบร้านค้าออนไลน์ (E-Commerce), ระบบคิดเงินหน้าร้าน (POS),
          ตัดสต็อกสินค้าหลายสาขาแบบ Real-time และ AI
          ช่วยจัดการสินค้าไว้ในแพลตฟอร์มเดียว รองรับการเติบโตของธุรกิจในทุกมิติ
        </p>
      </div>
    </div>
  )
}
