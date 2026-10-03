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
          width={34}
          height={34}
        />
      ),
      href: 'https://web.facebook.com/profile.php?id=61584675643468',
      label: 'Facebook',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/instagram/default.svg"
          alt="Instagram"
          width={34}
          height={34}
        />
      ),
      href: 'https://www.instagram.com/sitepow.store',
      label: 'Instagram',
    },
    // {
    //   icon: (
    //     <Image
    //       src="https://thesvg.org/icons/tiktok/default.svg"
    //       alt="Tiktok"
    //       width={34}
    //       height={34}
    //     />
    //   ),
    //   href: '/',
    //   label: 'Tiktok',
    // },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/messenger/default.svg"
          alt="Messenger"
          width={34}
          height={34}
        />
      ),
      href: 'https://m.me/61584675643468',
      label: 'Messenger',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/line/default.svg"
          alt="Line"
          width={34}
          height={34}
        />
      ),
      href: 'https://line.me/ti/p/~@830sdfow',
      label: 'Line',
    },
    // {
    //   icon: (
    //     <Image
    //       src="https://thesvg.org/icons/discord/default.svg"
    //       alt="Discord"
    //       width={34}
    //       height={34}
    //     />
    //   ),
    //   href: '/',
    //   label: 'Discord',
    // },
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
            <address className="not-italic mt-4 text-sm leading-relaxed opacity-60">
              อีเมล: {'-'} เลขประจำตัวผู้เสียภาษี: {'-'}
            </address>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <nav aria-label="ช่องทางโซเชียลมีเดีย">
                <ul className="flex flex-wrap items-center gap-5">
                  {socialLinks.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                      >
                        {social.icon}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
        <div className="border-border mt-12 flex flex-col items-center justify-between gap-2.5 border-t pt-8 opacity-60 md:flex-row">
          <div className="order-2 md:order-1">
            <p className="text-sm">
              © {currentYear} Sitepow. All rights reserved.
            </p>
          </div>
          <nav
            aria-label="ข้อกำหนดและนโยบายความเป็นส่วนตัว"
            className="order-1 flex flex-col items-center gap-6 md:order-2 md:flex-row md:gap-8"
          >
            <ul className="flex flex-wrap justify-center gap-5 text-sm sm:gap-6">
              <li>
                <Link href="/" className="hover:underline">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:underline">
                  ข้อตกลง และเงื่อนไข
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
