'use client'

import React from 'react'

import {
  IconCheck,
  IconCpu,
  IconDeviceDesktop,
  IconPrinter,
  IconQrcode,
  IconScan,
  IconShieldCheck,
  IconWallet,
} from '@tabler/icons-react'

const HARDWARE_ITEMS = [
  {
    title: 'เครื่องพิมพ์ใบเสร็จความร้อน (Thermal Printer)',
    badge: 'รองรับ 58mm & 80mm',
    icon: <IconPrinter size={26} className="text-primary" />,
    description:
      'พิมพ์ใบเสร็จ ออกบิลหน้าร้าน และพิมพ์ใบส่งของได้อย่างรวดเร็ว ไม่ต้องเติมหมึก รองรับกระดาษความร้อนมาตรฐานทุกยี่ห้อ',
    specs: [
      'เชื่อมต่อผ่าน USB, Bluetooth, Wi-Fi หรือ LAN',
      'รองรับคำสั่งมาตรฐาน ESC/POS สากล',
      'ตัดกระดาษอัตโนมัติ (Auto-Cutter)',
      'ยี่ห้อที่รองรับ: Epson, Xprinter, Rongta, Sunmi, Star Micronics',
    ],
  },
  {
    title: 'เครื่องสแกนบาร์โค้ด & QR Code (Barcode Scanner)',
    badge: 'รองรับ 1D & 2D',
    icon: <IconScan size={26} className="text-amber-500" />,
    description:
      'ยิงค้นหาสินค้าและคิดเงินได้ในเสี้ยววินาที ลดความผิดพลาดและประหยัดเวลาการทำงานของแคชเชียร์',
    specs: [
      'เชื่อมต่อแบบ Plug & Play ผ่านสาย USB หรือไร้สาย Wireless/Bluetooth',
      'อ่านบาร์โค้ดแท่ง (1D) และ QR Code (2D) บนกล่องหรือจอมือถือ',
      'โหมดสแกนอัตโนมัติเมื่อนำสินค้ามาผ่านหน้าเซนเซอร์',
      'ใช้งานร่วมกับกล้องแท็บเล็ตและสมาร์ทโฟนได้โดยตรง',
    ],
  },
  {
    title: 'ลิ้นชักเก็บเงินไฟฟ้า (Electronic Cash Drawer)',
    badge: 'พอร์ต RJ11',
    icon: <IconWallet size={26} className="text-emerald-500" />,
    description:
      'ควบคุมความปลอดภัยของเงินสดหน้าร้าน ลิ้นชักจะเด้งเปิดอัตโนมัติเฉพาะเมื่อมีการกดรับเงินสดและพิมพ์บิล',
    specs: [
      'เชื่อมต่อผ่านสาย RJ11 เข้ากับเครื่องพิมพ์ใบเสร็จ',
      'สั่งเปิดอัตโนมัติเมื่อปิดการขาย หรือเปิดด้วยกุญแจไขฉุกเฉิน',
      'มีช่องใส่ธนบัตร 4-5 ช่อง และช่องใส่เหรียญแยกเป็นสัดส่วน',
      'โครงสร้างเหล็กหนาแข็งแรง ปลอดภัยตามมาตรฐานสากล',
    ],
  },
  {
    title: 'จอแสดงผลลูกค้า & จอที่สอง (Customer Display)',
    badge: 'Dual Screen & QR',
    icon: <IconDeviceDesktop size={26} className="text-blue-500" />,
    description:
      'แสดงรายการสินค้าที่กำลังสแกน ยอดเงินรวม และสร้าง QR Code PromptPay ให้ลูกค้าใช้มือถือสแกนจ่ายได้สะดวก',
    specs: [
      'รองรับระบบ Dual-Screen (จอคู่แคชเชียร์ + จอลูกค้า)',
      'แสดง Dynamic PromptPay QR Code ตามยอดเงินสุทธิอัตโนมัติ',
      'รองรับจอแสดงผลตัวเลข VFD / LED Line Display',
      'แสดงภาพโฆษณาโปรโมชันร้านค้าเมื่อไม่มีการใช้งาน',
    ],
  },
]

export function HardwareCompatibilitySection() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="text-primary text-xs font-semibold">
          อุปกรณ์ที่รองรับ
        </span>
        <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          รองรับอุปกรณ์หน้าร้านมาตรฐานแบบ Plug & Play
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          ไม่ต้องเปลี่ยนอุปกรณ์เดิมที่คุณมี Sitepow POS
          ออกแบบมาให้ทำงานร่วมกับเครื่องพิมพ์ สแกนเนอร์
          และลิ้นชักเก็บเงินมาตรฐานได้ทันที
        </p>
      </div>

      {/* 4 Hardware Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {HARDWARE_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="border-border/80 bg-card/60 hover:border-border relative flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-7"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-2xs">
                  {item.icon}
                </div>
                <span className="bg-primary/10 text-primary rounded-full px-3 py-0.5 text-xs font-semibold">
                  {item.badge}
                </span>
              </div>

              <div className="pt-4">
                <h3 className="text-foreground text-lg font-bold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground pt-2 text-xs leading-relaxed sm:text-sm">
                  {item.description}
                </p>
              </div>

              <div className="border-border/60 my-5 border-t" />

              {/* Specs */}
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {item.specs.map((spec, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2.5">
                    <div
                      className="mt-0.5 shrink-0 text-emerald-500"
                      aria-hidden="true"
                    >
                      <IconCheck size={15} strokeWidth={2.5} />
                    </div>
                    <span className="text-foreground/90 leading-snug">
                      {spec}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
