import Link from 'next/link'

import { LogoBrand } from '../LogoBrand'
import { FacebookIcon } from '../icon/Facebook'
import { GithubIcon } from '../icon/Github'
import { InstagramIcon } from '../icon/Instagram'
import { TiktokIcon } from '../icon/Tiktok'
import { TwitterIcon } from '../icon/Twitter'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: <FacebookIcon />, href: '/', label: 'Facebook' },
    { icon: <InstagramIcon />, href: '/', label: 'Instagram' },
    { icon: <TiktokIcon />, href: '/', label: 'Tiktok' },
    { icon: <TwitterIcon />, href: '/', label: 'Twitter' },
    { icon: <GithubIcon />, href: '/', label: 'Github' },
  ]

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="container mx-auto px-10 py-12">
        <div className="flex flex-col gap-10 md:flex-row">
          <div className="max-w-sm">
            <LogoBrand />
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              สร้างสรรค์ประสบการณ์ดิจิทัลที่ดีที่สุดสำหรับคุณ
              เชื่อมต่อทุกความเป็นไปได้ด้วยเทคโนโลยีที่ทันสมัย
            </p>
            <div className="mt-5 flex gap-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-colors hover:text-gray-600"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-gray-100 pt-8 md:flex-row">
          <div className="order-2 md:order-1">
            <p className="text-sm text-gray-400">
              © {currentYear} Sitepow. All rights reserved.
            </p>
          </div>

          <div className="order-1 flex flex-col items-center gap-6 md:order-2 md:flex-row md:gap-8">
            <div className="flex flex-wrap justify-center gap-5 text-sm text-gray-400 sm:gap-6">
              <Link href="/" className="hover:text-gray-600 hover:underline">
                นโยบายความเป็นส่วนตัว
              </Link>
              <Link href="/" className="hover:text-gray-600 hover:underline">
                ข้อตกลง และเงื่อนไข
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
