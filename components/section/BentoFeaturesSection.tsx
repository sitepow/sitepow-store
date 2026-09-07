'use client'

import React from 'react'

import {
  IconBoxSeam,
  IconBuildingStore,
  IconCreditCard,
  IconFlame,
  IconKey,
  IconPrinter,
  IconQrcode,
  IconSparkles,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react'

import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid'
import { BorderBeam } from '@/components/magicui/border-beam'

import { SectionContainer } from '../SectionContainer'
import { SectionHeader } from '../SectionHeader'

export function BentoFeaturesSection() {
  return (
    <SectionContainer className="gap-12 py-16">
      <SectionHeader
        title="ฟีเจอร์ระดับซอฟต์แวร์ Enterprise ครบจบในระบบเดียว"
        description="เราผสานระบบหน้าร้าน POS, ระบบคลังสินค้า, ระบบชำระเงิน และปัญญาประดิษฐ์ AI เพื่อให้คุณบริหารธุรกิจได้อย่างราบรื่นและขยายยอดขายได้ไร้ขีดจำกัด"
      />

      <BentoGrid className="auto-rows-[20rem] lg:auto-rows-[22rem]">
        {/* 1. POS Omnichannel (Col span 2) */}
        <BentoCard
          name="ระบบขายหน้าร้าน POS เชื่อมต่อออนไลน์ 100%"
          className="col-span-1 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white md:col-span-2 lg:col-span-2"
          Icon={IconBuildingStore}
          description="ไม่ว่าคุณจะขายผ่านหน้าร้านจริงหรือเว็บออนไลน์ สต็อกจะตัดพร้อมกันทันที ไม่ต้องกังวลเรื่องของไม่ตรงยอด พร้อมพิมพ์ใบเสร็จและออกบิลได้อย่างมืออาชีพ"
          href="/pricing"
          cta="ดูรายละเอียดแพ็กเกจ POS"
          background={
            <div className="absolute top-4 right-4 h-full w-1/2 opacity-20 transition-opacity duration-300 group-hover:opacity-30">
              <div className="flex flex-col gap-2 p-4">
                <div className="bg-primary/30 text-primary-foreground flex items-center gap-2 rounded-lg p-2 text-xs">
                  <IconQrcode size={16} />
                  <span>PromptPay QR Generated</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/20 p-2 text-xs text-emerald-300">
                  <IconTrendingUp size={16} />
                  <span>Stock Sync: Real-time</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2 text-xs text-slate-300">
                  <IconPrinter size={16} />
                  <span>Thermal Receipt Ready</span>
                </div>
              </div>
            </div>
          }
        />

        {/* 2. AI Smart Features (Col span 1) */}
        <BentoCard
          name="AI อัจฉริยะช่วยลงของ & ตรวจสลิป"
          className="col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 text-white"
          Icon={IconSparkles}
          description="อัปโหลดรูปสินค้า AI จะเขียนแคปชันและรายละเอียดให้น่าซื้อทันที พร้อมระบบสแกนสลิปโอนเงิน ป้องกันสลิปปลอมหรือสลิปใช้ซ้ำได้ 100%"
          href="/pricing"
          cta="ทดลองระบบ AI"
          background={
            <div className="absolute -top-8 -right-8 size-48 rounded-full bg-amber-500/10 blur-2xl transition-all duration-300 group-hover:bg-amber-500/20" />
          }
        />

        {/* 3. 0% GP (Col span 1) */}
        <BentoCard
          name="ขายฟรี 0% GP ไม่มีหักส่วนแบ่ง"
          className="col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 text-white"
          Icon={IconFlame}
          description="รับกำไรเต็มเม็ดเต็มหน่วย ไม่มีค่าคอมมิชชั่นต่อชิ้น ลูกค้าชำระเงินตรงเข้าบัญชีร้านค้าของคุณทันที ไม่ต้องรอรอบโอนเงินข้ามสัปดาห์"
          href="/register"
          cta="เปิดร้าน 0% GP ทันที"
          background={
            <div className="group-hover:text-primary/[0.1] absolute right-4 bottom-2 text-7xl font-black text-white/[0.04] transition-colors">
              0%
            </div>
          }
        />

        {/* 4. Multi-branch Inventory (Col span 1) */}
        <BentoCard
          name="คลังสินค้า & สต็อกแยกสาขา"
          className="col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 text-white"
          Icon={IconBoxSeam}
          description="ควบคุมสต็อกสินค้าได้หลายสาขาหรือคลังสินค้าแยกกัน มีระบบแจ้งเตือนเมื่อสินค้าใกล้หมด และโอนย้ายสต็อกระหว่างสาขาได้แม่นยำ"
          href="/pricing"
          cta="ดูระบบสต็อกสินค้า"
          background={
            <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-blue-500/10 blur-2xl" />
          }
        />

        {/* 5. Product Types (Col span 1) */}
        <BentoCard
          name="รองรับทั้ง Physical & Digital"
          className="col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 text-white"
          Icon={IconKey}
          description="ขายได้ทั้งสินค้าจับต้องได้, คีย์เติมเงิน/เกมแบบสุ่มจ่ายอัตโนมัติ, ลิงก์ดาวน์โหลดไฟล์งาน, และบริการ API Webhook หลังบ้าน"
          href="/pricing"
          cta="ดูโมเดลสินค้าที่รองรับ"
          background={
            <div className="absolute -top-10 -right-10 size-40 rounded-full bg-purple-500/10 blur-2xl" />
          }
        />

        {/* 6. CRM & Marketing (Col span 3) */}
        <BentoCard
          name="ระบบสมาชิก CRM, คูปองส่วนลด & ตัวแทนจำหน่าย"
          className="col-span-1 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white md:col-span-2 lg:col-span-3"
          Icon={IconUsers}
          description="สร้างฐานลูกค้าประจำด้วยระบบสะสมแต้ม, คูปองส่วนลดแบบ Flash Sale, โปรโมชั่นซื้อ 1 แถม 1 และระบบตัวแทนจำหน่าย (Reseller) พร้อมแดชบอร์ดสรุปยอดขาย ช่วยเปลี่ยนผู้ซื้อครั้งแรกให้กลายเป็นลูกค้าประจำของคุณ"
          href="/pricing"
          cta="เริ่มต้นสร้างฐานลูกค้า"
          background={
            <div className="bg-primary/10 group-hover:bg-primary/20 absolute -right-10 -bottom-10 size-64 rounded-full blur-3xl transition-all duration-300" />
          }
        />
      </BentoGrid>
    </SectionContainer>
  )
}
