'use client'

import React from 'react'

import Link from 'next/link'

import { UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { IconCheck } from '@tabler/icons-react'
import { ArrowRight } from 'lucide-react'

import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  const { isAuthenticated } = useSession()

  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', '/merchant/dashboard')

  const registerHref = `/register?${registerParams.toString()}`

  return (
    <section className="relative overflow-hidden bg-slate-950 px-4 py-24 text-center text-white sm:px-8">
      <AnimatedGridPattern
        numSquares={25}
        maxOpacity={0.2}
        duration={3}
        className="[mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_75%)]"
      />

      <div className="bg-primary/20 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[350px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-3xl space-y-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          พร้อมยกระดับธุรกิจออนไลน์และหน้าร้านของคุณแล้วหรือยัง?
        </h2>
        <p className="text-base text-slate-300 sm:text-lg">
          สมัครเปิดร้านค้าออนไลน์วันนี้ ใช้งานระบบ POS, จัดการสต็อก, และ AI
          ตรวจสลิปได้ทันที ฟรีค่าธรรมเนียม 0% GP
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {!isAuthenticated ? (
            <Link href={registerHref}>
              <ShimmerButton className="text-base font-semibold">
                <span className="flex items-center gap-2">
                  สมัครเปิดร้านค้าของคุณฟรี
                  <ArrowRight size={18} />
                </span>
              </ShimmerButton>
            </Link>
          ) : (
            <Link href="/merchant/dashboard">
              <ShimmerButton className="text-base font-semibold">
                <span className="flex items-center gap-2">
                  ไปยังแดชบอร์ดจัดการร้านค้า
                  <ArrowRight size={18} />
                </span>
              </ShimmerButton>
            </Link>
          )}

          <Button
            variant="outline"
            size="lg"
            asChild
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/pricing">ตรวจสอบราคาแพ็กเกจ</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <IconCheck size={15} className="text-emerald-400" />
            <span>ไม่ต้องผูกบัตรเครดิต</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IconCheck size={15} className="text-emerald-400" />
            <span>ติดตั้งง่าย ใช้งานได้ทันที</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IconCheck size={15} className="text-emerald-400" />
            <span>มีทีมงานซัพพอร์ตภาษาไทย</span>
          </div>
        </div>
      </div>
    </section>
  )
}
