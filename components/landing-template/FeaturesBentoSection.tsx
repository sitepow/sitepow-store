'use client'

import Link from 'next/link'

import {
  IconBoxSeam,
  IconBuildingStore,
  IconCoins,
  IconKey,
  IconRobot,
  IconUsers,
} from '@tabler/icons-react'

import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid'
import { Button } from '@/components/ui/button'

export function FeaturesBentoSection() {
  return (
    <section
      id="features"
      className="bg-muted/40 border-border/40 relative w-full border-y py-16 md:py-24"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4 pb-6 text-center">
          <h2 className="text-primary text-sm font-semibold">
            ฟังก์ชันและระบบ
          </h2>
          <h3 className="text-foreground text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
            ฟีเจอร์ระดับมืออาชีพที่สร้างมาเพื่อคุณ
          </h3>
          <p className="text-muted-foreground text-base sm:text-lg">
            ออกแบบทุกจุดให้รองรับการเติบโตของร้านค้า
            ตั้งแต่วันแรกที่เริ่มขายจนถึงธุรกิจขนาดใหญ่ที่มีหลายสาขา
          </p>
        </div>

        <div className="mt-14">
          <BentoGrid className="auto-rows-auto sm:auto-rows-80 lg:auto-rows-88">
            <BentoCard
              name="ระบบขายหน้าร้าน POS & ออนไลน์"
              className="col-span-1 md:col-span-2 lg:col-span-2"
              Icon={IconBuildingStore}
              description="รวมยอดขายจากทุกช่องทางเข้าด้วยกัน สต็อกตัดอัตโนมัติแบบ Real-time พร้อมออกบิลและพิมพ์ใบเสร็จความร้อนได้ทันที"
              href="/features/pos"
              cta="ดูฟังก์ชัน POS ทั้งหมด"
              background={
                <div className="bg-primary/10 absolute -top-10 -right-10 size-48 rounded-full blur-2xl" />
              }
            />

            <BentoCard
              name="AI ลงสินค้า & ตรวจสลิปอัตโนมัติ"
              className="col-span-1"
              Icon={IconRobot}
              description="เขียนชื่อและแคปชันสินค้าด้วย AI พร้อมระบบตรวจสลิปโอนเงิน ดักจับสลิปปลอมหรือสลิปใช้ซ้ำได้ 100%"
              href="/features/ai"
              cta="ดูระบบ AI"
              background={
                <div className="absolute -top-8 -right-8 size-48 rounded-full bg-amber-500/10 blur-2xl" />
              }
            />

            <BentoCard
              name="ขายฟรี 0% GP ตลอดชีพ"
              className="col-span-1"
              Icon={IconCoins}
              description="ไม่มีการหักเปอร์เซ็นต์ค่าคอมมิชชั่นต่อชิ้น ลูกค้าโอนตรงเข้าบัญชีคุณทันที กำไรสุทธิเข้ากระเป๋าเต็ม 100%"
              href="/features/zero-gp"
              cta="ดูรายละเอียด 0% GP"
              background={
                <div className="text-foreground/4 absolute right-4 bottom-2 text-7xl font-black">
                  0%
                </div>
              }
            />

            <BentoCard
              name="คลังสินค้า & สต็อกหลายสาขา"
              className="col-span-1"
              Icon={IconBoxSeam}
              description="แยกคลังสินค้าตามสาขาได้ไม่จำกัด แจ้งเตือนสินค้าใกล้หมด และโอนย้ายสต็อกระหว่างสาขาได้แม่นยำ"
              href="/features/inventory"
              cta="จัดการคลังสินค้า"
              background={
                <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-blue-500/10 blur-2xl" />
              }
            />

            <BentoCard
              name="รองรับ Physical & Digital Keys"
              className="col-span-1"
              Icon={IconKey}
              description="ขายได้ทั้งสินค้าจัดส่งทั่วไป, คีย์เติมเงิน/เกมแบบสุ่มจ่ายอัตโนมัติ, ลิงก์ดาวน์โหลด และส่ง Webhook เชื่อมต่อ API หลังบ้าน"
              href="/features/online-store"
              cta="ดูระบบหน้าร้านและสินค้า"
              background={
                <div className="absolute -top-10 -right-10 size-40 rounded-full bg-purple-500/10 blur-2xl" />
              }
            />

            <BentoCard
              name="ระบบสมาชิก CRM, สะสมแต้ม & คูปองส่วนลด"
              className="col-span-1 md:col-span-2 lg:col-span-3"
              Icon={IconUsers}
              description="สร้างฐานลูกค้าประจำด้วยระบบสะสมคะแนน, โค้ดคูปองส่วนลด, Flash Sale, โปรโมชั่นซื้อ 1 แถม 1 และระบบตัวแทนจำหน่าย (Reseller) ให้ลูกค้ากลับมาซื้อซ้ำสร้างยอดขายยั่งยืน"
              href="/features/crm"
              cta="ดูระบบ CRM และคูปอง"
              background={
                <div className="bg-primary/10 absolute -right-10 -bottom-10 size-64 rounded-full blur-3xl" />
              }
            />
          </BentoGrid>
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-11 w-full gap-2 rounded-full px-6 text-sm font-semibold shadow-xs transition-all hover:shadow-md sm:w-auto"
          >
            <Link href="/features">
              <span>สำรวจฟังก์ชันทั้งหมด 12 รายการ</span>
              <IconBuildingStore className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
