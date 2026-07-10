import Image from 'next/image'
import Link from 'next/link'

import { LogoBrand } from '../LogoBrand'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/meta/default.svg"
          alt="Meta"
          width={24}
          height={24}
        />
      ),
      href: '/',
      label: 'Facebook',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/instagram/default.svg"
          alt="Instagram"
          width={24}
          height={24}
        />
      ),
      href: '/',
      label: 'Instagram',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/tiktok/default.svg"
          alt="Tiktok"
          width={24}
          height={24}
        />
      ),
      href: '/',
      label: 'Tiktok',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/messenger/default.svg"
          alt="Messenger"
          width={24}
          height={24}
        />
      ),
      href: '/',
      label: 'Messenger',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/line/default.svg"
          alt="Line"
          width={24}
          height={24}
        />
      ),
      href: '/',
      label: 'Line',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/discord/default.svg"
          alt="Discord"
          width={24}
          height={24}
        />
      ),
      href: '/',
      label: 'Discord',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/shopee/default.svg"
          alt="Shopee"
          width={24}
          height={24}
        />
      ),
      href: '/',
      label: 'Shopee',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/ebay/default.svg"
          alt="Shopee"
          width={24}
          height={24}
        />
      ),
      href: '/',
      label: 'Ebay',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/amazon/default.svg"
          alt="Shopee"
          width={24}
          height={24}
        />
      ),
      href: '/',
      label: 'Amazon',
    },
  ]

  return (
    <footer className="bg-background border-border text-foreground border-t">
      <div className="container mx-auto px-5 py-12 sm:px-10">
        <div className="flex flex-col gap-10 md:flex-row">
          <div className="max-w-sm">
            <LogoBrand />
            <p className="mt-4 text-sm leading-relaxed opacity-60">
              สร้างสรรค์ประสบการณ์ดิจิทัลที่ดีที่สุดสำหรับคุณ
              เชื่อมต่อทุกความเป็นไปได้ด้วยเทคโนโลยีที่ทันสมัย
            </p>
            <p className="mt-4 text-sm leading-relaxed opacity-60">
              อีเมล: {'-'} เลขประจำตัวผู้เสียภาษี: {'-'}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-border mt-12 flex flex-col items-center justify-between gap-2.5 border-t pt-8 opacity-60 md:flex-row">
          <div className="order-2 md:order-1">
            <p className="text-sm">
              © {currentYear} Sitepow. All rights reserved.
            </p>
          </div>
          <div className="order-1 flex flex-col items-center gap-6 md:order-2 md:flex-row md:gap-8">
            <div className="flex flex-wrap justify-center gap-5 text-sm sm:gap-6">
              <Link href="/" className="hover:underline">
                นโยบายความเป็นส่วนตัว
              </Link>
              <Link href="/" className="hover:underline">
                ข้อตกลง และเงื่อนไข
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
