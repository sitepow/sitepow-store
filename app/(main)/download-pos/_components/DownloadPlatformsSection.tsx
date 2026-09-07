'use client'

import React from 'react'

import Link from 'next/link'

import {
  IconBrandAndroid,
  IconBrandApple,
  IconBrandWindows,
  IconCheck,
  IconDeviceIpad,
  IconDownload,
  IconExternalLink,
  IconSparkles,
  IconWorld,
} from '@tabler/icons-react'

import { BorderBeam } from '@/components/magicui/border-beam'
import { Button } from '@/components/ui/button'

interface PlatformItem {
  id: string
  name: string
  badge: string
  version: string
  size: string
  requirements: string
  icon: React.ReactNode
  description: string
  features: string[]
  isFeatured?: boolean
  downloads: {
    label: string
    href: string
    isPrimary?: boolean
    icon?: React.ReactNode
  }[]
}

const PLATFORMS: PlatformItem[] = [
  {
    id: 'windows',
    name: 'Windows Desktop',
    badge: 'เครื่อง POS & PC แคชเชียร์',
    version: 'v2.4.0 (Latest)',
    size: '85 MB',
    requirements: 'Windows 10 / 11 (64-bit)',
    icon: <IconBrandWindows size={32} className="text-blue-500" />,
    description:
      'เหมาะที่สุดสำหรับเครื่อง POS หน้าร้านและคอมพิวเตอร์แคชเชียร์ รองรับอุปกรณ์ต่อพ่วงเต็มรูปแบบ',
    isFeatured: true,
    features: [
      'เชื่อมต่อเครื่องพิมพ์ใบเสร็จความร้อน USB และ LAN ตรง',
      'สั่งเปิดลิ้นชักเก็บเงิน RJ11 อัตโนมัติเมื่อพิมพ์บิล',
      'รองรับเครื่องสแกนบาร์โค้ด USB/ไร้สาย 1D/2D',
      'ทำงานแบบ Low-Latency เปิดบิลได้รวดเร็วต่อเนื่อง',
    ],
    downloads: [
      {
        label: 'ดาวน์โหลด Windows Installer (.exe)',
        href: '#',
        isPrimary: true,
        icon: <IconDownload size={16} />,
      },
      {
        label: 'ดาวน์โหลด Portable (.zip)',
        href: '#',
        isPrimary: false,
        icon: <IconDownload size={16} />,
      },
    ],
  },
  {
    id: 'android',
    name: 'Android App & Tablet',
    badge: 'เครื่องพกพา & แท็บเล็ต',
    version: 'v2.4.0',
    size: '45 MB',
    requirements: 'Android 8.0 ขึ้นไป',
    icon: <IconBrandAndroid size={32} className="text-emerald-500" />,
    description:
      'รองรับแท็บเล็ตหน้าร้าน, สมาร์ทโฟนพนักงาน และเครื่อง POS แบบพกพา (เช่น Sunmi, iMin)',
    features: [
      'รองรับเครื่อง POS Android ที่มีเครื่องพิมพ์ในตัว',
      'ใช้กล้องสมาร์ทโฟนยิงบาร์โค้ดสินค้าได้ทันที',
      'เชื่อมต่อเครื่องพิมพ์ใบเสร็จ Bluetooth หน้าร้าน',
      'พกพาง่าย เปิดบิลนอกสถานที่หรือออกบูธได้สะดวก',
    ],
    downloads: [
      {
        label: 'ดาวน์โหลดไฟล์ APK (.apk)',
        href: '#',
        isPrimary: true,
        icon: <IconDownload size={16} />,
      },
      {
        label: 'Google Play Store',
        href: '#',
        isPrimary: false,
        icon: <IconExternalLink size={16} />,
      },
    ],
  },
  {
    id: 'ios',
    name: 'iPadOS & iOS',
    badge: 'iPad POS หน้าร้าน',
    version: 'v2.4.0',
    size: '38 MB',
    requirements: 'iPadOS / iOS 15.0 ขึ้นไป',
    icon: <IconDeviceIpad size={32} className="text-indigo-500" />,
    description:
      'เปลี่ยน iPad หรือ iPhone เป็นเคาน์เตอร์แคชเชียร์ดีไซน์มินิมอล ทันสมัย ลื่นไหล และประหยัดพื้นที่',
    features: [
      'รองรับพิมพ์ใบเสร็จผ่าน AirPrint & Wi-Fi',
      'เชื่อมต่อเครื่องพิมพ์ Bluetooth มาตรฐาน ESC/POS',
      'ระบบสัมผัส Multi-Touch ใช้งานง่าย พนักงานเรียนรู้ไว',
      'รองรับระบบ Progressive Web App (PWA)',
    ],
    downloads: [
      {
        label: 'Apple App Store',
        href: '#',
        isPrimary: true,
        icon: <IconExternalLink size={16} />,
      },
      {
        label: 'เปิดใช้งานผ่าน PWA',
        href: '/merchant/pos',
        isPrimary: false,
        icon: <IconWorld size={16} />,
      },
    ],
  },
  {
    id: 'macos',
    name: 'macOS Desktop',
    badge: 'Mac & MacBook',
    version: 'v2.4.0',
    size: '92 MB',
    requirements: 'macOS 12.0+ (Apple Silicon & Intel)',
    icon: <IconBrandApple size={32} className="text-foreground" />,
    description:
      'สำหรับเจ้าของร้านและผู้จัดการที่ใช้ Mac ในการคุมหน้าร้านและเปิดบิลได้อย่างราบรื่น',
    features: [
      'Universal Binary รองรับชิป M1/M2/M3 และ Intel',
      'เชื่อมต่อเครื่องพิมพ์ใบเสร็จผ่านระบบเครือข่าย LAN/Wi-Fi',
      'รองรับ Dark Mode สวยงามเข้ากับตัวระบบปฏิบัติการ',
      'เปิดบิล จัดการสต็อก และดูสรุปกะสิ้นวันได้ทันที',
    ],
    downloads: [
      {
        label: 'ดาวน์โหลด macOS Installer (.dmg)',
        href: '#',
        isPrimary: true,
        icon: <IconDownload size={16} />,
      },
    ],
  },
]

export function DownloadPlatformsSection() {
  return (
    <section
      id="platforms"
      className="mx-auto w-full max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8"
    >
      {/* Section Header */}
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="text-primary text-xs font-semibold">
          รองรับหลากหลายแพลตฟอร์ม
        </span>
        <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          เลือกระบบปฏิบัติการที่ร้านค้าของคุณใช้งาน
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          ดาวน์โหลดและติดตั้งได้ฟรี
          ทุกเวอร์ชันเชื่อมต่อกับฐานข้อมูลร้านค้าเดียวกัน ซิงก์สินค้าและสต็อก
          Real-time
        </p>
      </div>

      {/* 4 Platforms Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLATFORMS.map((platform) => (
          <div
            key={platform.id}
            className={`relative flex flex-col justify-between rounded-3xl p-5 transition-all duration-300 sm:p-6 ${
              platform.isFeatured
                ? 'border-primary bg-card/90 ring-primary/20 border-2 shadow-xl ring-1 lg:-translate-y-2'
                : 'border-border/80 bg-card/60 hover:border-border border hover:shadow-md'
            }`}
          >
            {platform.isFeatured && (
              <>
                <div className="bg-primary text-primary-foreground absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold shadow-sm">
                  แนะนำสำหรับหน้าร้าน
                </div>
                <BorderBeam
                  size={140}
                  duration={8}
                  colorFrom="#f97316"
                  colorTo="#3b82f6"
                  borderWidth={2}
                />
              </>
            )}

            <div>
              {/* Platform Header */}
              <div className="flex items-start justify-between">
                <div className="bg-muted/80 flex size-12 items-center justify-center rounded-2xl shadow-2xs">
                  {platform.icon}
                </div>
                <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                  {platform.badge}
                </span>
              </div>

              <div className="pt-4">
                <h3 className="text-foreground text-lg font-bold">
                  {platform.name}
                </h3>
                <div className="text-muted-foreground flex items-center gap-2 pt-1 text-[11px]">
                  <span>{platform.version}</span>
                  <span>•</span>
                  <span>{platform.size}</span>
                </div>
                <p className="text-muted-foreground min-h-[48px] pt-2.5 text-xs leading-relaxed">
                  {platform.description}
                </p>
              </div>

              <div className="border-border/60 my-5 border-t" />

              {/* Features list */}
              <ul className="space-y-2.5 text-xs">
                {platform.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div
                      className="text-primary mt-0.5 shrink-0"
                      aria-hidden="true"
                    >
                      <IconCheck size={14} />
                    </div>
                    <span className="text-foreground/90 leading-snug">
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Downloads Buttons */}
            <div className="space-y-2 pt-6">
              {platform.downloads.map((btn, bIdx) => (
                <Button
                  key={bIdx}
                  asChild
                  variant={btn.isPrimary ? 'default' : 'outline'}
                  className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <Link href={btn.href}>
                    {btn.icon}
                    <span>{btn.label}</span>
                  </Link>
                </Button>
              ))}
              <div className="text-muted-foreground pt-1 text-center text-[10px]">
                ความต้องการระบบ: {platform.requirements}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Web Cloud POS Banner */}
      <div className="bg-primary/5 border-primary/20 relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl border p-6 sm:p-8 md:flex-row">
        <div className="space-y-2 text-center md:text-left">
          <div className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold">
            <IconSparkles size={14} />
            <span>ไม่ต้องติดตั้งโปรแกรม</span>
          </div>
          <h3 className="text-foreground text-xl font-bold sm:text-2xl">
            หรือเปิดใช้งานผ่าน Web Cloud POS ได้ทันที ทุกที่ ทุกเวลา
          </h3>
          <p className="text-muted-foreground max-w-2xl text-xs sm:text-sm">
            สามารถเข้าใช้งานระบบคิดเงิน POS ผ่าน Google Chrome, Apple Safari
            หรือ Microsoft Edge บนอุปกรณ์ใดก็ได้ทันที
            ข้อมูลทุกอย่างเชื่อมโยงกับระบบหลังบ้านแบบ Real-time
          </p>
        </div>
        <Button
          size="lg"
          asChild
          className="shadow-primary/20 h-11 w-full shrink-0 cursor-pointer px-6 text-sm font-semibold shadow-md sm:w-auto"
        >
          <Link
            href="/merchant/pos"
            target="_blank"
            className="flex items-center justify-center gap-2"
          >
            <IconWorld size={18} />
            <span>เปิด Web POS หน้าร้าน</span>
          </Link>
        </Button>
      </div>
    </section>
  )
}
