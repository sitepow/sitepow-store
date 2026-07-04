import Link from 'next/link'

import { Plan } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'

import { ProtectedByBrand } from '@/components/ProtectedByBrand'
import { StoreLogo } from '@/components/StoreLogo'
import { FacebookIcon } from '@/components/icon/Facebook'
import { InstagramIcon } from '@/components/icon/Instagram'
import { TiktokIcon } from '@/components/icon/Tiktok'

export function StoreFooter() {
  const { store } = useStoreData()
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: <FacebookIcon />, href: '/', label: 'Facebook' },
    { icon: <InstagramIcon />, href: '/', label: 'Instagram' },
    { icon: <TiktokIcon />, href: '/', label: 'Tiktok' },
  ]

  return (
    <footer className="bg-background border-border text-foreground border-t">
      <div className="container mx-auto px-5 py-12">
        <div className="flex flex-col gap-10 md:flex-row">
          <div className="max-w-sm">
            {store?.logo && <StoreLogo image={store?.logo} />}
            {!store?.logo && <StoreLogo />}

            <p className="mt-4 text-sm leading-relaxed opacity-60">
              {store?.description
                ? store?.description
                : 'เราคัดสรรสินค้าคุณภาพดีในราคาที่จับต้องได้ ช้อปง่าย ได้ของไว และตั้งใจดูแลทุกออเดอร์ให้ส่งถึงมือคุณอย่างปลอดภัย'}
            </p>
            <p className="mt-4 text-sm leading-relaxed opacity-60">
              อีเมล: {store?.email || '-'} เลขประจำตัวผู้เสียภาษี:{' '}
              {store?.taxId || '-'}
            </p>
            <div className="mt-5 flex gap-5">
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

        <div className="border-border mt-12 flex flex-col items-center justify-between gap-6 border-t pt-8 opacity-60 md:flex-row">
          <div className="order-2 md:order-1">
            <p className="text-sm">
              © {currentYear} Sitepow. All rights reserved.
            </p>
          </div>

          <div className="order-1 flex flex-col items-center gap-6 md:order-2 md:flex-row md:gap-8">
            <div className="flex flex-wrap justify-center gap-5 text-sm sm:gap-6">
              <Link href="/privacy-policy" className="hover:underline">
                นโยบายความเป็นส่วนตัว
              </Link>
              <Link href="/refund-return-policy" className="hover:underline">
                ข้อตกลง และเงื่อนไข
              </Link>
            </div>
          </div>
        </div>
      </div>

      {store?.plan === Plan.FREE && <ProtectedByBrand />}
    </footer>
  )
}
