import { LogoBrand } from '@/components/LogoBrand'
import { FacebookIcon } from '@/components/icon/Facebook'
import { GithubIcon } from '@/components/icon/Github'
import { InstagramIcon } from '@/components/icon/Instagram'
import { TiktokIcon } from '@/components/icon/Tiktok'
import { TwitterIcon } from '@/components/icon/Twitter'

export function StoreFooter() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: <FacebookIcon />, href: '#', label: 'Facebook' },
    { icon: <InstagramIcon />, href: '#', label: 'Instagram' },
    { icon: <TiktokIcon />, href: '#', label: 'Tiktok' },
    { icon: <TwitterIcon />, href: '#', label: 'Twitter' },
    { icon: <GithubIcon />, href: '#', label: 'Github' },
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
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <a
                href="/privacy-policy"
                className="hover:text-gray-600 hover:underline"
              >
                นโยบายความเป็นส่วนตัว
              </a>
              <a
                href="/refund-return-policy"
                className="hover:text-gray-600 hover:underline"
              >
                นโยบายการคืนสินค้า
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-center gap-2.5 px-2.5">
        protected & managed by <LogoBrand />
      </div>
    </footer>
  )
}
