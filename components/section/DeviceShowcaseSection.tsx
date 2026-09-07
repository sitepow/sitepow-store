'use client'

import React, { useState } from 'react'

import {
  IconCheck,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconQrcode,
  IconScan,
  IconSparkles,
} from '@tabler/icons-react'

import { Android } from '@/components/magicui/android'
import { BorderBeam } from '@/components/magicui/border-beam'
import { Iphone } from '@/components/magicui/iphone'
import { Safari } from '@/components/magicui/safari'
import { DashboardMockupContent } from '@/components/mockups/DashboardMockupContent'
import { PosMobileMockupContent } from '@/components/mockups/PosMobileMockupContent'
import { ScannerMobileMockupContent } from '@/components/mockups/ScannerMobileMockupContent'

import { SectionContainer } from '../SectionContainer'
import { SectionHeader } from '../SectionHeader'

export function DeviceShowcaseSection() {
  const [activeDevice, setActiveDevice] = useState<
    'desktop' | 'mobile' | 'scanner'
  >('desktop')

  return (
    <SectionContainer className="gap-12 py-20">
      <div className="flex flex-col items-center text-center">
        <div className="border-primary/30 bg-primary/10 text-primary mb-3 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold">
          <IconDeviceDesktop size={14} />
          <span>Omnichannel Software Architecture</span>
        </div>
        <SectionHeader
          title="ซอฟต์แวร์เดียวที่เชื่อมต่อ ทุกหน้าจอการทำงานของคุณ"
          description="ไม่ว่าคุณจะนั่งบริหารงานหลังบ้านหน้าคอมพิวเตอร์, เดินตรวจสต็อกในคลัง, หรือยืนคิดเงินลูกค้าหน้าร้าน POS ข้อมูลสินค้า ยอดเงิน และสต็อกจะซิงก์ตรงกันแบบ Real-time ทันที"
        />

        {/* Device Switcher Pills */}
        <div className="mt-8 inline-flex items-center rounded-2xl border border-white/10 bg-slate-900/80 p-1.5 backdrop-blur-md">
          <button
            onClick={() => setActiveDevice('desktop')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeDevice === 'desktop'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <IconDeviceDesktop size={16} />
            <span>เดสก์ท็อป / แดชบอร์ด (Safari)</span>
          </button>
          <button
            onClick={() => setActiveDevice('mobile')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeDevice === 'mobile'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <IconDeviceMobile size={16} />
            <span>Mobile POS & ร้านค้า (iPhone)</span>
          </button>
          <button
            onClick={() => setActiveDevice('scanner')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeDevice === 'scanner'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <IconScan size={16} />
            <span>ตรวจสลิป AI & สแกนเนอร์ (Android)</span>
          </button>
        </div>
      </div>

      {/* Device Display Area */}
      <div className="relative mx-auto w-full max-w-6xl">
        {/* DESKTOP (Safari Mockup) */}
        {activeDevice === 'desktop' && (
          <div className="animate-in fade-in zoom-in-95 flex flex-col items-center duration-500">
            <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-1 shadow-2xl">
              <Safari url="app.sitepow.store/admin" className="w-full">
                <DashboardMockupContent />
              </Safari>
              <BorderBeam
                size={180}
                duration={8}
                colorFrom="#f97316"
                colorTo="#3b82f6"
              />
            </div>

            <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">
                  จัดการสต็อกหลายสาขา
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  เพิ่ม ลบ แก้ไขสินค้า พร้อมระบบแจ้งเตือนสินค้าใกล้หมด
                  ตัดสต็อกอัตโนมัติ
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">
                  พิมพ์ใบปะหน้าพัสดุ
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  รองรับเครื่องพิมพ์ความร้อน ออกเลข Tracking
                  เชื่อมขนส่งชั้นนำครบครัน
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">
                  รายงานยอดขายเชิงลึก
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  ดูสถิติสินค้าขายดี ยอดกำไรสุทธิ
                  และข้อมูลลูกค้าเพื่อต่อยอดการตลาด
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MOBILE POS (iPhone Mockup) */}
        {activeDevice === 'mobile' && (
          <div className="animate-in fade-in zoom-in-95 flex flex-col items-center duration-500 lg:flex-row lg:items-center lg:justify-center lg:gap-16">
            <div className="w-[300px] shrink-0 sm:w-[320px]">
              <div className="relative overflow-hidden rounded-[55px] border border-white/15 shadow-2xl">
                <Iphone className="w-full">
                  <PosMobileMockupContent />
                </Iphone>
                <BorderBeam
                  size={140}
                  duration={7}
                  colorFrom="#10b981"
                  colorTo="#3b82f6"
                />
              </div>
            </div>

            <div className="mt-8 max-w-md space-y-5 text-left lg:mt-0">
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <IconQrcode size={15} />
                <span>Mobile Point of Sale (POS)</span>
              </div>
              <h3 className="text-2xl font-bold text-white sm:text-3xl">
                เปลี่ยนมือถือหรือแท็บเล็ต ให้เป็นเครื่องคิดเงินอัจฉริยะ
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                ไม่จำเป็นต้องซื้อเครื่อง POS แพงๆ อีกต่อไป
                เพียงเข้าใช้งานผ่านเบราว์เซอร์หรือมือถือ ก็สามารถเปิดบิล คิดเงิน
                ยิงบาร์โค้ด และสร้าง QR Code PromptPay รับเงินเข้าบัญชีได้ทันที
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <IconCheck size={12} />
                  </div>
                  <span>
                    ตัดสต็อกสินค้าในคลังแบบ Real-time ทันทีที่มีการคิดเงิน
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <IconCheck size={12} />
                  </div>
                  <span>รองรับทั้งการขายสินค้าหน้าร้านและคีย์รหัสดิจิทัล</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <IconCheck size={12} />
                  </div>
                  <span>ลูกค้าสแกนจ่ายง่าย ปิดยอดสรุปกะสิ้นวันได้แม่นยำ</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCANNER / AI (Android Mockup) */}
        {activeDevice === 'scanner' && (
          <div className="animate-in fade-in zoom-in-95 flex flex-col items-center duration-500 lg:flex-row-reverse lg:items-center lg:justify-center lg:gap-16">
            <div className="w-[300px] shrink-0 sm:w-[320px]">
              <div className="relative overflow-hidden rounded-[38px] border border-white/15 shadow-2xl">
                <Android className="w-full">
                  <ScannerMobileMockupContent />
                </Android>
                <BorderBeam
                  size={140}
                  duration={7}
                  colorFrom="#eab308"
                  colorTo="#ef4444"
                />
              </div>
            </div>

            <div className="mt-8 max-w-md space-y-5 text-left lg:mt-0">
              <div className="inline-flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                <IconSparkles size={15} />
                <span>AI Automated Verification & Logistics</span>
              </div>
              <h3 className="text-2xl font-bold text-white sm:text-3xl">
                ดักสลิปปลอม & เตรียมจัดส่ง ด้วยพลังของระบบ AI
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                หมดปัญหาทีมงานต้องมาคอยตรวจสลิปโอนเงินทีละใบ ระบบ AI
                ตรวจสอบยอดเงิน วันที่ และเลขบัญชีปลายทางให้โดยอัตโนมัติ
                พร้อมตรวจจับสลิปที่นำมาใช้ซ้ำแบบ 100%
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="flex size-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                    <IconCheck size={12} />
                  </div>
                  <span>
                    ตรวจสอบสลิปอัตโนมัติ ปลอดภัย ไม่ต้องรอแอดมินตอบแชท
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex size-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                    <IconCheck size={12} />
                  </div>
                  <span>สร้างใบปะหน้าพัสดุทันทีหลังยืนยันการชำระเงิน</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex size-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                    <IconCheck size={12} />
                  </div>
                  <span>
                    เชื่อมต่อกล้องมือถือสแกนบาร์โค้ดเพื่อตัดรอบและจัดเตรียมของ
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionContainer>
  )
}
