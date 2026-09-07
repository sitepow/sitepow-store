'use client'

import Link from 'next/link'

import {
  IconArrowDown,
  IconCheck,
  IconDeviceDesktop,
  IconWorld,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

export function DownloadHeroSection() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-8 pb-4 text-center sm:px-6 lg:px-8">
      <div className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold shadow-2xs">
        <IconDeviceDesktop size={15} />
        <span>ระบบขายหน้าร้าน Sitepow POS</span>
      </div>

      <div className="space-y-4">
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
          ดาวน์โหลด Sitepow POS{' '}
          <span className="from-primary bg-linear-to-r via-orange-500 to-amber-500 bg-clip-text text-transparent">
            สำหรับทุกอุปกรณ์ของคุณ
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-base leading-relaxed text-balance sm:text-lg">
          เปลี่ยนแท็บเล็ต คอมพิวเตอร์ หรือสมาร์ทโฟนให้เป็นเครื่องคิดเงินอัจฉริยะ
          เชื่อมต่อเครื่องพิมพ์ใบเสร็จและลิ้นชักเก็บเงิน พร้อมซิงก์สต็อกสินค้า
          Real-time ทันทีที่มีการขาย
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
        <Button
          size="lg"
          asChild
          className="shadow-primary/20 h-11 cursor-pointer px-6 text-sm font-semibold shadow-md"
        >
          <a href="#platforms" className="flex items-center gap-2">
            <IconArrowDown size={18} />
            <span>เลือกระบบปฏิบัติการเพื่อดาวน์โหลด</span>
          </a>
        </Button>
        <Button
          variant="outline"
          size="lg"
          asChild
          className="h-11 cursor-pointer px-6 text-sm font-medium"
        >
          <Link
            href="/merchant/pos"
            target="_blank"
            className="flex items-center gap-2"
          >
            <IconWorld size={18} />
            <span>เข้าใช้งานผ่าน Web POS ทันที</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
