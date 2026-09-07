'use client'

import Image from 'next/image'
import Link from 'next/link'

import {
  IconExternalLink,
  IconMail,
  IconMessageDots,
} from '@tabler/icons-react'

import { BorderBeam } from '@/components/magicui/border-beam'
import { Button } from '@/components/ui/button'

const CHANNELS = [
  {
    id: 'line',
    title: 'LINE Official Account',
    account: '@830sdfow',
    badge: 'แนะนำ • ตอบไวที่สุด',
    description:
      'แอดเพื่อนเพื่อสอบถามทีมงานได้ทันที ปรึกษาการใช้งานระบบ POS หรือแจ้งปัญหาการใช้งาน',
    icon: (
      <Image
        src="https://thesvg.org/icons/line/default.svg"
        alt="Line"
        width={28}
        height={28}
      />
    ),
    href: 'https://line.me/ti/p/~@830sdfow',
    buttonLabel: 'แอด LINE @830sdfow',
    isPrimary: true,
  },
  {
    id: 'messenger',
    title: 'Facebook Messenger',
    account: 'Sitepow Store',
    badge: 'Facebook Page',
    description:
      'ทัก Inbox แฟนเพจอย่างเป็นทางการ ปรึกษาเรื่องการเปิดร้าน และติดตามข่าวสารอัปเดตระบบ',
    icon: (
      <Image
        src="https://thesvg.org/icons/messenger/default.svg"
        alt="Messenger"
        width={28}
        height={28}
      />
    ),
    href: 'https://m.me/61584675643468',
    buttonLabel: 'ทักแชท Messenger',
    isPrimary: false,
  },
  {
    id: 'chat',
    title: 'Live Chat Support',
    account: 'ระบบแชทสดในระบบ',
    badge: 'แชทสดผ่านเว็บ',
    description:
      'พูดคุยกับทีมงานและ AI ผู้ช่วย ผ่านกล่องข้อความช่วยเหลือที่มุมขวาล่างของหน้าจอได้ทันที',
    icon: <IconMessageDots size={28} className="text-violet-500" />,
    href: '#chat-widget',
    buttonLabel: 'เปิด Live Chat',
    isPrimary: false,
    onClick: () => {
      const btn = document.querySelector<HTMLButtonElement>(
        '[aria-label="support"], [aria-label="chat"]',
      )
      if (btn) btn.click()
    },
  },
  {
    id: 'email',
    title: 'Email & Enterprise',
    account: 'support@sitepow.store',
    badge: 'สำหรับธุรกิจองค์กร',
    description:
      'สอบถามข้อมูลเชิงลึก ขอใบเสนอราคาแพ็กเกจ Enterprise หรือติดต่อความร่วมมือทางธุรกิจ',
    icon: <IconMail size={28} className="text-amber-500" />,
    href: 'mailto:support@sitepow.store',
    buttonLabel: 'ส่งอีเมลหาเรา',
    isPrimary: false,
  },
]

export function ContactChannelsSection() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="text-primary text-xs font-semibold">
          ช่องทางติดต่อด่วน
        </span>
        <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          ช่องทางการติดต่อด่วน
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          เลือกช่องทางที่คุณสะดวกที่สุด
          ทีมงานของเราพร้อมให้บริการและตอบกลับอย่างรวดเร็ว
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {CHANNELS.map((ch) => (
          <div
            key={ch.id}
            className={`relative flex flex-col justify-between rounded-3xl p-5 transition-all duration-300 sm:p-6 ${
              ch.isPrimary
                ? 'border-primary bg-card/90 ring-primary/20 border-2 shadow-xl ring-1 lg:-translate-y-2'
                : 'border-border/80 bg-card/60 hover:border-border border hover:shadow-md'
            }`}
          >
            {ch.isPrimary && (
              <>
                <div className="bg-primary text-primary-foreground absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold shadow-sm">
                  {ch.badge}
                </div>
                <BorderBeam
                  size={140}
                  duration={8}
                  colorFrom="#22c55e"
                  colorTo="#3b82f6"
                  borderWidth={2}
                />
              </>
            )}

            <div>
              <div className="flex items-start justify-between">
                <div className="bg-muted flex size-12 items-center justify-center rounded-2xl shadow-2xs">
                  {ch.icon}
                </div>
                {!ch.isPrimary && (
                  <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                    {ch.badge}
                  </span>
                )}
              </div>

              <div className="pt-4">
                <h3 className="text-foreground text-lg font-bold">
                  {ch.title}
                </h3>
                <div className="text-primary pt-0.5 text-xs font-semibold">
                  {ch.account}
                </div>
                <p className="text-muted-foreground min-h-12 pt-2.5 text-xs leading-relaxed">
                  {ch.description}
                </p>
              </div>
            </div>

            <div className="pt-6">
              {ch.onClick ? (
                <Button
                  onClick={ch.onClick}
                  variant={ch.isPrimary ? 'default' : 'outline'}
                  className="flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <span>{ch.buttonLabel}</span>
                  <IconExternalLink size={14} />
                </Button>
              ) : (
                <Button
                  asChild
                  variant={ch.isPrimary ? 'default' : 'outline'}
                  className="flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <Link
                    href={ch.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{ch.buttonLabel}</span>
                    <IconExternalLink size={14} />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
