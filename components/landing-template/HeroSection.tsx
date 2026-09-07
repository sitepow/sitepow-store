'use client'

import React from 'react'

import Link from 'next/link'

import { UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { IconBuildingStore } from '@tabler/icons-react'
import { ArrowRight } from 'lucide-react'

import { BorderBeam } from '@/components/magicui/border-beam'
import { Safari } from '@/components/magicui/safari'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const { isAuthenticated } = useSession()

  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', '/merchant/dashboard')
  const registerHref = `/register?${registerParams.toString()}`

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden pt-12 md:pt-16"
    >
      <div className="relative flex w-full flex-col items-center justify-start px-4 sm:px-6 md:px-8">
        {/* Announcement Pill Badge */}
        <Link
          href={!isAuthenticated ? registerHref : '/merchant/dashboard'}
          className="group border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-center text-xs font-medium transition-all sm:flex-nowrap sm:text-sm"
        >
          <div className="bg-primary/20 text-primary shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-semibold">
            📣 ข่าวสารล่าสุด
          </div>
          <p className="flex items-center gap-1 font-medium">
            <span>เปิดตัวระบบ POS หน้าร้าน & AI ตรวจสลิป 0% GP</span>
          </p>
          <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* Heading & Subtitle */}
        <div className="flex w-full max-w-4xl flex-col space-y-4 pt-6 text-center">
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight text-balance break-words sm:text-5xl md:text-6xl">
            เปลี่ยนเรื่องยุ่ง ๆ ให้เป็นเรื่องง่าย{' '}
            <span className="from-primary bg-gradient-to-r via-orange-500 to-amber-500 bg-clip-text text-transparent">
              ของการขายสินค้าออนไลน์
            </span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed text-balance sm:text-base md:text-lg">
            รวมระบบจัดการร้านค้าออนไลน์ (E-Commerce), ระบบคิดเงินหน้าร้าน (POS),
            ตัดสต็อกสินค้าหลายสาขาแบบ Real-time และ AI
            ตรวจสอบสลิปโอนเงินอัตโนมัติ ไว้ในที่เดียว
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          {!isAuthenticated ? (
            <Button
              size="lg"
              asChild
              className="shadow-primary/25 h-11 w-full px-6 text-sm font-semibold shadow-lg sm:w-auto sm:text-base"
            >
              <Link
                href={registerHref}
                className="flex items-center justify-center gap-2"
              >
                <IconBuildingStore className="size-5" />
                <span>สมัครเปิดร้านค้าฟรี</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              asChild
              className="shadow-primary/25 h-11 w-full px-6 text-sm font-semibold shadow-lg sm:w-auto sm:text-base"
            >
              <Link
                href="/merchant/dashboard"
                className="flex items-center justify-center gap-2"
              >
                <IconBuildingStore className="size-5" />
                <span>จัดการร้านค้าของคุณ</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            asChild
            className="h-11 w-full px-6 text-sm font-medium sm:w-auto sm:text-base"
          >
            <Link href="/pricing" className="text-center">
              ดูราคาและแพ็กเกจ
            </Link>
          </Button>
        </div>

        {/* Trust Note */}
        <p className="text-muted-foreground mt-4 text-xs sm:text-sm">
          ขายฟรี 0% GP ไม่มีค่าคอมมิชชั่น • ไม่ต้องผูกบัตรเครดิต •
          เริ่มต้นใช้งานได้ใน 1 นาที
        </p>

        {/* Safari Mockup Frame */}
        <div className="relative mx-auto mt-12 flex w-full max-w-5xl items-center justify-center">
          <div className="bg-background/50 ring-border relative w-full rounded-2xl border p-2 shadow-2xl ring-1 backdrop-blur-md">
            <Safari url="app.sitepow.store" className="w-full">
              <div className="size-full bg-neutral-200 dark:bg-neutral-800" />
            </Safari>
            <BorderBeam
              size={180}
              duration={8}
              colorFrom="#f97316"
              colorTo="#3b82f6"
              borderWidth={2}
            />
          </div>

          {/* Bottom Gradient Fade */}
          <div className="from-background via-background/80 pointer-events-none absolute inset-x-0 -bottom-8 h-1/4 bg-gradient-to-t to-transparent" />
        </div>
      </div>
    </section>
  )
}
