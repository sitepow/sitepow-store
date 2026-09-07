'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLine,
  IconBrandMessenger,
  IconExternalLink,
  IconHeadset,
  IconShieldCheck,
} from '@tabler/icons-react'

import { LogoBrand } from '@/components/LogoBrand'
import { QuickSettingsMenu } from '@/components/QuickSettingsMenu'

interface FooterLink {
  label: string
  href: string
  badge?: string
  highlight?: boolean
  external?: boolean
}

interface FooterColumn {
  title: string
  links: FooterLink[]
}

export function Footer() {
  const t = useTranslations('common.footer')
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      icon: <IconBrandFacebook className="size-4.5" />,
      href: 'https://web.facebook.com/profile.php?id=61584675643468',
      label: 'Facebook',
    },
    {
      icon: <IconBrandMessenger className="size-4.5" />,
      href: 'https://m.me/61584675643468',
      label: 'Messenger',
    },
    {
      icon: <IconBrandLine className="size-4.5" />,
      href: 'https://line.me/ti/p/~@830sdfow',
      label: 'LINE Official',
    },
    {
      icon: <IconBrandInstagram className="size-4.5" />,
      href: 'https://www.instagram.com/sitepow.store',
      label: 'Instagram',
    },
  ]

  const footerNav: FooterColumn[] = [
    {
      title: 'ฟังก์ชันระบบ',
      links: [
        { label: 'ระบบ POS หน้าร้าน', href: '/features/pos', badge: 'ยอดนิยม' },
        {
          label: 'AI จัดการร้าน & ตรวจสลิป',
          href: '/features/ai',
          badge: 'AI',
        },
        {
          label: 'คลังสินค้า & ตัดสต็อก Real-time',
          href: '/features/inventory',
        },
        { label: 'หน้าร้านค้าออนไลน์ส่วนตัว', href: '/features/online-store' },
        { label: 'ระบบสมาชิก CRM & พ้อยท์', href: '/features/crm' },
        {
          label: 'รวมฟังก์ชันทั้งหมด 12 ระบบ',
          href: '/features',
          highlight: true,
        },
      ],
    },
    {
      title: 'ดาวน์โหลด & แอป',
      links: [
        { label: 'Windows POS Desktop', href: '/download-pos', badge: 'v2.4' },
        { label: 'Android & Mobile POS', href: '/download-pos' },
        { label: 'iPadOS & iOS App', href: '/download-pos' },
        { label: 'macOS Application', href: '/download-pos' },
        { label: 'Cloud Web POS (ไม่ต้องลงแอป)', href: '/download-pos' },
        { label: 'ตรวจสอบอุปกรณ์ฮาร์ดแวร์', href: '/download-pos' },
      ],
    },
    {
      title: 'ราคา & โซลูชัน',
      links: [
        { label: 'แพ็กเกจและราคา', href: '/pricing' },
        { label: 'ขายฟรี 0% GP ตลอดชีพ', href: '/pricing', badge: 'ฟรี' },
        { label: 'ส่วนลดรายปีสูงสุด 25%', href: '/pricing' },
        { label: 'ตารางเปรียบเทียบฟังก์ชัน', href: '/pricing' },
        { label: 'คำนวณกำไรและความคุ้มค่า', href: '/pricing' },
        { label: 'โซลูชันสำหรับธุรกิจองค์กร', href: '/contact' },
      ],
    },
    {
      title: 'ช่วยเหลือ & บริษัท',
      links: [
        { label: 'ศูนย์ช่วยเหลือ & ติดต่อเรา', href: '/contact' },
        {
          label: 'LINE OA: @830sdfow',
          href: 'https://line.me/ti/p/~@830sdfow',
          external: true,
        },
        { label: 'คำถามที่พบบ่อย (FAQ)', href: '/#faq' },
        { label: 'เงื่อนไขและข้อตกลง', href: '/contact' },
        { label: 'นโยบายความเป็นส่วนตัว', href: '/contact' },
        { label: 'มาตรฐานความปลอดภัยระบบ', href: '/contact' },
      ],
    },
  ]

  return (
    <footer className="border-border/40 bg-background text-foreground border-t transition-colors">
      <div className="container mx-auto px-6 py-14 sm:px-10 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 lg:gap-8">
          <div className="flex flex-col justify-between sm:col-span-2 md:col-span-4 lg:col-span-2">
            <div className="space-y-4">
              <LogoBrand />
              <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                ระบบจัดการร้านค้าและ POS อัจฉริยะสำหรับธุรกิจยุคใหม่
                เชื่อมต่อหน้าร้านและออนไลน์แบบ Omnichannel ขายฟรี 0% GP พร้อม AI
                ตรวจสอบสลิปและตัดสต็อกอัตโนมัติ
              </p>

              <div className="border-border/60 bg-muted/40 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="font-medium">
                  ระบบทำงานปกติ (99.99% Uptime)
                </span>
              </div>

              <div className="text-muted-foreground flex items-center gap-2 pt-1 text-xs">
                <IconHeadset className="text-primary size-4" />
                <span>ทีมงานพร้อมช่วยเหลือ 09:00 - 24:00 น. ทุกวัน</span>
              </div>
            </div>

            <div className="pt-6">
              <p className="text-muted-foreground mb-3 text-xs font-medium">
                ติดตามข่าวสารและอัปเดต
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground flex size-9 items-center justify-center rounded-xl border transition-all hover:shadow-xs"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {footerNav.map((col, idx) => (
            <div key={idx} className="flex flex-col space-y-3.5">
              <h3 className="text-foreground text-sm font-semibold">
                {col.title}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link, linkIdx) => {
                  const isExternal = 'external' in link && link.external
                  const linkClass = `group inline-flex items-center gap-1.5 transition-colors ${
                    'highlight' in link && link.highlight
                      ? 'text-primary font-medium hover:underline'
                      : 'text-muted-foreground hover:text-foreground'
                  }`

                  return (
                    <li key={linkIdx}>
                      {isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkClass}
                        >
                          <span>{link.label}</span>
                          <IconExternalLink className="size-3 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      ) : (
                        <Link href={link.href} className={linkClass}>
                          <span>{link.label}</span>
                          {link.badge && (
                            <span className="border-primary/20 bg-primary/10 text-primary rounded-md border px-1.5 py-0.5 text-[10px] font-medium">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-border/40 mt-14 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <div className="text-muted-foreground flex flex-col items-center gap-2 text-xs sm:flex-row sm:gap-4">
            <p>
              © {currentYear} Sitepow Co., Ltd.{' '}
              <span>{t.raw('rights') as string}</span>
            </p>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <IconShieldCheck className="text-primary size-4" />
              <span>SSL 256-bit ปลอดภัย 100%</span>
            </div>
            <QuickSettingsMenu buttonVariant="ghost" />
          </div>
        </div>
      </div>
    </footer>
  )
}
